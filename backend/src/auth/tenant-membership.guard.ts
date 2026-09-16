import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PerfilConexion } from '../common/enums';
import { Membership } from '../identity/identity.entities';

/**
 * Resuelve la MEMBRESÍA real del usuario para el :tenantId de la ruta.
 *
 * Corre siempre DESPUÉS de JwtAuthGuard. Lee `req.user.sub` (que sí viene del
 * token, es identidad) y busca en vivo contra `memberships` — nunca confía en
 * un rol viejo cacheado en el JWT. Rechaza si la membresía no existe o está
 * inactiva (`activo = false`, que es como se representa una baja sin borrar
 * el historial de esa persona en esa empresa).
 */
@Injectable()
export class TenantMembershipGuard implements CanActivate {
  constructor(@InjectDataSource(PerfilConexion.APP) private readonly ds: DataSource) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const tenantId = req.params?.tenantId ?? req.headers['x-tenant-id'];
    const userId = req.user?.sub;

    if (!tenantId || !userId) {
      throw new ForbiddenException('Falta tenantId o sesión inválida');
    }

    const membership = await this.ds.getRepository(Membership).findOne({
      where: { tenantId, userId, activo: true },
    });

    if (!membership) {
      throw new ForbiddenException('Sin membresía activa en este tenant');
    }

    req.membership = membership;
    return true;
  }
}
