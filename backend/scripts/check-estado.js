/**
 * check-estado.js — diagnostico rapido, 15/09/26.
 *
 * Corrí esto porque tu salida de `migration:run` dijo "No migrations are
 * pending" y necesito saber si eso es porque la migracion de nombres para
 * lider YA quedo aplicada antes (bien) o porque nunca corrio (mal). Ademas
 * reviso lo del seed:interno (usaste el placeholder literal "tu@correo.com")
 * y si demo2@levelop.test tiene area asignada como lider.
 *
 * Uso:  node scripts/check-estado.js
 * Es descartable — no forma parte del producto, se puede borrar cuando ya
 * no lo necesites.
 */
require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();

  const migs = await c.query(`SELECT name FROM levelop_migrations ORDER BY id DESC LIMIT 5`);
  console.log('\n--- Migraciones aplicadas (ultimas 5, la mas nueva primero) ---');
  console.log(migs.rows.map((r) => r.name).join('\n') || '(ninguna)');

  const grants = await c.query(`
    SELECT column_name, privilege_type
    FROM information_schema.role_column_grants
    WHERE grantee = 'levelop_lider' AND table_name = 'users'
    ORDER BY column_name
  `);
  console.log('\n--- Columnas de "users" que levelop_lider puede leer ---');
  console.log(
    grants.rows.length
      ? grants.rows.map((r) => `${r.column_name} (${r.privilege_type})`).join('\n')
      : '(ninguna — el GRANT no esta aplicado)',
  );

  const internos = await c.query(`SELECT email, nombre, "createdAt" FROM internal_users ORDER BY "createdAt" DESC`);
  console.log('\n--- Cuentas en internal_users ---');
  console.log(
    internos.rows.length
      ? internos.rows.map((r) => `${r.email} — ${r.nombre} (${r.createdAt.toISOString()})`).join('\n')
      : '(ninguna)',
  );

  const area = await c.query(`
    SELECT a.nombre AS area, u.email, u.nombre AS nombre_lider
    FROM areas a
    JOIN memberships m ON m.id = a."liderMembershipId"
    JOIN users u ON u.id = m."userId"
    WHERE u.email = 'demo2@levelop.test'
  `);
  console.log('\n--- Areas donde demo2@levelop.test es lider ---');
  console.log(
    area.rows.length
      ? area.rows.map((r) => `${r.area} (lider: ${r.nombre_lider})`).join('\n')
      : '(ninguna — demo2 no tiene area asignada como lider, va a dar 403 en levelop-lider.html)',
  );

  await c.end();
}

main().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
