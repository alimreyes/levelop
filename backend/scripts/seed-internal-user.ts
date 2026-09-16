/**
 * Siembra un usuario interno de Levelop (equipo propio, no un cliente). No
 * hay endpoint de registro para esto — InternalUser nunca es self-service,
 * es el equipo. Necesario para probar InternoController (POST
 * /auth/interno/login exige tipo:'interno' en el JWT, ver InternalGuard).
 *
 * Uso: npx ts-node scripts/seed-internal-user.ts
 */
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config as loadEnv } from 'dotenv';
import { ENTIDADES } from '../src/config/typeorm.config';
import { InternalUser } from '../src/identity/identity.entities';

loadEnv();

const EMAIL = 'interno@levelop.test';
const PASSWORD = 'Levelop123!';

async function main() {
  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    entities: ENTIDADES,
  });
  await ds.initialize();

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const usuario = await ds.getRepository(InternalUser).save(
    ds.getRepository(InternalUser).create({ email: EMAIL, passwordHash, nombre: 'Equipo Levelop' }),
  );

  await ds.destroy();

  console.log('\nListo. Usuario interno de Levelop:\n');
  console.log(`  id:       ${usuario.id}`);
  console.log(`  email:    ${EMAIL}`);
  console.log(`  password: ${PASSWORD}\n`);
}

main().catch((e) => {
  console.error('Error sembrando el usuario interno:', e.message ?? e);
  process.exit(1);
});
