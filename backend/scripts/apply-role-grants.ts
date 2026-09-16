/**
 * =============================================================================
 * APPLY-ROLE-GRANTS — genera las contraseñas de los 4 roles de R-07
 * =============================================================================
 *
 * 13/09/26 — Este script no existía. Estaba prometido en `package.json`
 * (`npm run db:grants`) y en `.env.example` ("Estas contraseñas las genera
 * `scripts/apply-role-grants.ts` la primera vez") desde que escribí la
 * migración inicial, pero nunca lo escribí. La migración crea los cuatro
 * roles (`CREATE ROLE ... LOGIN`) pero sin contraseña — no se puede conectar
 * a ninguno todavía, con o sin este script. Lo escribo ahora porque Alim
 * llegó exactamente al punto donde hacía falta.
 *
 * Qué hace: se conecta con el rol dueño (`DATABASE_URL`, el único con
 * permiso para alterar roles), le pone una contraseña aleatoria a cada uno de
 * los cuatro roles de R-07, y imprime las cuatro URLs de conexión completas
 * — mismo host/puerto/base que `DATABASE_URL`, usuario y contraseña nuevos.
 *
 * Correr de nuevo este script ROTA las cuatro contraseñas (genera unas
 * nuevas). Es intencional — no hay "obtener la contraseña actual" porque
 * Postgres no la guarda en texto plano, solo su hash. Si algo con esas
 * credenciales sigue corriendo, hay que actualizar su `.env` después de
 * rotar.
 */
import { randomBytes } from 'crypto';
import { Client } from 'pg';
import { config as loadEnv } from 'dotenv';

loadEnv();

const ROLES = ['levelop_app', 'levelop_backoffice', 'levelop_lider', 'levelop_interno'] as const;

function generarPassword(): string {
  // Alfanumérico a propósito: algunas herramientas de copiar/pegar en Windows
  // rompen con caracteres especiales dentro de una URL de conexión.
  return randomBytes(24).toString('base64url');
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Falta DATABASE_URL en el .env — necesito el rol dueño para poder alterar roles');
  }

  const url = new URL(databaseUrl);
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  console.log('Generando y aplicando contraseñas nuevas a los 4 roles de R-07...\n');

  const resultados: Record<string, string> = {};

  for (const rol of ROLES) {
    const existe = await client.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [rol]);
    if (existe.rowCount === 0) {
      throw new Error(
        `El rol "${rol}" no existe. ¿Corriste "npm run migration:run" antes que esto?`,
      );
    }

    const password = generarPassword();
    // Comillas dobles en el nombre del rol por si acaso; el valor de PASSWORD
    // va entre comillas simples y no acepta placeholders parametrizados en DDL.
    await client.query(`ALTER ROLE "${rol}" WITH PASSWORD '${password}'`);
    resultados[rol] = password;
  }

  await client.end();

  console.log('Listo. Pega estas cuatro líneas en tu .env, reemplazando las que ya existen:\n');
  for (const rol of ROLES) {
    const varName =
      'DB_ROLE_' + rol.replace('levelop_', '').toUpperCase() + '_URL';
    const conexion = `postgresql://${rol}:${resultados[rol]}@${url.host}${url.pathname}`;
    console.log(`${varName}=${conexion}`);
  }
  console.log(
    '\nSi tu DATABASE_URL usa SSL (Railway lo requiere en producción), agrega "?sslmode=require" al final de cada una si la conexión falla sin eso.',
  );
}

main().catch((e) => {
  console.error('Error aplicando los GRANTs de rol:', e.message ?? e);
  process.exit(1);
});
