import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { IsIn, IsString } from 'class-validator';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CurrentMembership } from '../auth/current-membership.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantMembershipGuard } from '../auth/tenant-membership.guard';
import { PerfilConexion } from '../common/enums';
import { Membership } from './identity.entities';
import { CATALOGO_PUBLICO } from '../badges/badges.catalogo';
import { CLAVES_VALIDAS, ELENCO } from './personajes.catalogo';

class ElegirPersonajeDto {
  @IsString() @IsIn([...CLAVES_VALIDAS]) personaje!: string;
}

/**
 * =============================================================================
 * MIEMBROS DEL TENANT — la lista de compañeros, vista desde la app del empleado
 * =============================================================================
 *
 * 16/09/26. Hasta hoy la app no tenía forma de convertir un `membershipId` en
 * un nombre, ni de ofrecer a quién sugerir una misión: `asignadoMembershipId`
 * existía en el DTO desde el 14/09 pero ninguna pantalla podía llenarlo porque
 * no había de dónde elegir. Esta ruta devuelve exactamente lo que un compañero
 * ya sabe de otro por trabajar en la misma empresa: nombre, área y rol.
 *
 * QUÉ NO DEVUELVE, A PROPÓSITO: email, zona, si tiene el juego apagado, saldo,
 * XP, nivel, ni ninguna preferencia. Nada de eso es "público entre pares" —
 * el ranking (`/economy/ranking`) es la única superficie entre compañeros que
 * muestra XP, y solo de quien participa voluntariamente.
 *
 * ¿Y R-07? No aplica: R-07 restringe superficies de GESTIÓN (gerencia/líder
 * viendo a su gente). Esto es la app del empleado, con la conexión `app`,
 * mostrando a un empleado quiénes son sus compañeros — lo mismo que ve en
 * el directorio de cualquier empresa. Solo se listan membresías activas.
 */
@Controller('tenants/:tenantId/members')
@UseGuards(JwtAuthGuard, TenantMembershipGuard)
export class MembersController {
  constructor(@InjectDataSource(PerfilConexion.APP) private readonly ds: DataSource) {}

  @Get()
  async listar(@CurrentMembership() m: Membership) {
    const filas: Array<{
      membershipId: string;
      nombre: string;
      rol: string;
      areaId: string | null;
      areaNombre: string | null;
      areaColor: string | null;
      areaIndice: number | null;
      personaje: string | null;
    }> = await this.ds.query(
      `SELECT mem.id        AS "membershipId",
              u.nombre      AS "nombre",
              mem.rol       AS "rol",
              mem."areaId"  AS "areaId",
              a.nombre      AS "areaNombre",
              mem.personaje AS "personaje",
              a.color       AS "areaColor",
              ax.idx        AS "areaIndice"
         FROM memberships mem
         JOIN users u ON u.id = mem."userId"
    LEFT JOIN areas a ON a.id = mem."areaId"
    LEFT JOIN (SELECT id, (row_number() OVER (PARTITION BY "tenantId" ORDER BY "createdAt", id) - 1) AS idx
                      FROM areas) ax ON ax.id = a.id
        WHERE mem."tenantId" = $1 AND mem.activo
     ORDER BY u.nombre ASC`,
      [m.tenantId],
    );
    return filas;
  }

