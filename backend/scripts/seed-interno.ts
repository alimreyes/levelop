/**
 * =============================================================================
 * SEED-INTERNO — crea una cuenta del equipo interno de Levelop (InternalUser)
 * =============================================================================
 *
 * Pedido de Alim, 15/09/26: la «Vista interna» (levelop-interno.html) debe
 * tener una contraseña que SOLO él y gerencia de Levelop tengan — nunca un
 * cliente. Eso ya estaba construido en el backend (tabla `internal_users`,
 * separada de `users`/`memberships`, protegida por `InternalGuard`), pero no
 * existía ningún endpoint de registro (a propósito: no se ha diseñado un flujo
 * de alta pública para esta tabla, y no debería tenerlo — es el equipo propio)
 * ni ningún script para crear la primera cuenta. Este script es eso.
 *
 * POR QUÉ ES UN SCRIPT DE LÍNEA DE COMANDOS Y NO UN FORMULARIO: la contraseña
 * se escribe en TU terminal y se hashea con bcrypt ahí mismo, antes de tocar la
 * base — nunca pasa por un chat, un archivo, ni por mí. Es la única forma de
 * que la contraseña del equipo interno sea de verdad solo tuya.
 *
 * Uso:
 *   npm run seed:interno -- "tu@correo.com" "TuContraseñaSegura123!" "Tu Nombre"
 *
 * Cada persona del equipo (vos, gerencia de Levelop) corre esto una vez con su
 * propio correo y contraseña. A diferencia de `seed-demo-tenant.ts`, ESTE
 * script SÍ es idempotente por email: si el correo ya existe, no crea un
 * duplicado — te avisa y no hace nada, para que puedas correrlo de nuevo sin
 * miedo si no te acordás si ya lo corriste.
 */
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config as loadEnv } from 'dotenv';
import { ENTIDADES } from '../src/config/typeorm.config';
import { InternalUser } from '../src/identity/identity.entities';

loadEnv();

async function main() {
  const [, , email, password, ...nombreParts] = process.argv;
  const nombre = nombreParts.join(' ').trim();

  if (!email || !password) {
    console.error(
      '\nUso: npm run seed:interno -- "correo@ejemplo.com" "Contraseña123!" "Nombre Apellido"\n',
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('\nLa contraseña necesita al menos 8 caracteres.\n');
    process.exit(1);
  }

  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    entities: ENTIDADES,
  });
  await ds.initialize();

  const repo = ds.getRepository(InternalUser);
  const existente = await repo.findOne({ where: { email } });
  if (existente) {
    console.log(`\nYa existe una cuenta interna con ese correo (${email}) — no se creó nada.\n`);
    await ds.destroy();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const creado = await repo.save(
    repo.create({ email, passwordHash, nombre: nombre || email.split('@')[0] }),
  );

  await ds.destroy();

  console.log('\nCuenta interna creada. Datos para entrar en levelop-interno.html:\n');
  console.log(`  email:    ${creado.email}`);
  console.log(`  nombre:   ${creado.nombre}`);
  console.log('  password: la que escribiste arriba (no se guarda en texto plano, no se imprime de vuelta)\n');
}

main().catch((e) => {
  console.error('Error creando la cuenta interna:', e.message ?? e);
  process.exit(1);
});
