import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { IsEmail, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { DataSource } from 'typeorm';
import { InternalGuard } from '../auth/internal.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/jwt.strategy';
import { EstadoTenant, PerfilConexion, RolMembership } from '../common/enums';
import { Invitation, Tenant } from '../identity/identity.entities';
import {
  normalizarEmail,
  nuevoTokenInvitacion,
  vencimientoInvitacion,
} from '../identity/invitations.util';

class FiltroTenantDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string;
}

/**
 * Alta de una empresa cliente (16/09/26). Venta directa: la crea el equipo
 * Levelop, no la empresa misma. Junto con la empresa se emite la PRIMERA
 * invitación, con rol `admin_tenant`, para el dueño/gerente — él pone su
 * contraseña al abrir el link; Levelop nunca la conoce.
 */
class CrearTenantDto {
  @IsString() @MinLength(2) @MaxLength(120) nombre!: string;
  @IsOptional() @IsString() @MaxLength(40) rif?: string;
  @IsString() @MinLength(2) @MaxLength(60) zonaDefault!: string;
  @IsEmail() adminEmail!: string;
}

/**
 * Vista interna de Levelop (el equipo propio, nunca miembro de un tenant —
 * por eso usa `InternalGuard`, no `TenantMembershipGuard`, que buscaría una
 * membresía que estos usuarios nunca tienen). Conexión `interno`: lee todo
 * agregado, y R-07 aplica también hacia adentro (sin `mission_thread_messages`
 * ni `membership_prefs`, per GRANTs de la migración).
 *
 * No está bajo `/tenants/:tenantId` a propósito — Levelop ve across clientes,
 * filtra por tenant como parámetro opcional, no como dueño de la ruta.
 */
@Controller('interno')
@UseGuards(JwtAuthGuard, InternalGuard)
export class InternoController {
  constructor(@InjectDataSource(PerfilConexion.INTERNO) private readonly ds: DataSource) {}

  /**
   * La fila completa por persona que Alim pidió (área, nombre, tareas
   * cumplidas, Oro) — con nombre, porque esta vista es exclusiva del equipo
   * Levelop, no una superficie de gestión sobre los empleados del cliente.
   */
  @Get('usuarios')
  async usuarios(@Query() filtro: FiltroTenantDto) {
    if (filtro.tenantId) {
      return this.ds.query(`SELECT * FROM v_resumen_usuario_interno WHERE "tenantId" = $1`, [
        filtro.tenantId,
      ]);
    }
    return this.ds.query(`SELECT * FROM v_resumen_usuario_interno`);
  }

  @Get('gate-lanzamiento')
  async gateLanzamiento(@Query() filtro: FiltroTenantDto) {
    if (filtro.tenantId) {
      return this.ds.query(`SELECT * FROM v_gate_lanzamiento WHERE "tenantId" = $1`, [
        filtro.tenantId,
      ]);
    }
    return this.ds.query(`SELECT * FROM v_gate_lanzamiento`);
  }

  @Get('canjes-agregados')
  async canjesAgregados(@Query() filtro: FiltroTenantDto) {
    if (filtro.tenantId) {
      return this.ds.query(
        `SELECT * FROM v_canjes_agregados WHERE "tenantId" = $1 ORDER BY mes DESC`,
        [filtro.tenantId],
      );
    }
    return this.ds.query(`SELECT * FROM v_canjes_agregados ORDER BY mes DESC LIMIT 500`);
  }

  // ===========================================================================
  // EMPRESAS (16/09/26) — alta y listado
  // ===========================================================================

  /** Todas las empresas cliente, con cuánta gente activa tiene cada una y si su primera invitación ya fue usada. */
  @Get('tenants')
  async tenants() {
    return this.ds.query(
      `SELECT t.id, t.nombre, t.rif, t."zonaDefault", t.estado, t."lanzadoAt", t."createdAt",
              (SELECT count(*)::int FROM memberships m WHERE m."tenantId" = t.id AND m.activo) AS "miembrosActivos",
              (SELECT count(*)::int FROM invitations i WHERE i."tenantId" = t.id AND i."aceptadaAt" IS NULL AND i."expiraAt" > now()) AS "invitacionesVigentes"
         FROM tenants t
     ORDER BY t."createdAt" DESC`,
    );
  }

  /**
   * Crear empresa + primera invitación (admin). Una transacción: si la
   * invitación falla, no queda una empresa sin nadie que pueda entrar.
   * Devuelve el token para que la Vista interna arme el link y Alim se lo
   * mande al cliente por el canal que sea.
   */
  @Post('tenants')
  async crearTenant(@Req() req: { user: JwtPayload }, @Body() dto: CrearTenantDto) {
    return this.ds.transaction(async (tx) => {
      const tenant = await tx.save(
        tx.create(Tenant, {
          nombre: dto.nombre.trim(),
          rif: dto.rif?.trim() || null,
          zonaDefault: dto.zonaDefault.trim(),
          estado: EstadoTenant.ONBOARDING,
          lanzadoAt: null,
        }),
      );
      const invitacion = await tx.save(
        tx.create(Invitation, {
          tenantId: tenant.id,
          email: normalizarEmail(dto.adminEmail),
          rol: RolMembership.ADMIN_TENANT,
          areaId: null,
          zona: null,
          token: nuevoTokenInvitacion(),
          creadaPorMembershipId: null,
          creadaPorInternalUserId: req.user.sub,
          expiraAt: vencimientoInvitacion(),
          aceptadaAt: null,
          aceptadaMembershipId: null,
        }),
      );
      return { tenant, invitacion };
    });
  }

  /** Invitaciones de una empresa (para volver a copiar el link del admin, o ver si ya entró). */
  @Get('invitaciones')
  async invitaciones(@Query() filtro: FiltroTenantDto) {
    if (!filtro.tenantId) return [];
    return this.ds.query(
      `SELECT i.id, i.email, i.rol, i.token, i."expiraAt", i."aceptadaAt", i."createdAt",
              (i."aceptadaAt" IS NULL AND i."expiraAt" > now()) AS "vigente"
         FROM invitations i
        WHERE i."tenantId" = $1
     ORDER BY i."createdAt" DESC`,
      [filtro.tenantId],
    );
  }
}
