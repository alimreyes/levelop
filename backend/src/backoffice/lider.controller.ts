import { Body, Controller, ForbiddenException, Get, Post, UseGuards } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CurrentMembership } from '../auth/current-membership.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { TenantMembershipGuard } from '../auth/tenant-membership.guard';
import { PerfilConexion, RolMembership } from '../common/enums';
import { Area, Membership } from '../identity/identity.entities';
import { HelpInteraction, HelpSignal } from '../help/help.entities';
import { RegistrarInteraccionDto } from './lider.dto';

/**
 * BackOffice de Líder de Área. Conexión `lider` — ve la excepción autorizada
 * de R-07 («Quién necesita una mano») más lo que ya no es evaluativo (quién
 * trabaja con quién, ausencias, resumen agregado del área). NO ve
 * `mission_thread_messages` ni `membership_prefs` — el rol de Postgres no
 * tiene GRANT sobre esas tablas, no es una omisión del código.
 *
 * Los cuatro paneles del Maestro §4.5 están completos desde el 14/09. El
 * cuarto, «Lo que pide tu área», usó la forma de datos que el PD entregó el
 * 03/09 (`CTO - Product Designer.md` MSG-007) — quedó sin leer 11 días por un
 * error mío, no del PD (ver LOG 14/09 tarde).
 */
@Controller('tenants/:tenantId/lider')
@UseGuards(JwtAuthGuard, TenantMembershipGuard, RolesGuard)
@Roles(RolMembership.LIDER_AREA, RolMembership.ADMIN_TENANT)
export class LiderController {
  constructor(@InjectDataSource(PerfilConexion.LIDER) private readonly ds: DataSource) {}

  /** Las áreas que este membership lidera. Casi siempre una, el esquema permite más de una. */
  private async misAreas(m: Membership): Promise<string[]> {
    const areas = await this.ds
      .getRepository(Area)
      .find({ where: { tenantId: m.tenantId, liderMembershipId: m.id } });
    if (areas.length === 0) {
      throw new ForbiddenException('Esta membresía no lidera ningún área todavía');
    }
    return areas.map((a) => a.id);
  }

  /**
   * «Quién necesita una mano». Salvaguarda 2: SOLO se puede ordenar por
   * `detectadoDesde` — no existe columna de ranking/severidad, así que no hay
   * nada más por lo que ordenar aunque se quisiera.
   *
   * 15/09/26 — antes devolvía solo el `HelpSignal` crudo (sin nombre): el rol
   * `levelop_lider` no tenía SELECT sobre `users`. Decisión de Alim: el líder
   * SÍ necesita el nombre para poder ayudar/incentivar, no solo el patrón —
   * ver la migración `NombresParaLiderDeArea`. El JOIN usa el GRANT nuevo,
   * limitado a `(id, nombre)` de `users`, nunca email ni password.
   */
  @Get('ayuda')
  async quienNecesitaUnaMano(@CurrentMembership() m: Membership) {
    const areaIds = await this.misAreas(m);
    return this.ds.query(
      `SELECT hs.*, u.nombre AS "nombreMembership"
         FROM help_signals hs
         JOIN memberships mem ON mem.id = hs."membershipId"
         JOIN users u ON u.id = mem."userId"
        WHERE hs."tenantId" = $1 AND hs."areaId" = ANY($2)
        ORDER BY hs."detectadoDesde" ASC`,
      [m.tenantId, areaIds],
    );
  }

  /**
   * Historial de lo que EL LÍDER hizo — «¿ya hablé con esta persona?».
   * `help_interactions` ya tenía GRANT SELECT para `levelop_lider` desde la
   * migración inicial; lo que faltaba era el endpoint GET, no el permiso.
   * Alcance: solo las interacciones que ESTE líder registró (no las de otros
   * líderes de otras áreas del mismo tenant, aunque el rol pudiera leerlas).
   */
  @Get('ayuda/historial')
  async historialInteracciones(@CurrentMembership() m: Membership) {
    return this.ds.getRepository(HelpInteraction).find({
      where: { tenantId: m.tenantId, liderMembershipId: m.id },
      order: { createdAt: 'DESC' },
    });
  }

