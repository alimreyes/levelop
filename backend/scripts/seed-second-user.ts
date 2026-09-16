/**
 * Agrega un SEGUNDO usuario a un tenant que ya existe, para poder probar el
 * camino real de Oro: alguien crea una misión, OTRA persona la acepta y la
 * cierra. Sin esto, toda prueba manual cae en el caso "el mismo la crea y la
 * cierra", que a propósito nunca da Oro (ver EconomyService).
 *
 * Uso: npx ts-node scripts/seed-second-user.ts <tenantId>
 */
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config as loadEnv } from 'dotenv';
import { ENTIDADES } from '../src/config/typeorm.config';
import { RolMembership } from '../src/common/enums';
import { Membership, User } from '../src/identity/identity.entities';

loadEnv();

const EMAIL = 'demo2@levelop.test';
const PASSWORD = 'Levelop123!';

async function main() {
  const tenantId = process.argv[2];
  if (!tenantId) {
    throw new Error('Falta el tenantId. Uso: npx ts-node scripts/seed-second-user.ts <tenantId>');
  }

  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    entities: ENTIDADES,
  });
  await ds.initialize();

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const user = await ds.getRepository(User).save(
    ds.getRepository(User).create({ email: EMAIL, passwordHash, nombre: 'Usuario Demo 2' }),
  );

  const membership = await ds.getRepository(Membership).save(
    ds.getRepository(Membership).create({
      tenantId,
      userId: user.id,
      rol: RolMembership.EMPLEADO,
      zona: 'Caracas',
      activo: true,
    }),
  );

  await ds.destroy();

  console.log('\nListo. Segundo usuario para probar el camino real de Oro:\n');
  console.log(`  tenantId:    ${tenantId}`);
  console.log(`  membership:  ${membership.id}`);
  console.log(`  email:       ${EMAIL}`);
  console.log(`  password:    ${PASSWORD}\n`);
}

main().catch((e) => {
  console.error('Error sembrando el segundo usuario:', e.message ?? e);
  process.exit(1);
});
