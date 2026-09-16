import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CurrentMembership } from '../auth/current-membership.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantMembershipGuard } from '../auth/tenant-membership.guard';
import { PerfilConexion } from '../common/enums';
import { Membership } from './identity.entities';

/**
 * =============================================================================
 * MIEMBROS DEL TENANT — la lista de compañeros, vista desde la app del empleado
 * =============================================================================
 *
 * 16/09/26. Hasta hoy la app no tenía forma de convertir un `membershipId` en
 * un nombre, ni de ofrecer a quién sugerir una misión: `asignadoMembershipId`
 * existía en el DTO desde el 14/09 pero ninguna pantalla podía llenarlo porque
 * no había de dónde elegir. Esta ruta devuelve exactamente lo que un compañero
 * ya sabe de otro por trabajar en la misma empresa: nombre, área y rol.
 *
 * QUÉ NO DEVUELVE, A PROPÓSITO: email, zona, si tiene el juego apagado, saldo,
 * XP, nivel, ni ninguna preferencia. Nada de eso es "público entre pares" —
 * el ranking (`/economy/ranking`) es la única superficie entre compañeros que
 * muestra XP, y solo de quien participa voluntariamente.
 *
 * ¿Y R-07? No aplica: R-07 restringe superficies de GESTIÓN (gerencia/líder
 * viendo a su gente). Esto es la app del empleado, con la conexión `app`,
 * mostrando a un empleado quiénes son sus compañeros — lo mismo que ve en
 * el directorio de cualquier empresa. Solo se listan membresías activas.
 */
@Controller('tenants/:tenantId/members')
@UseGuards(JwtAuthGuard, TenantMembershipGuard)
export class MembersController {
  constructor(@InjectDataSource(PerfilConexion.APP) private readonly ds: DataSource) {}

  @Get()
  async listar(@CurrentMembership() m: Membership) {
    const filas: Array<{
      membershipId: string;
      nombre: string;
      rol: string;
      areaId: string | null;
      areaNombre: string | null;
    }> = await this.ds.query(
      `SELECT mem.id        AS "membershipId",
              u.nombre      AS "nombre",
              mem.rol       AS "rol",
              mem."areaId"  AS "areaId",
              a.nombre      AS "areaNombre"
         FROM memberships mem
         JOIN users u ON u.id = mem."userId"
    LEFT JOIN areas a ON a.id = mem."areaId"
        WHERE mem."tenantId" = $1 AND mem.activo
     ORDER BY u.nombre ASC`,
      [m.tenantId],
    );
    return filas;
  }
}