  /** Salvaguarda 3, la mitad que sí puede mostrar un número: cuántos van en camino, sin nombrarlos. */
  @Get('ayuda/pendientes')
  async pendientesDeCalificar(@CurrentMembership() m: Membership) {
    const areaIds = await this.misAreas(m);
    return this.ds.query(
      `SELECT * FROM v_help_pendientes_de_calificar WHERE "tenantId" = $1 AND "areaId" = ANY($2)`,
      [m.tenantId, areaIds],
    );
  }

  /**
   * Registrar qué hizo el líder — la mitad del historial que resuelve el
   * problema de Alim sin registrar nada sobre el desempeño de la persona
   * (ver el comentario largo en `help.entities.ts`). `visibleParaPersona`
   * siempre `true`: no hay parámetro para ponerlo en `false`, y el `CHECK`
   * de la base lo rechazaría de todas formas.
   */
  @Post('ayuda/interaccion')
  async registrarInteraccion(
    @CurrentMembership() m: Membership,
    @Body() dto: RegistrarInteraccionDto,
  ) {
    const signal = await this.ds.getRepository(HelpSignal).findOne({
      where: { tenantId: m.tenantId, membershipId: dto.membershipId },
    });
    if (!signal) throw new ForbiddenException('No hay un patrón vigente para esa persona');

    const retencionDias = Number(process.env.HELP_HISTORIAL_RETENCION_DIAS ?? 90);
    const repo = this.ds.getRepository(HelpInteraction);
    return repo.save(
      repo.create({
        tenantId: m.tenantId,
        membershipId: dto.membershipId,
        liderMembershipId: m.id,
        patron: signal.patron,
        tipo: dto.tipo,
        nota: dto.nota ?? null,
        visibleParaPersona: true,
        expiraAt: new Date(Date.now() + retencionDias * 86400000),
      }),
    );
  }

  /**
   * «Quién trabaja con quién» — revela aislamiento, no bajo desempeño.
   * 15/09/26: agregado `u.nombre` (mismo GRANT nuevo que `ayuda`).
   */
  @Get('colaboracion')
  async colaboracion(@CurrentMembership() m: Membership) {
    const areaIds = await this.misAreas(m);
    return this.ds.query(
      `SELECT mem.id AS "membershipId", u.nombre AS "nombreMembership",
              count(DISTINCT mc2."membershipId")
                FILTER (WHERE mc2."membershipId" IS DISTINCT FROM mem.id) AS colaboradores
         FROM memberships mem
         JOIN users u ON u.id = mem."userId"
         LEFT JOIN mission_collaborators mc1 ON mc1."membershipId" = mem.id
         LEFT JOIN mission_collaborators mc2 ON mc2."missionId" = mc1."missionId"
        WHERE mem."areaId" = ANY($1) AND mem.activo
        GROUP BY mem.id, u.nombre
        ORDER BY colaboradores ASC`,
      [areaIds],
    );
  }

  /**
   * «Quién no va a estar» — ausencias ya aprobadas, sin poder revocarlas.
   * 15/09/26: agregado `u.nombre` (mismo GRANT nuevo que `ayuda`).
   */
  @Get('ausencias')
  async ausencias(@CurrentMembership() m: Membership) {
    const areaIds = await this.misAreas(m);
    return this.ds.query(
      `SELECT v.*, u.nombre AS "nombreMembership"
         FROM v_ausencias_programadas v
         JOIN memberships mem ON mem.id = v."membershipId"
         JOIN users u ON u.id = mem."userId"
        WHERE v."tenantId" = $1 AND v."areaId" = ANY($2)`,
      [m.tenantId, areaIds],
    );
  }

  /** Mismo agregado por área que gerencia — sin nombre, con el piso de 4 miembros. */
  @Get('resumen-area')
  async resumenArea(@CurrentMembership() m: Membership) {
    const areaIds = await this.misAreas(m);
    return this.ds.query(`SELECT * FROM v_resumen_area WHERE "areaId" = ANY($1)`, [areaIds]);
  }

