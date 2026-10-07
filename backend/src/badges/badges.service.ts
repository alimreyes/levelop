import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PerfilConexion } from '../common/enums';
import { MEDALLAS_PERSONALES, TROFEOS_AREA } from './badges.catalogo';

/**
 * =============================================================================
 * EVALUADOR DE MEDALLAS — 19/09/26
 * =============================================================================
 *
 * Corre las 25 consultas del catálogo e inserta lo que falte. Nada más.
 *
 * ES IDEMPOTENTE POR CONSTRUCCIÓN, NO POR CUIDADO. Cada consulta devuelve
 * quiénes CUMPLEN la condición hoy —no quiénes la cumplieron desde la última
 * vez— y el `ON CONFLICT DO NOTHING` contra la UNIQUE de la tabla descarta lo
 * ya otorgado. Correrlo mil veces da el mismo resultado que correrlo una, y no
 * hace falta llevar registro de la última corrida ni de una marca de agua.
 *
 * Es el mismo criterio que la clave de idempotencia del canje: preferir que la
 * repetición sea imposible por el modelo antes que correcta por disciplina. La
 * disciplina se olvida; la constraint no.
 *
 * CUÁNDO CORRE: después de cerrar una misión, de confirmar un canje, y al
 * cambiar de mes. Siempre en «mejor esfuerzo»: si falla, la misión ya se cerró
 * y el Oro ya se pagó. Una medalla que no se otorgó se otorga en la próxima
 * evaluación; tumbar el cierre de una misión por una medalla sería invertir
 * las prioridades.
 *
 * POR QUÉ NO ES UN TRIGGER DE POSTGRES: porque estas reglas cambian con el
 * producto, y un trigger las esconde. Cuando alguien pregunte «¿por qué gané
 * esto?», la respuesta tiene que estar en un archivo que se lee, no en un
 * objeto de la base que hay que ir a buscar.
 */
@Injectable()
export class BadgesService implements OnApplicationBootstrap {
  private readonly log = new Logger(BadgesService.name);

  /** Piso de miembros activos para los trofeos de área. Ver la nota del catálogo. */
  private static readonly PISO_AREA = 4;

  constructor(@InjectDataSource(PerfilConexion.APP) private readonly ds: DataSource) {}

  /**
   * Evalúa todo el catálogo para un tenant. Devuelve lo NUEVO, para que quien
   * lo llame pueda avisarle a la gente sin volver a consultar.
   */
  async evaluar(tenantId: string): Promise<{
    personales: Array<{ membershipId: string; clave: string }>;
    area: Array<{ areaId: string; clave: string; periodo: string | null }>;
  }> {
    const personales: Array<{ membershipId: string; clave: string }> = [];
    const area: Array<{ areaId: string; clave: string; periodo: string | null }> = [];

    for (const m of MEDALLAS_PERSONALES) {
      try {
        const nuevas = await this.ds.query(
          `INSERT INTO member_badges ("tenantId", "membershipId", clave)
           SELECT $1, q."membershipId", $2 FROM (${m.sql}) q
           ON CONFLICT ("membershipId", clave) DO NOTHING
           RETURNING "membershipId"`,
          [tenantId, m.clave],
        );
        for (const f of nuevas as Array<{ membershipId: string }>) {
          personales.push({ membershipId: f.membershipId, clave: m.clave });
        }
      } catch (e) {
        // Una medalla rota no puede tumbar a las otras 24.
        this.log.error(`Medalla ${m.clave}: ${(e as Error).message}`);
      }
    }

    for (const t of TROFEOS_AREA) {
      try {
        // ⚠️ OJO CON LA NUMERACIÓN DE PARÁMETROS — bug encontrado el 19/09 al
        // ejecutar esto contra un Postgres real por primera vez.
        //
        // Estaba escrito con `$2` para la clave en el INSERT de afuera. Pero el
        // SQL del catálogo que va embebido USA TAMBIÉN `$1` y `$2` (tenant y
        // piso), y los marcadores no se anidan: son de la consulta completa.
        // O sea que el `$2` de afuera y el `$2` del catálogo eran el mismo, y
        // el piso de miembros terminaba recibiendo el nombre de la medalla.
        //
        // TypeScript no puede ver esto: para él son dos strings que se
        // concatenan. Compilaba perfecto y reventaba en la primera corrida con
        // «bind message supplies 3 parameters, but prepared statement requires
        // 2». Por eso la clave va en `$3`: los dos primeros son del catálogo.
        const nuevos = await this.ds.query(
          `INSERT INTO area_badges ("tenantId", "areaId", clave, periodo)
           SELECT $1, q."areaId", $3, ${t.porPeriodo ? 'q.periodo' : 'NULL'}
             FROM (${t.sql}) q
            WHERE q."areaId" IS NOT NULL
           ON CONFLICT ("areaId", clave, COALESCE(periodo, '')) DO NOTHING
           RETURNING "areaId", periodo`,
          [tenantId, BadgesService.PISO_AREA, t.clave],
        );
        for (const f of nuevos as Array<{ areaId: string; periodo: string | null }>) {
          area.push({ areaId: f.areaId, clave: t.clave, periodo: f.periodo });
        }
      } catch (e) {
        this.log.error(`Trofeo ${t.clave}: ${(e as Error).message}`);
      }
    }

    if (personales.length || area.length) {
      this.log.log(`Medallas ${tenantId}: ${personales.length} personales, ${area.length} de área`);
    }
    return { personales, area };
  }

