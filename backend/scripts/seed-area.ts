/**
 * Atajo de desarrollo: no hay endpoint todavía para crear Áreas (es parte de
 * un flujo de administración que no se ha diseñado). Este script crea un
 * Área para un tenant y, opcionalmente, asigna un líder y mete membresías
 * existentes dentro de ella — necesario para probar v_resumen_area (gate de
 * 4+ miembros activos) y el LiderController (que resuelve "mis áreas" por
 * liderMembershipId).
 *
 * Uso:
 *   npx ts-node scripts/seed-area.ts <tenantId> <nombreArea> [liderMembershipId] [...miembroMembershipIds]
 *
 * Ejemplo:
 *   npx ts-node scripts/seed-area.ts ddc567a9-... "Ventas" <membershipLider> <membership1> <membership2>
 */
import { DataSource } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import { ENTIDADES } from '../src/config/typeorm.config';
import { Area } from '../src/identity/identity.entities';

loadEnv();

async function main() {
  const [tenantId, nombreArea, liderMembershipId, ...miembroIds] = process.argv.slice(2);
  if (!tenantId || !nombreArea) {
    throw new Error(
      'Uso: npx ts-node scripts/seed-area.ts <tenantId> <nombreArea> [liderMembershipId] [...miembroMembershipIds]',
    );
  }

  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    entities: ENTIDADES,
  });
  await ds.initialize();

  const area = await ds.getRepository(Area).save(
    ds.getRepository(Area).create({
      tenantId,
      nombre: nombreArea,
      liderMembershipId: liderMembershipId ?? null,
    }),
  );

  const idsAAsignar = [liderMembershipId, ...miembroIds].filter(Boolean) as string[];
  if (idsAAsignar.length > 0) {
    await ds.query(`UPDATE memberships SET "areaId" = $1 WHERE id = ANY($2::uuid[])`, [
      area.id,
      idsAAsignar,
    ]);
  }

  await ds.destroy();

  console.log('\nListo. Área creada:\n');
  console.log(`  areaId:              ${area.id}`);
  console.log(`  nombre:              ${area.nombre}`);
  console.log(`  liderMembershipId:   ${area.liderMembershipId ?? '(ninguno)'}`);
  console.log(`  membresías asignadas: ${idsAAsignar.length}\n`);
}

main().catch((e) => {
  console.error('Error sembrando el área:', e.message ?? e);
  process.exit(1);
});
