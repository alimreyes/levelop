import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * =============================================================================
 * BLOQUE TIENDA — 17/09/26 (tarde). Puntos 6, 8 y 9 de «Cosas para conectar
 * ahora», aprobados por Alim el mismo día.
 * =============================================================================
 *
 * Dos columnas, ningún dato nuevo inventado. Los lotes de Oro (punto 6) no
 * aparecen aquí a propósito: se calculan al vuelo sobre `economy_events`, que
 * es el ledger y ya tiene todo lo necesario. Una tabla de lotes sería una
 * segunda fuente de verdad sobre el mismo hecho, y la primera vez que las dos
 * se desviaran, ninguna de las dos serviría.
 *
 * 1 · `benefit_catalog_items.nivelMinimo`
 *
 *    NULL = para todos, que es como quedan los ítems que ya existen. Es la
 *    primera vez que el nivel ABRE algo: hasta hoy subía de nivel y no pasaba
 *    nada, aunque el Maestro dice desde el principio que el nivel "abre
 *    catálogo, no da Oro". Lo pone gerencia por ítem.
 *
 *    No lleva CHECK de rango: el nivel máximo depende de `economy_config`
 *    (`nivelBase`, `nivelExponente`), que es por tenant y versionada. Un CHECK
 *    con un número fijo aquí se rompería el día que el CFO toque la fórmula.
 *    La validación vive en el DTO, donde puede leer la config vigente.
 *
 * 2 · `membership_prefs.objetivoItemId`
 *
 *    El beneficio que la persona marcó como "lo quiero". Va en `membership_prefs`
 *    y no en `memberships` por una razón que no es de comodidad: esa tabla es
 *    de las tres que gerencia, líder y la vista interna NO pueden leer (lista
 *    blanca de la migración inicial, y un REVOKE explícito para interno). O
 *    sea que "qué beneficio quiere cada persona" queda fuera del alcance de
 *    toda superficie de gestión por el modelo de datos, sin que nadie tenga
 *    que acordarse de filtrarlo en una consulta. Es el mismo argumento de R-07
 *    aplicado a un dato que no es de desempeño pero sí es íntimo.
 *
 *    ON DELETE SET NULL: si gerencia borra el ítem, la persona se queda sin
 *    objetivo, no con un puntero roto.
 *
 * GRANTS: ninguno nuevo hace falta, y lo verifiqué contra la migración inicial
 * en vez de suponerlo. `levelop_app` tiene GRANT a nivel de TABLA sobre todo el
 * esquema (`GRANT SELECT, INSERT, UPDATE ON ALL TABLES`), y `levelop_backoffice`
 * también a nivel de tabla sobre `benefit_catalog_items` — los permisos por
 * tabla cubren las columnas nuevas solas. Donde sí habría que tocar es si
 * alguno de esos roles tuviera GRANT por COLUMNA (como `levelop_lider` sobre
 * `users`, que se hizo así el 15/09): ahí una columna nueva nace invisible.
 */
export class BloqueTienda17Sep1758300000000 implements MigrationInterface {
  name = 'BloqueTienda17Sep1758300000000';

  public async up(q: QueryRunner): Promise<void> {
    // --- 1 · Beneficios que se abren por nivel -------------------------------
    await q.query(`ALTER TABLE benefit_catalog_items ADD COLUMN "nivelMinimo" integer`);
    await q.query(`
      COMMENT ON COLUMN benefit_catalog_items."nivelMinimo" IS
        'Nivel minimo para canjear. NULL = sin restriccion. Lo fija gerencia.'`);

    // --- 2 · El objetivo personal -------------------------------------------
    await q.query(`
      ALTER TABLE membership_prefs
        ADD COLUMN "objetivoItemId" uuid REFERENCES benefit_catalog_items(id) ON DELETE SET NULL`);
    await q.query(`
      COMMENT ON COLUMN membership_prefs."objetivoItemId" IS
        'Beneficio marcado como objetivo. Uno a la vez. Tabla no legible por gerencia/lider/interno.'`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE membership_prefs DROP COLUMN IF EXISTS "objetivoItemId"`);
    await q.query(`ALTER TABLE benefit_catalog_items DROP COLUMN IF EXISTS "nivelMinimo"`);
  }
}
