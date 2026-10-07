import { BadRequestException, Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { IsInt, Max, Min } from 'class-validator';
import { DataSource } from 'typeorm';
import { CurrentMembership } from '../auth/current-membership.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantMembershipGuard } from '../auth/tenant-membership.guard';
import { PerfilConexion } from '../common/enums';
import { Membership } from '../identity/identity.entities';
import { CATALOGO_PUBLICO } from './badges.catalogo';
import { BadgesService } from './badges.service';

class FijarMetaDto {
  @IsInt() @Min(1) @Max(200) objetivo!: number;
}

/**
 * La vitrina de trofeos y la meta del mes — las dos cosas de la app del
 * colaborador que salen de `badges`.
 *
 * Conexión `app`, y no hay ruta equivalente en gerencia ni en líder. Las
 * medallas de una persona se ven a través de la ficha (`/members/:id/ficha`),
 * o sea con las mismas reglas para todo el mundo. La meta del mes no se ve
 * desde ninguna otra superficie, ni siquiera a través de la ficha: es un
 * compromiso con uno mismo, y el rol de Postgres de gerencia ni siquiera tiene
 * SELECT sobre esa tabla.
 */
@Controller('tenants/:tenantId/logros')
@UseGuards(JwtAuthGuard, TenantMembershipGuard)
export class BadgesController {
  constructor(
    @InjectDataSource(PerfilConexion.APP) private readonly ds: DataSource,
    private readonly badges: BadgesService,
  ) {}

  /**
   * La vitrina: lo ganado y lo que falta, con la condición de cada una escrita.
   *
   * Se devuelve el catálogo COMPLETO, no solo lo ganado, y eso es una decisión
   * de producto: una vitrina que solo muestra lo conseguido no dice hacia dónde
   * ir. Mostrar las que faltan, con su condición en una frase, convierte una
   * repisa en un mapa. El riesgo es que se lea como una lista de deberes, así
   * que las ganadas van primero y las otras, en gris.
   */
  @Get('vitrina')
  async vitrina(@CurrentMembership() m: Membership) {
    const ganadas = await this.badges.deMiembro(m.id);
    const porClave = new Map(ganadas.map((g) => [g.clave, g.ganadaAt]));

    const trofeosArea = m.areaId
      ? await this.ds.query(
          `SELECT clave, periodo, "ganadaAt" FROM area_badges
            WHERE "areaId" = $1 ORDER BY "ganadaAt" DESC`,
          [m.areaId],
        )
      : [];

    return {
      personales: CATALOGO_PUBLICO.personales.map((c) => ({
        ...c,
        ganada: porClave.has(c.clave),
        ganadaAt: porClave.get(c.clave) ?? null,
      })),
      area: CATALOGO_PUBLICO.area.map((c) => ({
        ...c,
        veces: (trofeosArea as Array<{ clave: string }>).filter((t) => t.clave === c.clave).length,
        periodos: (trofeosArea as Array<{ clave: string; periodo: string | null }>)
          .filter((t) => t.clave === c.clave)
          .map((t) => t.periodo)
          .filter(Boolean),
      })),
      totalGanadas: ganadas.length,
      totalPersonales: CATALOGO_PUBLICO.personales.length,
    };
  }

  /**
   * La meta del mes en curso, con cuánto lleva.
   *
   * `objetivo: null` = todavía no se la puso. `puedeCambiar` es la regla del
   * día 7: se elige al entrar y se puede corregir durante la primera semana;
   * después queda fija. Sin esa fecha de corte la meta se ajustaría a lo ya
   * hecho el día 28, y entonces no sería una meta.
   */
  @Get('meta')
  async meta(@CurrentMembership() m: Membership) {
    const r = await this.ds.query(
      `WITH mes AS (SELECT date_trunc('month', now())::date AS m)
       SELECT g.objetivo, g."cumplidaAt", to_char((SELECT m FROM mes), 'YYYY-MM') AS mes,
              (SELECT count(DISTINCT mi.id)
                 FROM missions mi
            LEFT JOIN mission_collaborators c ON c."missionId" = mi.id AND c."membershipId" = $2
                WHERE mi."tenantId" = $1 AND mi.estado = 'cerrada'
                  AND mi."cerradaAt" >= (SELECT m FROM mes)
                  AND (mi."asignadoMembershipId" = $2 OR mi."aceptadaPorMembershipId" = $2 OR c.id IS NOT NULL)
              )::int AS cerradas
         FROM mes LEFT JOIN member_goals g
           ON g."membershipId" = $2 AND g.mes = (SELECT m FROM mes)`,
      [m.tenantId, m.id],
    );
    const f = r?.[0] ?? {};
    return {
      mes: f.mes ?? null,
      objetivo: f.objetivo ?? null,
      cerradas: Number(f.cerradas ?? 0),
      cumplidaAt: f.cumplidaAt ?? null,
      // 24/09: la primera vez se puede poner CUALQUIER día — «la elige el
      // primer día que entra al mes» (LVL-060 v2 §2). Lo que se corta el día 7
      // es CAMBIARLA. Antes, quien entraba el día 8 o más (o una empresa que
      // arranca a mitad de mes) no podía ponerse meta hasta el mes siguiente.
      puedeCambiar: f.objetivo == null || new Date().getDate() <= 7,
      primeraVez: f.objetivo == null,
    };
  }

  @Put('meta')
  async fijarMeta(@CurrentMembership() m: Membership, @Body() dto: FijarMetaDto) {
    // Ponerla por primera vez: cualquier día. Cambiarla: solo hasta el día 7.
    const actual = await this.ds.query(
      `SELECT 1 FROM member_goals WHERE "membershipId" = $1 AND mes = date_trunc('month', now())::date`,
      [m.id],
    );
    if (actual.length && new Date().getDate() > 7) {
      throw new BadRequestException(
        'La meta de este mes ya quedó fija: se puede cambiar solo hasta el día 7. La del mes que viene la pones el día 1.',
      );
    }
    await this.ds.query(
      `INSERT INTO member_goals ("tenantId", "membershipId", mes, objetivo)
       VALUES ($1, $2, date_trunc('month', now())::date, $3)
       ON CONFLICT ("membershipId", mes) DO UPDATE SET objetivo = EXCLUDED.objetivo, "fijadaAt" = now()`,
      [m.tenantId, m.id, dto.objetivo],
    );
    // Puede que ya la haya cumplido al ponerla (eligió 2 y lleva 3): se evalúa
    // en el acto para que no tenga que esperar a cerrar otra misión.
    // 24/09: además se evalúa el catálogo, para que la medalla «Meta cumplida»
    // aparezca en el acto y no recién al cerrar la próxima misión.
    try {
      await this.badges.cerrarMetasCumplidas(m.tenantId);
      await this.badges.evaluar(m.tenantId);
    } catch (e) { /* mejor esfuerzo, como en el cierre de misión */ }
    return this.meta(m);
  }
}