  /**
   * «Lo que pide tu área» — cuarto panel, forma de datos de
   * `CTO - Product Designer.md` MSG-007 (03/09), confirmada como lectura pura
   * en mi MSG-008 (14/09): sin cola de priorización, sin acción — dos
   * lecturas sobre los mismos eventos de canje, ventana de 30 días.
   *
   * Reutilizo `v_resumen_area` para el piso de 4 miembros en vez de
   * recalcularlo aquí — una sola fuente de verdad para esa salvaguarda de
   * R-07, no dos implementaciones que puedan divergir. Por debajo del piso,
   * el área aparece igual (como en `resumen-area`) pero sin `masPedido`.
   */
  @Get('lo-que-pide-tu-area')
  async loQuePideTuArea(@CurrentMembership() m: Membership) {
    const areaIds = await this.misAreas(m);

    const resumen = await this.ds.query(
      `SELECT "areaId", "nombreArea", "miembrosActivos", "mostrarDesempeno"
         FROM v_resumen_area WHERE "areaId" = ANY($1)`,
      [areaIds],
    );

    const areasConPiso = resumen
      .filter((a: { mostrarDesempeno: boolean }) => a.mostrarDesempeno)
      .map((a: { areaId: string }) => a.areaId);

    let demanda: Array<{ areaId: string; nombreItem: string; canjes: number }> = [];
    let norma: Array<{ nombreItem: string; promedioOtrasAreas: string }> = [];

    if (areasConPiso.length > 0) {
      // «Más pedido en tu área»: conteo de canjes por ítem, últimos 30 días.
      demanda = await this.ds.query(
        `SELECT mm."areaId", bci.nombre AS "nombreItem", count(*)::int AS canjes
           FROM redemptions r
           JOIN memberships mm ON mm.id = r."membershipId"
           JOIN benefit_catalog_items bci ON bci.id = r."itemId"
          WHERE mm."areaId" = ANY($1) AND r."createdAt" > now() - interval '30 days'
          GROUP BY mm."areaId", bci.nombre
          ORDER BY mm."areaId", canjes DESC`,
        [areasConPiso],
      );

      // «Dónde tu área se sale de la norma»: mismo conteo, promediado sobre
      // el resto de las áreas del tenant (excluye las que lidera esta
      // persona) en la misma ventana — el frontend calcula el delta contra
      // esto, no lo calculo yo para no imponer un umbral de "se sale mucho"
      // que es una decisión de producto, no de datos.
      norma = await this.ds.query(
        `SELECT bci.nombre AS "nombreItem", AVG(sub.canjes)::numeric(10,2) AS "promedioOtrasAreas"
           FROM (
             SELECT mm."areaId", r."itemId", count(*)::int AS canjes
               FROM redemptions r
               JOIN memberships mm ON mm.id = r."membershipId"
              WHERE mm."tenantId" = $1 AND mm."areaId" IS NOT NULL
                AND NOT (mm."areaId" = ANY($2))
                AND r."createdAt" > now() - interval '30 days'
              GROUP BY mm."areaId", r."itemId"
           ) sub
           JOIN benefit_catalog_items bci ON bci.id = sub."itemId"
          GROUP BY bci.nombre`,
        [m.tenantId, areasConPiso],
      );
    }

    return resumen.map((a: { areaId: string; nombreArea: string; miembrosActivos: number; mostrarDesempeno: boolean }) => ({
      areaId: a.areaId,
      nombreArea: a.nombreArea,
      miembrosActivos: a.miembrosActivos,
      mostrarDemanda: a.mostrarDesempeno,
      masPedido: a.mostrarDesempeno
        ? demanda
            .filter((d) => d.areaId === a.areaId)
            .map((d) => ({
              nombreItem: d.nombreItem,
              canjes: d.canjes,
              promedioOtrasAreas: Number(
                norma.find((n) => n.nombreItem === d.nombreItem)?.promedioOtrasAreas ?? 0,
              ),
            }))
        : [],
    }));
  }
}
