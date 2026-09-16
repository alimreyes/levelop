import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Membership } from '../identity/identity.entities';

/** Requiere haber pasado por TenantMembershipGuard, que es quien la llena. */
export const CurrentMembership = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Membership => {
    const req = ctx.switchToHttp().getRequest();
    return req.membership;
  },
);
