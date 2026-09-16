/**
 * Atajo de desarrollo: no hay endpoint todavía para cambiar el rol de una
 * membresía (eso es parte de un flujo de administración que no se ha
 * diseñado). Para poder probar los controladores de gerencia/líder/interno
 * sin ese endpoint, este script cambia el rol directo en la base.
 *
 * Uso: npx ts-node scripts/set-membership-role.ts <membershipId> <rol>
 * <rol> es uno de: empleado, lider_area, gerencia, admin_tenant
 */
import { DataSource } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import { ENTIDADES } from '../src/config/typeorm.config';
import { RolMembership } from '../src/common/enums';

loadEnv();

async function main() {
  const [membershipId, rol] = process.argv.slice(2);
  if (!membershipId || !rol) {
    throw new Error('Uso: npx ts-node scripts/set-membership-role.ts <membershipId> <rol>');
  }
  if (!Object.values(RolMembership).includes(rol as RolMembership)) {
    throw new Error(`Rol inválido: "${rol}". Válidos: ${Object.values(RolMembership).join(', ')}`);
  }

  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    entities: ENTIDADES,
  });
  await ds.initialize();

  // OJO (mismo patrón que el bug de cupos en redemptions.service.ts): el driver
  // de Postgres de TypeORM devuelve [filas, cantidadAfectada] cuando la query
  // trae RETURNING — nunca las filas directamente. Desestructurar mal esto
  // hace que `result[0]` sea el arreglo de filas completo, no la primera fila,
  // y result.length sea siempre 2 (nunca 0), así que la validación de "no
  // encontrado" tampoco se dispara nunca.
  const [filas] = await ds.query(
    `UPDATE memberships SET rol = $1, "updatedAt" = now() WHERE id = $2 RETURNING id, rol`,
    [rol, membershipId],
  );
  await ds.destroy();

  if (!filas || filas.length === 0) {
    console.error('No se encontró esa membresía.');
    process.exit(1);
  }
  console.log(`\nListo: membership ${filas[0].id} ahora tiene rol "${filas[0].rol}"\n`);
}

main().catch((e) => {
  console.error('Error:', e.message ?? e);
  process.exit(1);
});
