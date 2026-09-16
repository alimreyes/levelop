/**
 * Atajo de desarrollo: busca el membershipId de un usuario por email dentro
 * de un tenant. Útil cuando ya se sembró un usuario (seed-second-user.ts) y
 * se perdió el membershipId que imprimió en su momento.
 *
 * Uso: npx ts-node scripts/lookup-membership.ts <tenantId> <email>
 */
import { DataSource } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import { ENTIDADES } from '../src/config/typeorm.config';

loadEnv();

async function main() {
  const [tenantId, email] = process.argv.slice(2);
  if (!tenantId || !email) {
    throw new Error('Uso: npx ts-node scripts/lookup-membership.ts <tenantId> <email>');
  }

  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    entities: ENTIDADES,
  });
  await ds.initialize();

  const filas = await ds.query(
    `SELECT m.id AS "membershipId", m.rol, u.email
       FROM memberships m JOIN users u ON u.id = m."userId"
      WHERE m."tenantId" = $1 AND u.email = $2`,
    [tenantId, email],
  );
  await ds.destroy();

  if (filas.length === 0) {
    console.error('No se encontró ninguna membresía con ese email en ese tenant.');
    process.exit(1);
  }
  console.log(`\nmembershipId: ${filas[0].membershipId}`);
  console.log(`rol:          ${filas[0].rol}\n`);
}

main().catch((e) => {
  console.error('Error:', e.message ?? e);
  process.exit(1);
});