  /**
   * ===========================================================================
   * FICHA DE UNA PERSONA (19/09/26 — CAMBIOS 1.1)
   * ===========================================================================
   *
   * Un solo endpoint para tres pantallas: la ficha que abre un compañero desde
   * el ranking, la que ve la propia persona en su perfil, y la que abre el
   * líder al tocar a alguien de su área. Que sea el mismo no es ahorro de
   * código: es la regla, hecha verificable.
   *
   * LA REGLA: **el líder no ve de su gente nada que la persona no vea de sí
   * misma.** Con tres endpoints distintos esa promesa hay que creerla; con uno
   * solo, cualquiera abre las dos pantallas y compara. Una promesa auditable
   * vale más que una declarada.
   *
   * LO QUE NO DEVUELVE, Y POR QUÉ IMPORTA MÁS QUE LO QUE SÍ:
   *
   *  - `optInJuego`. Alim pidió mostrar «si está jugando o no». No va, y no es
   *    una omisión: es R-03. El CEO lo dejó en una frase — «si el jefe puede
   *    ver quién apagó el juego, el opt-out no es voluntario aunque el código
   *    diga que sí». Un opt-out que los demás ven es una declaración pública,
   *    no una preferencia.
   *
   *  - Saldo de Oro, email y zona. Nada de eso es «público entre pares»; el
   *    ranking (XP) es la única superficie entre compañeros que expone
   *    economía, y solo de quien participa.
   *
   * INDISTINGUIBILIDAD — la parte sutil. Si alguien tiene el juego apagado o
   * salió del ranking, la ficha devuelve `juego: null`. Pero eso **también** es
   * lo que devuelve para alguien recién entrado que todavía no cerró nada. Las
   * dos situaciones se ven idénticas desde afuera, a propósito: si «sin datos»
   * significara siempre «apagó el juego», habría reconstruido el dato que la
   * regla anterior protege, por la puerta de atrás. Devolver menos no alcanza;
   * hay que devolver algo que no permita distinguir.
   *
   * R-07: esto corre sobre la conexión `app`, no sobre la de gerencia ni la de
   * líder. Gerencia no puede llamarlo porque su superficie no tiene esta ruta,
   * y aunque la tuviera su rol de Postgres no lee `membership_prefs`. El panel
   * del líder sí lo consume — con el mismo JWT de su membresía, o sea como un
   * compañero más, viendo exactamente lo que vería cualquiera.
   */
  @Get(':membershipId/ficha')
  async ficha(
    @CurrentMembership() yo: Membership,
    @Param('membershipId', ParseUUIDPipe) membershipId: string,
  ) {
    const base: Array<{
      membershipId: string;
      nombre: string;
      rol: string;
      areaId: string | null;
      areaNombre: string | null;
      areaColor: string | null;
      areaIndice: number | null;
      personaje: string | null;
      desde: string;
      participa: boolean;
    }> = await this.ds.query(
      `SELECT mem.id AS "membershipId", u.nombre, mem.rol,
              mem."areaId", a.nombre AS "areaNombre", a.color AS "areaColor", ax.idx AS "areaIndice",
              mem.personaje AS "personaje",
              mem."createdAt" AS desde,
              (mem."optInJuego" AND COALESCE(mp."participaEnRanking", true)) AS participa
         FROM memberships mem
         JOIN users u ON u.id = mem."userId"
    LEFT JOIN areas a ON a.id = mem."areaId"
    LEFT JOIN (SELECT id, (row_number() OVER (PARTITION BY "tenantId" ORDER BY "createdAt", id) - 1) AS idx
                 FROM areas) ax ON ax.id = a.id
    LEFT JOIN membership_prefs mp ON mp."membershipId" = mem.id
        WHERE mem.id = $1 AND mem."tenantId" = $2 AND mem.activo`,
      [membershipId, yo.tenantId],
    );
    if (!base.length) throw new NotFoundException('Esa persona no está en la empresa');
    const p = base[0];

    const admin = {
      membershipId: p.membershipId,
      nombre: p.nombre,
      rol: p.rol,
      areaId: p.areaId,
      areaNombre: p.areaNombre,
      areaColor: p.areaColor,
      areaIndice: p.areaIndice,
      /* El personaje va en la parte administrativa y no dentro de `juego`:
         se ve aunque la persona tenga el juego apagado, igual que su nombre y
         su área. Es un avatar, no una estadística. */
      personaje: p.personaje,
      desde: p.desde,
    };

    // Ver el comentario de indistinguibilidad: `juego: null` cubre tanto a
    // quien no participa como a quien todavía no tiene nada que mostrar.
    if (!p.participa) return { ...admin, juego: null };

    const [posiciones, nivel, stats, medallas] = await Promise.all([
      /* 07/10 — BUG REAL, encontrado mirando la pantalla: el Perfil decía
         «Puesto general #1» mientras el Ranking de la misma persona decía #2.
         La culpa era de esta consulta, y estaba acá desde el 19/09.

         `WHERE` corre ANTES que las funciones de ventana. Al escribir
         `... RANK() OVER (ORDER BY xp DESC) FROM base WHERE id = $2`, la
         ventana no ve la tabla entera: ve UNA fila, la de esta persona, y el
         rango de una sola fila siempre es 1. O sea que la ficha le decía a
         todo el mundo que iba primero — incluido el último.

         Lo que no falló nunca fue `totalGeneral`, porque es un subselect sobre
         `base` y no una ventana; por eso daba 7 de 7 y el error pasaba
         desapercibido: el número grande estaba bien.

         La forma correcta es calcular los rangos sobre TODA la tabla en un CTE
         aparte y recién después quedarse con la fila que interesa. */
      this.ds.query(
        `WITH base AS (
           SELECT mem.id, mem."areaId", COALESCE(eb.xp, 0)::int AS xp
             FROM memberships mem
             LEFT JOIN economy_balances eb ON eb."membershipId" = mem.id
             LEFT JOIN membership_prefs mp ON mp."membershipId" = mem.id
            WHERE mem."tenantId" = $1 AND mem.activo AND mem."optInJuego"
              AND COALESCE(mp."participaEnRanking", true)
         ),
         rangos AS (
           SELECT id, "areaId",
                  RANK() OVER (ORDER BY xp DESC)::int                       AS general,
                  RANK() OVER (PARTITION BY "areaId" ORDER BY xp DESC)::int AS "enArea"
             FROM base
         )
         SELECT r.general, r."enArea",
                (SELECT count(*) FROM base)::int                                   AS "totalGeneral",
                (SELECT count(*) FROM base b2 WHERE b2."areaId" IS NOT DISTINCT FROM r."areaId")::int AS "totalArea"
           FROM rangos r WHERE r.id = $2`,
        [yo.tenantId, membershipId],
      ),
      this.ds.query(
        `SELECT COALESCE(xp, 0)::int AS xp, COALESCE(nivel, 1)::int AS nivel
           FROM economy_balances WHERE "membershipId" = $1`,
        [membershipId],
      ),
      this.statsDe(yo.tenantId, membershipId, p.areaId),
      this.ds.query(
        `SELECT clave, "ganadaAt" FROM member_badges WHERE "membershipId" = $1 ORDER BY "ganadaAt"`,
        [membershipId],
      ),
    ]);

    return {
      ...admin,
      juego: {
        xp: nivel?.[0]?.xp ?? 0,
        nivel: nivel?.[0]?.nivel ?? 1,
        puestoGeneral: posiciones?.[0]?.general ?? null,
        totalGeneral: posiciones?.[0]?.totalGeneral ?? null,
        puestoArea: p.areaId ? posiciones?.[0]?.enArea ?? null : null,
        totalArea: p.areaId ? posiciones?.[0]?.totalArea ?? null : null,
        /* El nombre se resuelve acá contra el catálogo en código: la tabla
           guarda la clave, que es un identificador y no algo que mostrarle a
           nadie. Si mañana una medalla desaparece del catálogo, su fila sigue
           existiendo y simplemente no se lista — a nadie se le quita lo que
           ganó porque cambiamos de opinión. */
        medallas: (medallas as Array<{ clave: string; ganadaAt: Date }>)
          .map((g) => {
            const c = CATALOGO_PUBLICO.personales.find((x) => x.clave === g.clave);
            return c ? { ...c, ganadaAt: g.ganadaAt } : null;
          })
          .filter(Boolean),
        stats,
      },
    };
  }