  /**
   * 24/09 — Evaluación de TODAS las empresas, una vez por día y al arrancar.
   *
   * Hacía falta por dos motivos. Uno: los trofeos de período («Área puntual»,
   * «Área impecable», «Racha de área», «Buenos vecinos») solo se otorgan sobre
   * meses o trimestres TERMINADOS, y el mes termina sin que nadie cierre una
   * misión; sin esta corrida, el trofeo de septiembre esperaría a que alguien
   * cierre algo en octubre. Dos: al desplegar, lo ya hecho antes de que
   * existieran las medallas se reconoce solo, sin script.
   *
   * 04:10 UTC = 00:10 en Caracas: recién cambiado el día allá.
   * Es idempotente (ver la nota de arriba), así que correrla de más no daña.
   */
  @Cron('10 4 * * *')
  async evaluarTodas(): Promise<void> {
    const tenants: Array<{ id: string }> = await this.ds.query(
      `SELECT DISTINCT "tenantId" AS id FROM memberships WHERE activo`,
    );
    for (const t of tenants) {
      try {
        await this.cerrarMetasCumplidas(t.id);
        await this.evaluar(t.id);
      } catch (e) {
        this.log.error(`Evaluación diaria ${t.id}: ${(e as Error).message}`);
      }
    }
  }

  onApplicationBootstrap(): void {
    // Sin await: el arranque no espera a las medallas.
    this.evaluarTodas().catch((e) => this.log.error(`Evaluación al arrancar: ${e.message}`));
  }

  /** Para llamar sin bloquear la respuesta (canjes). Nunca lanza. */
  evaluarSilencioso(tenantId: string): void {
    this.cerrarMetasCumplidas(tenantId)
      .then(() => this.evaluar(tenantId))
      .catch((e) => this.log.error(`Evaluación ${tenantId}: ${(e as Error).message}`));
  }

  /** Lo ganado por una persona, para su ficha y su vitrina. */
  async deMiembro(membershipId: string): Promise<Array<{ clave: string; ganadaAt: Date }>> {
    return this.ds.query(
      `SELECT clave, "ganadaAt" FROM member_badges WHERE "membershipId" = $1 ORDER BY "ganadaAt"`,
      [membershipId],
    );
  }

  /**
   * Marca como cumplidas las metas del mes que ya se alcanzaron.
   *
   * Se ejecuta antes de evaluar las medallas, porque tres de ellas
   * (trimestre, medio año, año) leen `cumplidaAt`. El orden importa: al revés,
   * la racha siempre iría un mes atrasada.
   *
   * Cuenta misiones CERRADAS dentro del mes de la meta, con el mismo criterio
   * de «suyas» que el resto del sistema.
   */
  async cerrarMetasCumplidas(tenantId: string): Promise<number> {
    const r = await this.ds.query(
      `WITH conteo AS (
         SELECT g.id, count(DISTINCT m.id) AS cerradas, g.objetivo
           FROM member_goals g
           LEFT JOIN mission_collaborators c ON c."membershipId" = g."membershipId"
           LEFT JOIN missions m
             ON m."tenantId" = g."tenantId"
            AND m.estado = 'cerrada'
            AND m."cerradaAt" >= g.mes
            AND m."cerradaAt" < (g.mes + interval '1 month')
            AND (m."asignadoMembershipId" = g."membershipId"
                 OR m."aceptadaPorMembershipId" = g."membershipId"
                 OR c."missionId" = m.id)
          WHERE g."tenantId" = $1 AND g."cumplidaAt" IS NULL
          GROUP BY g.id, g.objetivo
       )
       UPDATE member_goals g SET "cumplidaAt" = now()
         FROM conteo WHERE g.id = conteo.id AND conteo.cerradas >= conteo.objetivo
       RETURNING g.id`,
      [tenantId],
    );
    return Array.isArray(r) ? r.length : 0;
  }
}
