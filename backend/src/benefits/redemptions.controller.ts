import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CurrentMembership } from '../auth/current-membership.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { TenantMembershipGuard } from '../auth/tenant-membership.guard';
import { PerfilConexion, RolMembership } from '../common/enums';
import { EconomyService } from '../economy/economy.service';
import { Membership } from '../identity/identity.entities';
import { Redemption } from './benefits.entities';
import { SolicitarCanjeDto } from './redemptions.dto';
import { BadgesService } from '../badges/badges.service';
import { CanjeNoEncontradoError, RedemptionsService, TransicionInvalidaError } from './redemptions.service';

@Controller('tenants/:tenantId')
@UseGuards(JwtAuthGuard, TenantMembershipGuard)
export class RedemptionsController {
  constructor(
    @InjectDataSource(PerfilConexion.APP) private readonly ds: DataSource,
    private readonly redemptions: RedemptionsService,
    private readonly economy: EconomyService,
    private readonly badges: BadgesService,
  ) {}

  /** Catálogo filtrado por zona — mostrarle a alguien de Maracaibo algo de Caracas es una burla. */
  @Get('catalog')
  async catalogo(@CurrentMembership() m: Membership) {
    // 17/09: además del ítem, cuántos cupos quedan este mes ("quedan 4 de 8").
    // `cuposDisponibles` = null significa sin límite. La fila del mes puede no
    // existir todavía (se crea al primer canje): en ese caso quedan todos.
    const filas: Array<Record<string, unknown> & { nivelMinimo: number | null }> = await this.ds.query(
      `SELECT i.*,
              CASE
                WHEN s.id IS NOT NULL THEN GREATEST(0, s."cuposTotales" - s."cuposReservados" - s."cuposConsumidos")
                WHEN i."cuposMensuales" IS NOT NULL THEN i."cuposMensuales"
                ELSE NULL
              END AS "cuposDisponibles",
              CASE
                WHEN s.id IS NOT NULL THEN s."cuposTotales"
                ELSE i."cuposMensuales"
              END AS "cuposTotales"
         FROM benefit_catalog_items i
    LEFT JOIN benefit_stock s
           ON s."itemId" = i.id AND now() BETWEEN s."periodoInicio" AND s."periodoFin"
        WHERE i."tenantId" = $1 AND i.activo = true
          AND (i.zonas = '{}' OR $2 = ANY(i.zonas))
     ORDER BY i.familia, i."precioOro"`,
      [m.tenantId, m.zona],
    );

    // 17/09 (tarde): el ítem bloqueado por nivel necesita decir CUÁNTA XP falta,
    // no solo "desde nivel 3". El umbral depende de `economy_config`, que la app
    // no tiene ni debería tener, así que se resuelve acá: una consulta de
    // configuración para todo el catálogo, y la pantalla resta contra la XP que
    // ya recibe de `mi-progreso`. Si el CFO cambia la fórmula, el candado se
    // mueve solo.
    const cfg = await this.economy.configDe(m.tenantId);
    return filas.map((f) => ({
      ...f,
      xpMinima: f.nivelMinimo == null ? null : this.economy.umbralXp(cfg, f.nivelMinimo),
    }));
  }