  /**
   * Los «stats de juego» que pidió Alim. Todos salen de `missions`, sin tabla
   * nueva y sin nada que no sea observable: cuántas cerró, qué tan rápido, con
   * cuántas áreas se cruzó, en cuántas está metida ahora.
   *
   * «Participa en» cuenta las tres formas de estar en una misión: te la
   * asignaron, la aceptaste, o te sumaron como colaborador. Antes del 19/09 la
   * tercera no existía como dato cargable desde la app, así que este número
   * recién ahora dice la verdad.
   *
   * El tiempo de resolución se mide de `aceptadaAt` a `cerradaAt`, no de la
   * creación: el reloj de una persona empieza cuando la agarra, no cuando
   * alguien la escribió. Contar la espera previa como tiempo suyo sería
   * medirle algo que no controla.
   */
  private async statsDe(tenantId: string, membershipId: string, areaId: string | null) {
    const r = await this.ds.query(
      `WITH suyas AS (
         SELECT DISTINCT m.*
           FROM missions m
      LEFT JOIN mission_collaborators c ON c."missionId" = m.id AND c."membershipId" = $2
          WHERE m."tenantId" = $1
            AND (m."asignadoMembershipId" = $2 OR m."aceptadaPorMembershipId" = $2 OR c.id IS NOT NULL)
       )
       SELECT
         (SELECT count(*) FROM suyas WHERE estado = 'cerrada'
            AND "cerradaAt" >= now() - interval '7 days')::int                       AS "cerradasSemana",
         (SELECT count(*) FROM suyas WHERE estado = 'cerrada')::int                  AS "cerradasTotal",
         (SELECT count(*) FROM suyas
           WHERE estado IN ('abierta','aceptada','en_progreso','entregada'))::int    AS "enCurso",
         (SELECT round(avg(EXTRACT(EPOCH FROM ("cerradaAt" - "aceptadaAt")) / 86400)::numeric, 1)
            FROM suyas WHERE estado = 'cerrada' AND "aceptadaAt" IS NOT NULL
                       AND "cerradaAt" IS NOT NULL)                                  AS "diasPromedio",
         (SELECT count(DISTINCT "areaId") FROM suyas
           WHERE "areaId" IS NOT NULL AND "areaId" IS DISTINCT FROM $3::uuid)::int   AS "areasCruzadas"`,
      [tenantId, membershipId, areaId],
    );
    const f = r?.[0] ?? {};
    return {
      cerradasSemana: Number(f.cerradasSemana ?? 0),
      cerradasTotal: Number(f.cerradasTotal ?? 0),
      enCurso: Number(f.enCurso ?? 0),
      diasPromedio: f.diasPromedio === null || f.diasPromedio === undefined ? null : Number(f.diasPromedio),
      areasCruzadas: Number(f.areasCruzadas ?? 0),
    };
  }

