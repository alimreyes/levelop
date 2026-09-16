import { Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentMembership } from '../auth/current-membership.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantMembershipGuard } from '../auth/tenant-membership.guard';
import { Membership } from '../identity/identity.entities';
import { NotificationsService } from './notifications.service';

/**
 * Superficie: app del empleado. Cada quien ve solo sus propias notificaciones
 * — `NotificationsService.listar`/`marcarLeida` filtran por `membershipId`
 * del token, nunca por uno que llegue en la URL o el body.
 */
@Controller('tenants/:tenantId/notifications')
@UseGuards(JwtAuthGuard, TenantMembershipGuard)
export class NotificationsController {
  constructor(private readonly notificaciones: NotificationsService) {}

  @Get()
  async listar(
    @CurrentMembership() m: Membership,
    @Query('soloNoLeidas') soloNoLeidas?: string,
  ) {
    return this.notificaciones.listar(m.tenantId, m.id, soloNoLeidas === 'true');
  }

  @Post(':id/leer')
  async marcarLeida(@CurrentMembership() m: Membership, @Param('id', ParseUUIDPipe) id: string) {
    await this.notificaciones.marcarLeida(m.tenantId, m.id, id);
    return { ok: true };
  }
}
