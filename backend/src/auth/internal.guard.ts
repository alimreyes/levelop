import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

/**
 * El equipo Levelop nunca es miembro de un tenant (`InternalUser` no tiene
 * `memberships`) — por eso NO puede usar `TenantMembershipGuard`, que busca
 * exactamente eso y siempre fallaría para ellos. Este guard solo confirma que
 * el JWT es de un `InternalUser` (`tipo: 'interno'`, ver `jwt.strategy.ts`).
 */
@Injectable()
export class InternalGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    if (req.user?.tipo !== 'interno') {
      throw new ForbiddenException('Solo el equipo interno de Levelop puede usar este endpoint');
    }
    return true;
  }
}
