/**
 * Atajo de desarrollo: crea inventario (`benefit_stock`) para un ítem del
 * catálogo. No hay endpoint de administración de stock todavía — un ítem
 * creado por `POST catalog` no tiene cupos hasta que alguien los siembre.
 *
 * Uso: npx ts-node scripts/seed-benefit-stock.ts <tenantId> <itemId> <cuposTotales>
 */
import { DataSource } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import { ENTIDADES } from '../src/config/typeorm.config';
import { BenefitStock } from '../src/benefits/benefits.entities';

loadEnv();

async function main() {
  const [tenantId, itemId, cuposTotalesStr] = process.argv.slice(2);
  const cuposTotales = Number(cuposTotalesStr);
  if (!tenantId || !itemId || !cuposTotales) {
    throw new Error(
      'Uso: npx ts-node scripts/seed-benefit-stock.ts <tenantId> <itemId> <cuposTotales>',
    );
  }

  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    entities: ENTIDADES,
  });
  await ds.initialize();

  const stock = await ds.getRepository(BenefitStock).save(
    ds.getRepository(BenefitStock).create({
      tenantId,
      itemId,
      cuposTotales,
      cuposReservados: 0,
      cuposConsumidos: 0,
      periodoInicio: new Date(Date.now() - 86400000),
      periodoFin: new Date(Date.now() + 30 * 86400000),
    }),
  );

  await ds.destroy();

  console.log('\nListo. Stock creado:\n');
  console.log(`  itemId:        ${stock.itemId}`);
  console.log(`  cuposTotales:  ${stock.cuposTotales}`);
  console.log(`  periodoFin:    ${stock.periodoFin.toISOString()}\n`);
}

main().catch((e) => {
  console.error('Error:', e.message ?? e);
  process.exit(1);
});
