/**
 * Agrega un usuario nuevo a un tenant Y lo asigna directo a un área — atajo
 * de desarrollo, generaliza lo que `seed-second-user.ts` hacía fijo para un
 * solo email. Útil para llenar un área hasta el piso de 4 miembros que
 * `v_resumen_area` exige antes de mostrar el agregado (R-07).
 *
 * Uso: npx ts-node scripts/seed-area-member.ts <tenantId> <areaId> <email> <nombre>
 */
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config as loadEnv } from 'dotenv';
import { ENTIDADES } from '../src/config/typeorm.config';
import { RolMembership } from '../src/common/enums';
import { Membership, User } from '../src/identity/identity.entities';

loadEnv();

const PASSWORD = 'Levelop123!';

async function main() {
  const [tenantId, areaId, email, nombre] = process.argv.slice(2);
  if (!tenantId || !areaId || !email || !nombre) {
    throw new Error(
      'Uso: npx ts-node scripts/seed-area-member.ts <tenantId> <areaId> <email> <nombre>',
    );
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
    ds.getRepository(User).create({ email, passwordHash, nombre }),
  );
  const membership = await ds.getRepository(Membership).save(
    ds.getRepository(Membership).create({
      tenantId,
      userId: user.id,
      areaId,
      rol: RolMembership.EMPLEADO,
      zona: 'Caracas',
      activo: true,
    }),
  );

  await ds.destroy();

  console.log('\nListo. Miembro nuevo del área:\n');
  console.log(`  membershipId: ${membership.id}`);
  console.log(`  email:        ${email}`);
  console.log(`  password:     ${PASSWORD}\n`);
}

main().catch((e) => {
  console.error('Error:', e.message ?? e);
  process.exit(1);
});
