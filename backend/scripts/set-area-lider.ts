/**
 * Atajo de desarrollo: reasigna el líder de un Área ya existente (no hay
 * endpoint de administración de áreas todavía).
 *
 * Uso: npx ts-node scripts/set-area-lider.ts <areaId> <liderMembershipId>
 */
import { DataSource } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import { ENTIDADES } from '../src/config/typeorm.config';

loadEnv();

async function main() {
  const [areaId, liderMembershipId] = process.argv.slice(2);
  if (!areaId || !liderMembershipId) {
    throw new Error('Uso: npx ts-node scripts/set-area-lider.ts <areaId> <liderMembershipId>');
  }

  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    entities: ENTIDADES,
  });
  await ds.initialize();

  const [filas] = await ds.query(
    `UPDATE areas SET "liderMembershipId" = $1 WHERE id = $2 RETURNING id, nombre, "liderMembershipId"`,
    [liderMembershipId, areaId],
  );
  await ds.destroy();

  if (!filas || filas.length === 0) {
    console.error('No se encontró esa área.');
    process.exit(1);
  }
  console.log(`\nListo: área "${filas[0].nombre}" ahora tiene líder ${filas[0].liderMembershipId}\n`);
}

main().catch((e) => {
  console.error('Error:', e.message ?? e);
  process.exit(1);
});