  // ===========================================================================
  // EL PERSONAJE (07/10/26 — «Batch de Cambios»)
  // ===========================================================================

  /**
   * El elenco, el personaje actual y si se puede cambiar hoy.
   *
   * `puedeCambiar` y `faltanDias` los calcula el SERVIDOR, no la pantalla. Es
   * la misma regla que el nivel mínimo de un beneficio: la interfaz puede
   * mostrar el botón apagado por cortesía, pero quien decide es el backend,
   * porque un bloqueo que vive en el navegador no es un bloqueo.
   */
  @Get('mi-personaje')
  async miPersonaje(@CurrentMembership() m: Membership) {
    const dias = await this.diasDeBloqueo(m.tenantId);
    const estado = this.estadoDeCambio(m.personajeCambiadoAt, dias);
    return {
      elenco: ELENCO,
      personaje: m.personaje ?? null,
      cambiadoAt: m.personajeCambiadoAt ?? null,
      diasBloqueo: dias,
      ...estado,
    };
  }

  /**
   * Elegir o cambiar de personaje.
   *
   * LA PRIMERA ELECCIÓN NUNCA ESTÁ BLOQUEADA. Quien nunca eligió no tiene
   * `personajeCambiadoAt`, así que no hay fecha contra la cual bloquear. Eso
   * sale solo de la forma de los datos y no hace falta un caso especial: es
   * también lo que el `GTD` pedía como opción (b) en su §2.
   *
   * ELEGIR EL MISMO QUE YA TENÍAS NO CONSUME EL BLOQUEO. Alguien que abre la
   * pantalla, toca su propio personaje y guarda no debería quedar atado 30
   * días por no haber cambiado nada.
   *
   * El reloj corre aunque la persona apague el juego, porque se compara contra
   * una fecha y no contra actividad — era una de las tres precisiones que pidió
   * el `GTD`, y sale gratis con este diseño.
   */
  @Put('mi-personaje')
  async elegirPersonaje(@CurrentMembership() m: Membership, @Body() dto: ElegirPersonajeDto) {
    if (!CLAVES_VALIDAS.has(dto.personaje)) {
      throw new BadRequestException('Ese personaje no existe');
    }
    if (m.personaje === dto.personaje) {
      return this.miPersonaje(m);
    }

    const dias = await this.diasDeBloqueo(m.tenantId);
    const estado = this.estadoDeCambio(m.personajeCambiadoAt, dias);
    if (!estado.puedeCambiar) {
      throw new BadRequestException({
        motivoRechazo: 'PERSONAJE_BLOQUEADO',
        message: `Puedes volver a cambiar de personaje en ${estado.faltanDias} día${estado.faltanDias === 1 ? '' : 's'}.`,
      });
    }

    await this.ds.query(
      `UPDATE memberships SET personaje = $1, "personajeCambiadoAt" = now()
        WHERE id = $2 AND "tenantId" = $3`,
      [dto.personaje, m.id, m.tenantId],
    );
    // El objeto en memoria es el de ESTA petición; se actualiza para que la
    // respuesta refleje lo que acaba de pasar y no el estado anterior.
    m.personaje = dto.personaje;
    m.personajeCambiadoAt = new Date();
    return this.miPersonaje(m);
  }

  private async diasDeBloqueo(tenantId: string): Promise<number> {
    const r = await this.ds.query(
      `SELECT "diasBloqueoPersonaje" AS dias FROM economy_config
        WHERE "tenantId" = $1 AND "vigenteHasta" IS NULL
     ORDER BY "vigenteDesde" DESC LIMIT 1`,
      [tenantId],
    );
    return Number(r?.[0]?.dias ?? 30);
  }

  private estadoDeCambio(
    cambiadoAt: Date | null,
    diasBloqueo: number,
  ): { puedeCambiar: boolean; faltanDias: number; proximoCambio: string | null } {
    if (!cambiadoAt || diasBloqueo <= 0) {
      return { puedeCambiar: true, faltanDias: 0, proximoCambio: null };
    }
    const proximo = new Date(new Date(cambiadoAt).getTime() + diasBloqueo * 86400000);
    const faltan = Math.ceil((proximo.getTime() - Date.now()) / 86400000);
    return {
      puedeCambiar: faltan <= 0,
      faltanDias: Math.max(0, faltan),
      proximoCambio: proximo.toISOString(),
    };
  }
}
