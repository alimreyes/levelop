import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolMembership } from '../common/enums';
import { ROLES_KEY } from './roles.decorator';

/** Corre después de TenantMembershipGuard: necesita `req.membership.rol` ya resuelto. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requeridos = this.reflector.getAllAndOverride<RolMembership[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!requeridos || requeridos.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const rol: RolMembership | undefined = req.membership?.rol;
    if (!rol || !requeridos.includes(rol)) {
      throw new ForbiddenException(`Requiere uno de estos roles: ${requeridos.join(', ')}`);
    }
    return true;
  }
}
