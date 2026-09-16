import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * =============================================================================
 * SEIS PEDIDOS DE ALIM TRAS LA PRIMERA PRUEBA REAL (14/09/26)
 * =============================================================================
 *
 * Probó la plataforma conectada y volvió con seis puntos. Esta migración cubre
 * los tres que tocan esquema:
 *
 * 1. Canje con auto-confirmación — no todo ítem de tienda necesita que alguien
 *    lo apruebe (un café no, una reunión con gerencia sí). `requiereAprobacion`
 *    en `benefit_catalog_items`, default `true` (seguro: nada se auto-aprueba
 *    hasta que gerencia lo apague a propósito).
 * 3. Misión: links opcionales. `enlaces` en `missions`. El campo para "sugerir
 *    un colaborador" YA EXISTÍA (`asignadoMembershipId`, desde el esquema
 *    original) — no hacía falta columna nueva, solo exponerlo en el DTO/
 *    controlador, que se hace en código, no aquí.
 * 5. Ranking: opt-out granular. `participaEnRanking` en `membership_prefs`.
 *    NO es una enmienda de R-07 (el ranking del Maestro §4.3 nunca estuvo bajo
 *    esa regla — ver el comentario largo en la entidad). Es un control más
 *    fino que el `verTablaCompleta` que ya existía desde el esquema original.
 *
 * El punto 2 (notificaciones) es tabla nueva completa, no columna — va en la
 * segunda mitad de este archivo. Los puntos 4 (botón en un modal) y 6 (filtro
 * de listado) no tocan esquema — van en el código de los controladores.
 */
export class AprobacionCanjeEnlacesRankingNotificaciones1757900000000
  implements MigrationInterface
{
  name = 'AprobacionCanjeEnlacesRankingNotificaciones1757900000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      ALTER TABLE benefit_catalog_items
        ADD COLUMN "requiereAprobacion" boolean NOT NULL DEFAULT true`);

    await q.query(`
      ALTER TABLE missions
        ADD COLUMN "enlaces" text[] NOT NULL DEFAULT '{}'`);

    await q.query(`
      ALTER TABLE membership_prefs
        ADD COLUMN "participaEnRanking" boolean NOT NULL DEFAULT true`);

    // --- Notificaciones — MVP por polling (ver TipoNotificacion en enums.ts) ---
    await q.query(`
      CREATE TABLE notifications (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "membershipId" uuid NOT NULL,
        tipo text NOT NULL,
        mensaje text NOT NULL,
        "refTipo" text,
        "refId" uuid,
        leida boolean NOT NULL DEFAULT false,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )`);
    await q.query(`CREATE INDEX idx_notifications_tenant ON notifications ("tenantId")`);
    await q.query(`CREATE INDEX idx_notifications_membership ON notifications ("membershipId")`);
    await q.query(`CREATE INDEX idx_notifications_leida ON notifications (leida)`);

    // La migración inicial le dio a `levelop_app` GRANT sobre "ALL TABLES IN
    // SCHEMA public" — pero eso corrió una sola vez, sobre las tablas que
    // existían EN ESE MOMENTO. Postgres no tiene privilegios por defecto para
    // tablas futuras a menos que se declaren con ALTER DEFAULT PRIVILEGES, y
    // esta base no los tiene. Sin este GRANT explícito, `notifications` sería
    // invisible para la propia app — mismo tipo de bug de "olvidar el permiso
    // nuevo" que R-07 evita del lado contrario (bloquear de más); aquí es
    // bloquear de menos, por completo, y el síntoma sería un 500 al primer
    // intento de leer o escribir.
    await q.query(`GRANT SELECT, INSERT, UPDATE ON notifications TO levelop_app`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS notifications`);
    await q.query(`ALTER TABLE membership_prefs DROP COLUMN IF EXISTS "participaEnRanking"`);
    await q.query(`ALTER TABLE missions DROP COLUMN IF EXISTS "enlaces"`);
    await q.query(`ALTER TABLE benefit_catalog_items DROP COLUMN IF EXISTS "requiereAprobacion"`);
  }
}
