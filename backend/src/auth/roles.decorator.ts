import { SetMetadata } from '@nestjs/common';
import { RolMembership } from '../common/enums';

export const ROLES_KEY = 'roles';

/** Uso: @Roles(RolMembership.GERENCIA, RolMembership.LIDER_AREA) sobre un endpoint. */
export const Roles = (...roles: RolMembership[]) => SetMetadata(ROLES_KEY, roles);
