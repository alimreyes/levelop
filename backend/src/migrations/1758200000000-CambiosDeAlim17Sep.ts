import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * =============================================================================
 * CAMBIOS DE ALIM TRAS PROBAR EN PRODUCCIÓN (documento «LEVELOP _ CAMBIOS», 17/09/26)
 * =============================================================================
 *
 * Lo que toca esquema de esa lista:
 *
 * 1. Tope diario de Oro → apagado. Alim, textual: "no podemos tener un tope de
 *    oro por día porque quita el incentivo al usuario de trabajar más". El
 *    mecanismo NO se borra (sigue siendo la palanca anti-cheat por tenant del
 *    Maestro §3.3, y el CFO puede querer volver a usarla): `capOroDiario = 0`
 *    significa "sin tope", el default pasa a 0 y todas las configuraciones
 *    existentes se ponen en 0. Ver `EconomyService.registrarMisionCerrada`.
 *
 * 2. Cupos desde gerencia ("agregar un máximo o disponibilidad"). Hasta hoy los
 *    cupos solo se cargaban por base (el script de la empresa demo lo hacía a
 *    mano). `benefit_catalog_items.cuposMensuales`: cuántos cupos por mes
 *    calendario; NULL = sin límite. La fila mensual de `benefit_stock` se crea
 *    sola la primera vez que alguien canjea en ese mes (ver
 *    `RedemptionsService.asegurarStockDelMes`). UNIQUE (itemId, periodoInicio)
 *    para que dos canjes simultáneos en un mes nuevo no creen dos filas.
 *
 * 3. Canjes por categoría con filtro de fechas (día/semana/mes/año). La vista
 *    mensual no alcanza; `v_canjes_diarios` es la misma agregación por DÍA —
 *    sigue sin identidad (R-07): categoría, día, cantidad, Oro. Nada más.
 *
 * 4. Aliados: "la gerencia no debería poder poner el nombre ni descripción,
 *    porque esto viene de lo que Levelop va a negociar; lo que queda para ellos
 *    es cuáles activar". Tabla `partner_offers` (catálogo de aliados de
 *    Levelop, lo administra la Vista interna) y `benefit_catalog_items.
 *    partnerOfferId`: un ítem de categoría `aliados` nace de una oferta y hereda
 *    nombre y descripción, que gerencia no edita.
 */
export class CambiosDeAlim17Sep1758200000000 implements MigrationInterface {
  name = 'CambiosDeAlim17Sep1758200000000';

  public async up(q: QueryRunner): Promise<void> {
    // 1 · Tope diario: 0 = sin tope
    await q.query(`ALTER TABLE economy_config ALTER COLUMN "capOroDiario" SET DEFAULT 0`);
    await q.query(`UPDATE economy_config SET "capOroDiario" = 0`);

    // 2 · Cupos mensuales por ítem + unicidad de la fila mensual
    await q.query(`ALTER TABLE benefit_catalog_items ADD COLUMN "cuposMensuales" integer`);
    await q.query(`
      CREATE UNIQUE INDEX uq_benefit_stock_item_periodo
        ON benefit_stock ("itemId", "periodoInicio")`);

    // 3 · Canjes por día (agregado, sin identidad)
    await q.query(`
      CREATE VIEW v_canjes_diarios AS
      SELECT r."tenantId", b.familia, date_trunc('day', r."createdAt") AS dia,
             count(*)::int AS total, COALESCE(sum(r."precioOroAplicado"), 0)::int AS oro_total
        FROM redemptions r
        JOIN benefit_catalog_items b ON b.id = r."itemId"
       WHERE r.estado = 'CONFIRMADO'
       GROUP BY 1, 2, 3`);
    await q.query(`GRANT SELECT ON v_canjes_diarios TO levelop_backoffice, levelop_lider, levelop_interno`);

    // 4 · Aliados de Levelop
    await q.query(`
      CREATE TABLE partner_offers (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        nombre text NOT NULL,
        descripcion text,
        "precioOroSugerido" integer NOT NULL DEFAULT 50,
        zonas text[] NOT NULL DEFAULT '{}',
        activo boolean NOT NULL DEFAULT true,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )`);
    await q.query(`ALTER TABLE benefit_catalog_items ADD COLUMN "partnerOfferId" uuid REFERENCES partner_offers(id) ON DELETE SET NULL`);
    await q.query(`GRANT SELECT, INSERT, UPDATE ON partner_offers TO levelop_interno`);
    await q.query(`GRANT SELECT ON partner_offers TO levelop_backoffice`);
    await q.query(`GRANT SELECT ON partner_offers TO levelop_app`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE benefit_catalog_items DROP COLUMN IF EXISTS "partnerOfferId"`);
    await q.query(`DROP TABLE IF EXISTS partner_offers`);
    await q.query(`DROP VIEW IF EXISTS v_canjes_diarios`);
    await q.query(`DROP INDEX IF EXISTS uq_benefit_stock_item_periodo`);
    await q.query(`ALTER TABLE benefit_catalog_items DROP COLUMN IF EXISTS "cuposMensuales"`);
    await q.query(`ALTER TABLE economy_config ALTER COLUMN "capOroDiario" SET DEFAULT 150`);
  }
}
