/**
 * =============================================================================
 * SEED-DEMO-TENANT — crea la primera empresa y el primer usuario
 * =============================================================================
 *
 * No existe todavía un endpoint de registro (solo login) — a propósito, todavía
 * no se ha diseñado el flujo de alta de un cliente nuevo. Este script es el
 * atajo para tener ALGO con qué probar la API hoy: una empresa, un usuario y su
 * membresía, listos para hacer login.
 *
 * Correr de nuevo este script crea una empresa NUEVA cada vez (no es
 * idempotente a propósito — es un seed de demo, no una migración).
 */
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config as loadEnv } from 'dotenv';
import { ENTIDADES } from '../src/config/typeorm.config';
import { EstadoTenant, RolMembership } from '../src/common/enums';
import { Membership, Tenant, User } from '../src/identity/identity.entities';
import { EconomyConfig } from '../src/economy/economy.entities';

loadEnv();

const EMAIL = 'demo@levelop.test';
const PASSWORD = 'Levelop123!';

async function main() {
  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    entities: ENTIDADES,
  });
  await ds.initialize();

  const tenant = await ds.getRepository(Tenant).save(
    ds.getRepository(Tenant).create({
      nombre: 'Empresa de Prueba',
      zonaDefault: 'Caracas',
      estado: EstadoTenant.ACTIVO,
    }),
  );

  await ds.getRepository(EconomyConfig).save(
    ds.getRepository(EconomyConfig).create({ tenantId: tenant.id, vigenteDesde: new Date() }),
  );

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const user = await ds.getRepository(User).save(
    ds.getRepository(User).create({ email: EMAIL, passwordHash, nombre: 'Usuario Demo' }),
  );

  const membership = await ds.getRepository(Membership).save(
    ds.getRepository(Membership).create({
      tenantId: tenant.id,
      userId: user.id,
      rol: RolMembership.EMPLEADO,
      zona: 'Caracas',
      activo: true,
    }),
  );

  await ds.destroy();

  console.log('\nListo. Datos para probar la API:\n');
  console.log(`  tenantId:    ${tenant.id}`);
  console.log(`  membership:  ${membership.id}`);
  console.log(`  email:       ${EMAIL}`);
  console.log(`  password:    ${PASSWORD}`);
  console.log('\nGuarda el tenantId — lo necesitas en la URL de cada request.\n');
}

main().catch((e) => {
  console.error('Error sembrando el tenant de demo:', e.message ?? e);
  process.exit(1);
});