  /**
   * 19/09 — además del canje, cuándo vence y el nombre del ítem.
   *
   * `diasParaVencer` es null cuando no aplica: porque la empresa puso 0 (sin
   * vencimiento), porque el canje todavía no está confirmado, o porque es una
   * fila vieja sin `confirmadoAt`. Null significa «no hay cuenta regresiva que
   * mostrar», nunca «vence hoy» — un semáforo que se pone rojo por un dato
   * faltante hace que la gente pierda beneficios que no había perdido.
   *
   * El nombre del ítem viene en el JOIN en vez de resolverse en la pantalla
   * contra el catálogo: el catálogo solo trae los ítems ACTIVOS, así que un
   * beneficio que gerencia dio de baja después de que alguien lo canjeó se
   * quedaba sin nombre en el historial. Se veía «Beneficio» a secas.
   */
  @Get('redemptions')
  async misCanjes(@CurrentMembership() m: Membership) {
    return this.ds.query(
      `SELECT r.*,
              i.nombre  AS "itemNombre",
              i.familia AS "itemFamilia",
              CASE WHEN r.estado <> 'CONFIRMADO' OR r."confirmadoAt" IS NULL
                     OR c."diasParaUsarCanje" = 0 THEN NULL
                   ELSE (r."confirmadoAt" + (c."diasParaUsarCanje" || ' days')::interval)
              END AS "venceEl",
              CASE WHEN r.estado <> 'CONFIRMADO' OR r."confirmadoAt" IS NULL
                     OR c."diasParaUsarCanje" = 0 THEN NULL
                   ELSE CEIL(EXTRACT(EPOCH FROM (
                          r."confirmadoAt" + (c."diasParaUsarCanje" || ' days')::interval - now()
                        )) / 86400)::int
              END AS "diasParaVencer"
         FROM redemptions r
         JOIN benefit_catalog_items i ON i.id = r."itemId"
    LEFT JOIN LATERAL (
           SELECT "diasParaUsarCanje" FROM economy_config
            WHERE "tenantId" = r."tenantId" AND "vigenteHasta" IS NULL
         ORDER BY "vigenteDesde" DESC LIMIT 1
         ) c ON true
        WHERE r."tenantId" = $1 AND r."membershipId" = $2
     ORDER BY r."createdAt" DESC
        LIMIT 100`,
      [m.tenantId, m.id],
    );
  }

  @Post('redemptions')
  async solicitar(@CurrentMembership() m: Membership, @Body() dto: SolicitarCanjeDto) {
    const r = await this.redemptions.solicitar({
      membership: m,
      itemId: dto.itemId,
      idempotencyKeyCliente: dto.idempotencyKeyCliente,
    });
    if (!r.ok) throw new BadRequestException({ motivoRechazo: r.motivo });
    // Los ítems sin aprobación quedan CONFIRMADOS al pedirlos: misma razón
    // que en `confirmar()`.
    this.badges.evaluarSilencioso(m.tenantId);
    return r;
  }

  /**
   * Confirmar y revertir son de RRHH/gerencia y de líder — no del empleado.
   * El guard de rol es lo único que separa esto del resto del controlador; ver
   * la nota en `EconomyService` sobre por qué esto no viola R-07 aunque corra
   * sobre la conexión `app`.
   */
  @Post('redemptions/:id/confirmar')
  @UseGuards(RolesGuard)
  @Roles(RolMembership.GERENCIA, RolMembership.LIDER_AREA, RolMembership.ADMIN_TENANT)
  async confirmar(
    @CurrentMembership() m: Membership,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('evidenciaUrl') evidenciaUrl?: string,
  ) {
    try {
      await this.redemptions.confirmar({
        tenantId: m.tenantId,
        redemptionId: id,
        confirmadoPor: m.id,
        evidenciaUrl,
      });
      // 24/09 — «Primer canje» en el acto, no al cerrar la próxima misión.
      // Mejor esfuerzo: el canje ya quedó confirmado pase lo que pase acá.
      this.badges.evaluarSilencioso(m.tenantId);
      return { ok: true };
    } catch (e) {
      if (e instanceof CanjeNoEncontradoError) throw new NotFoundException(e.message);
      if (e instanceof TransicionInvalidaError) throw new BadRequestException(e.message);
      throw e;
    }
  }

  @Post('redemptions/:id/revertir')
  @UseGuards(RolesGuard)
  @Roles(RolMembership.GERENCIA, RolMembership.LIDER_AREA, RolMembership.ADMIN_TENANT)
  async revertir(
    @CurrentMembership() m: Membership,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('motivo') motivo: string,
  ) {
    try {
      await this.redemptions.revertir({ tenantId: m.tenantId, redemptionId: id, motivo });
      return { ok: true };
    } catch (e) {
      if (e instanceof CanjeNoEncontradoError) throw new NotFoundException(e.message);
      if (e instanceof TransicionInvalidaError) throw new BadRequestException(e.message);
      throw e;
    }
  }
}
