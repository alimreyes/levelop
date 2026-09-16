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
import { Membership } from '../identity/identity.entities';
import { BenefitCatalogItem, Redemption } from './benefits.entities';
import { SolicitarCanjeDto } from './redemptions.dto';
import { CanjeNoEncontradoError, RedemptionsService, TransicionInvalidaError } from './redemptions.service';

@Controller('tenants/:tenantId')
@UseGuards(JwtAuthGuard, TenantMembershipGuard)
export class RedemptionsController {
  constructor(
    @InjectDataSource(PerfilConexion.APP) private readonly ds: DataSource,
    private readonly redemptions: RedemptionsService,
  ) {}

  /** Catálogo filtrado por zona — mostrarle a alguien de Maracaibo algo de Caracas es una burla. */
  @Get('catalog')
  async catalogo(@CurrentMembership() m: Membership) {
    return this.ds
      .getRepository(BenefitCatalogItem)
      .createQueryBuilder('i')
      .where('i.tenantId = :tenantId', { tenantId: m.tenantId })
      .andWhere('i.activo = true')
      .andWhere('(i.zonas = \'{}\' OR :zona = ANY(i.zonas))', { zona: m.zona })
      .getMany();
  }

  @Get('redemptions')
  async misCanjes(@CurrentMembership() m: Membership) {
    return this.ds.getRepository(Redemption).find({
      where: { tenantId: m.tenantId, membershipId: m.id },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  @Post('redemptions')
  async solicitar(@CurrentMembership() m: Membership, @Body() dto: SolicitarCanjeDto) {
    const r = await this.redemptions.solicitar({
      membership: m,
      itemId: dto.itemId,
      idempotencyKeyCliente: dto.idempotencyKeyCliente,
    });
    if (!r.ok) throw new BadRequestException({ motivoRechazo: r.motivo });
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
