import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * =============================================================================
 * MEDALLAS, TROFEOS Y META DEL MES — 19/09/26
 * =============================================================================
 *
 * Las definiciones están cerradas en `LVL-060 v2`: 15 medallas personales, 10
 * trofeos de área, y la meta del mes con sus tres especiales de racha.
 *
 * TRES DECISIONES DE ESQUEMA QUE VALE LA PENA DEFENDER:
 *
 * 1 · EL CATÁLOGO NO ES UNA TABLA. Las 25 viven en código
 *     (`badges.catalogo.ts`), y acá solo se guarda QUIÉN ganó QUÉ y CUÁNDO.
 *
 *     La razón: una medalla no es un dato, es una regla. «Cinco misiones
 *     seguidas antes de la fecha límite» es una consulta, y una consulta no se
 *     guarda en una fila. Si el catálogo fuera una tabla, tendría que
 *     inventar un lenguaje para expresar esas reglas dentro de ella —y ese
 *     lenguaje sería peor que TypeScript—, o tendría dos fuentes de verdad: la
 *     fila y el `if` que la evalúa. Con el catálogo en código, agregar una
 *     medalla es agregar una función, no un despliegue de datos.
 *
 *     El costo honesto: cambiarle el nombre a una medalla requiere desplegar.
 *     Lo acepto; pasa una vez al año y no justifica el otro problema.
 *
 * 2 · LA MEDALLA GANADA SÍ ES UNA FILA, Y ES INMUTABLE. `member_badges` guarda
 *     la clave de la medalla y la fecha. UNIQUE por (membresía, medalla): se
 *     gana una sola vez y el evaluador puede correr cuantas veces quiera sin
 *     duplicar. Eso hace el evaluador idempotente por construcción, en vez de
 *     por cuidado — el mismo criterio que la clave de idempotencia del canje.
 *
 *     No se borran. Si mañana una medalla deja de existir en el catálogo, la
 *     fila queda y la pantalla la ignora. Quitarle a alguien algo que ganó
 *     porque cambiamos de opinión sobre el catálogo sería exactamente el tipo
 *     de cosa que hace que un sistema de reconocimiento deje de reconocerse.
 *
 * 3 · LOS TROFEOS DE ÁREA VIVEN EN SU PROPIA TABLA, no en la de personas con
 *     un `areaId` al lado. Un trofeo de área no le pertenece a nadie: si la
 *     gente del área cambia, el trofeo sigue siendo del área. Mezclarlos
 *     obligaría a decidir a quién se lo asigno, y no hay respuesta correcta.
 *
 * R-07: `member_badges` es legible por la app (son reconocimientos públicos
 * entre pares, como el ranking) y por el líder — a través del MISMO endpoint
 * de ficha que usa un compañero, nunca de una consulta propia. `area_badges`
 * la lee gerencia, porque es del área y no de una persona. `member_goals` NO
 * la lee nadie más que su dueño: la meta que alguien se pone es un compromiso
 * consigo mismo, no un objetivo que su jefe pueda revisar.
 */
export class MedallasYMetaDelMes1758700000000 implements MigrationInterface {
  name = 'MedallasYMetaDelMes1758700000000';

  public async up(q: QueryRunner): Promise<void> {
    // --- Medallas personales ------------------------------------------------
    await q.query(`
      CREATE TABLE member_badges (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "membershipId" uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
        clave text NOT NULL,
        "ganadaAt" timestamptz NOT NULL DEFAULT now()
      )`);
    await q.query(`
      CREATE UNIQUE INDEX uq_member_badge ON member_badges ("membershipId", clave)`);
    await q.query(`CREATE INDEX ix_member_badges_tenant ON member_badges ("tenantId")`);

    // --- Trofeos de área ----------------------------------------------------
    await q.query(`
      CREATE TABLE area_badges (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "areaId" uuid NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
        clave text NOT NULL,
        "periodo" text,
        "ganadaAt" timestamptz NOT NULL DEFAULT now()
      )`);
    // El período entra en la unicidad: «Área puntual» se puede ganar en marzo y
    // otra vez en abril — son dos logros distintos, no uno repetido. Las que no
    // llevan período (Arranque, Centenaria) usan cadena vacía y por lo tanto se
    // ganan una sola vez.
    await q.query(`
      CREATE UNIQUE INDEX uq_area_badge ON area_badges ("areaId", clave, COALESCE("periodo", ''))`);
    await q.query(`CREATE INDEX ix_area_badges_tenant ON area_badges ("tenantId")`);

    // --- Meta del mes -------------------------------------------------------
    await q.query(`
      CREATE TABLE member_goals (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "membershipId" uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
        "mes" date NOT NULL,
        objetivo integer NOT NULL CHECK (objetivo > 0),
        "fijadaAt" timestamptz NOT NULL DEFAULT now(),
        "cumplidaAt" timestamptz
      )`);
    await q.query(`CREATE UNIQUE INDEX uq_member_goal_mes ON member_goals ("membershipId", "mes")`);

    // --- GRANTs -------------------------------------------------------------
    // `levelop_app` ya tiene SELECT/INSERT/UPDATE sobre todo el esquema, así que
    // las tres tablas le quedan disponibles solas. Lo que hay que conceder es lo
    // de las superficies de gestión, que trabajan con lista blanca.
    //
    // Gerencia ve los trofeos de ÁREA (son del área, no de nadie) y las medallas
    // personales NO. Esa asimetría es R-07: un trofeo de área es un agregado; la
    // lista de medallas de una persona, en una pantalla de gestión, es un
    // resumen de su desempeño con su nombre encima.
    await q.query(`GRANT SELECT ON area_badges TO levelop_backoffice, levelop_lider, levelop_interno`);
    // 🔒 A propósito, sin GRANT para gerencia ni líder:
    //    member_badges → se ven a través del endpoint de ficha, con la conexión
    //                    `app` y el JWT de quien mira, igual que un compañero.
    //    member_goals  → la meta es un compromiso con uno mismo. Nadie más.
    await q.query(`REVOKE SELECT ON member_goals FROM levelop_interno`);
    await q.query(`REVOKE SELECT ON member_badges FROM levelop_interno`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS member_goals`);
    await q.query(`DROP TABLE IF EXISTS area_badges`);
    await q.query(`DROP TABLE IF EXISTS member_badges`);
  }
}
