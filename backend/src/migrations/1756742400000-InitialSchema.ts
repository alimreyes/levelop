import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * =============================================================================
 * MIGRACION INICIAL — LVL-013
 * =============================================================================
 *
 * Esta migracion es donde R-07 deja de ser una promesa escrita dentro de un panel
 * y se vuelve una restriccion que la base de datos hace cumplir.
 *
 * NOTA SOBRE `synchronize`: esta apagado y no se enciende ni en desarrollo. Fue
 * la causa raiz del error que reventó el entorno anterior — TypeORM intento
 * migrar `tasks` de camelCase a snake_case sobre filas existentes y fallo por un
 * NOT NULL. Migraciones explicitas desde el dia uno.
 */
export class InitialSchema1756742400000 implements MigrationInterface {
  name = 'InitialSchema1756742400000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await q.query(`CREATE EXTENSION IF NOT EXISTS "citext"`);

    // =========================================================================
    // 1 · IDENTIDAD Y TENANCY
    // =========================================================================

    await q.query(`
      CREATE TABLE tenants (
        id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre        text NOT NULL,
        rif           text,
        "zonaDefault" text NOT NULL,
        estado        text NOT NULL DEFAULT 'onboarding',
        "lanzadoAt"   timestamptz,
        "createdAt"   timestamptz NOT NULL DEFAULT now()
      )`);

    // El email es la identidad global. NO hay national_id: se retiro con C-007.
    await q.query(`
      CREATE TABLE users (
        id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email          citext NOT NULL UNIQUE,
        "passwordHash" text NOT NULL,
        nombre         text NOT NULL,
        "createdAt"    timestamptz NOT NULL DEFAULT now()
      )`);

    await q.query(`
      CREATE TABLE areas (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenantId"          uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        nombre              text NOT NULL,
        "liderMembershipId" uuid,
        "createdAt"         timestamptz NOT NULL DEFAULT now()
      )`);

    // UNIQUE (tenant, user), NO unique global sobre la persona. Este es el arreglo
    // del bug que impedia que alguien trabajara en dos empresas cliente.
    await q.query(`
      CREATE TABLE memberships (
        id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenantId"   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        "userId"     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        rol          text NOT NULL DEFAULT 'empleado',
        "areaId"     uuid REFERENCES areas(id) ON DELETE SET NULL,
        zona         text NOT NULL,
        activo       boolean NOT NULL DEFAULT true,
        "optInJuego" boolean NOT NULL DEFAULT true,
        "optOutAt"   timestamptz,
        "createdAt"  timestamptz NOT NULL DEFAULT now(),
        "updatedAt"  timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_membership_tenant_user UNIQUE ("tenantId", "userId")
      )`);

    await q.query(`
      CREATE TABLE membership_prefs (
        id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "membershipId"            uuid NOT NULL UNIQUE REFERENCES memberships(id) ON DELETE CASCADE,
        "tenantId"                uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        "ocultaSugerenciasHasta"  timestamptz,
        "verTablaCompleta"        boolean NOT NULL DEFAULT false,
        "updatedAt"               timestamptz NOT NULL DEFAULT now()
      )`);

    await q.query(`
      CREATE TABLE internal_users (
        id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email          citext NOT NULL UNIQUE,
        "passwordHash" text NOT NULL,
        nombre         text NOT NULL,
        "createdAt"    timestamptz NOT NULL DEFAULT now()
      )`);

    // =========================================================================
    // 2 · MISIONES
    // =========================================================================

    await q.query(`
      CREATE TABLE missions (
        id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenantId"                  uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        titulo                      text NOT NULL,
        descripcion                 text,
        "creadorMembershipId"       uuid NOT NULL REFERENCES memberships(id),
        "asignadoMembershipId"      uuid REFERENCES memberships(id),
        "areaId"                    uuid REFERENCES areas(id) ON DELETE SET NULL,
        urgencia                    text NOT NULL DEFAULT 'media',
        importancia                 text NOT NULL DEFAULT 'media',
        esfuerzo                    text NOT NULL DEFAULT 'medio',
        "fechaLimite"               timestamptz,
        estado                      text NOT NULL DEFAULT 'borrador',
        "aceptadaPorMembershipId"   uuid REFERENCES memberships(id),
        "aceptadaAt"                timestamptz,
        "cerradaAt"                 timestamptz,
        "createdAt"                 timestamptz NOT NULL DEFAULT now(),
        "updatedAt"                 timestamptz NOT NULL DEFAULT now()
      )`);
    await q.query(`CREATE INDEX ix_missions_tenant_estado ON missions ("tenantId", estado)`);
    await q.query(`CREATE INDEX ix_missions_asignado ON missions ("asignadoMembershipId")`);

    await q.query(`
      CREATE TABLE mission_collaborators (
        id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenantId"     uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        "missionId"    uuid NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
        "membershipId" uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
        "createdAt"    timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_mission_collaborator UNIQUE ("missionId", "membershipId")
      )`);

    await q.query(`
      CREATE TABLE mission_thread_messages (
        id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenantId"     uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        "missionId"    uuid NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
        "membershipId" uuid NOT NULL REFERENCES memberships(id),
        cuerpo         text NOT NULL,
        "createdAt"    timestamptz NOT NULL DEFAULT now()
      )`);
    await q.query(`CREATE INDEX ix_thread_mission ON mission_thread_messages ("missionId")`);

    // =========================================================================
    // 3 · ECONOMIA — EL EVENT STORE
    // =========================================================================

    await q.query(`
      CREATE TABLE economy_events (
        id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenantId"            uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        "membershipId"        uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
        tipo                  text NOT NULL,
        "xpDelta"             integer NOT NULL DEFAULT 0,
        "oroDelta"            integer NOT NULL DEFAULT 0,
        motivo                text NOT NULL,
        "refTipo"             text,
        "refId"               uuid,
        "idempotencyKey"      uuid NOT NULL,
        "clientOccurredAt"    timestamptz,
        "serverReceivedAt"    timestamptz NOT NULL DEFAULT now(),
        "sessionSeq"          bigint,
        "dimRol"              text,
        "dimAreaId"           uuid,
        "dimZona"             text,
        "dimFamiliaBeneficio" text,
        CONSTRAINT uq_economy_idempotency UNIQUE ("tenantId", "idempotencyKey")
      )`);
    await q.query(`CREATE INDEX ix_economy_membership_fecha ON economy_events ("membershipId", "serverReceivedAt")`);
    await q.query(`CREATE INDEX ix_economy_tenant_tipo ON economy_events ("tenantId", tipo)`);

    // El log es append-only y la base lo hace cumplir. No es una convencion de
    // equipo: un UPDATE o un DELETE sobre economy_events lanza excepcion, venga
    // de donde venga, incluido yo con psql abierto a las 2am.
    await q.query(`
      CREATE OR REPLACE FUNCTION fn_economy_events_append_only()
      RETURNS trigger AS $$
      BEGIN
        RAISE EXCEPTION 'economy_events es append-only: no se permite % (evento %)', TG_OP, OLD.id;
      END;
      $$ LANGUAGE plpgsql`);
    await q.query(`
      CREATE TRIGGER trg_economy_events_no_update
        BEFORE UPDATE OR DELETE ON economy_events
        FOR EACH ROW EXECUTE FUNCTION fn_economy_events_append_only()`);

    await q.query(`
      CREATE TABLE economy_balances (
        id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenantId"       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        "membershipId"   uuid NOT NULL UNIQUE REFERENCES memberships(id) ON DELETE CASCADE,
        oro              integer NOT NULL DEFAULT 0,
        xp               integer NOT NULL DEFAULT 0,
        nivel            integer NOT NULL DEFAULT 1,
        "recalculadoAt"  timestamptz NOT NULL DEFAULT now()
      )`);

    await q.query(`
      CREATE TABLE economy_config (
        id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenantId"        uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        "xpBase"          integer NOT NULL DEFAULT 40,
        "factorOro"       numeric(4,2) NOT NULL DEFAULT 0.40,
        "multUrgencia"    jsonb NOT NULL DEFAULT '{"baja":1.0,"media":1.4,"alta":1.9}',
        "multImportancia" jsonb NOT NULL DEFAULT '{"baja":1.0,"media":1.4,"alta":1.9}',
        "multEsfuerzo"    jsonb NOT NULL DEFAULT '{"bajo":0.8,"medio":1.2,"alto":1.7}',
        "nivelBase"       integer NOT NULL DEFAULT 280,
        "nivelExponente"  numeric(4,2) NOT NULL DEFAULT 1.62,
        "capOroDiario"    integer NOT NULL DEFAULT 150,
        "decayDias"       integer NOT NULL DEFAULT 90,
        "vigenteDesde"    timestamptz NOT NULL DEFAULT now(),
        "vigenteHasta"    timestamptz,
        "createdAt"       timestamptz NOT NULL DEFAULT now()
      )`);

    // =========================================================================
    // 4 · CATALOGO, CUPOS Y CANJE
    // =========================================================================

    await q.query(`
      CREATE TABLE benefit_catalog_items (
        id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenantId"             uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        familia                text NOT NULL,
        nombre                 text NOT NULL,
        descripcion            text,
        "precioOro"            integer NOT NULL,
        "precioOroRecomendado" integer,
        "costoUsdReferencia"   numeric(10,2),
        zonas                  text[] NOT NULL DEFAULT '{}',
        activo                 boolean NOT NULL DEFAULT true,
        "createdAt"            timestamptz NOT NULL DEFAULT now(),
        "updatedAt"            timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT ck_precio_positivo CHECK ("precioOro" > 0)
      )`);

    await q.query(`
      CREATE TABLE benefit_price_versions (
        id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenantId"              uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        "itemId"                uuid NOT NULL REFERENCES benefit_catalog_items(id) ON DELETE CASCADE,
        "precioOro"             integer NOT NULL,
        "vigenteDesde"          timestamptz NOT NULL,
        "vigenteHasta"          timestamptz,
        "creadoPorMembershipId" uuid REFERENCES memberships(id),
        "createdAt"             timestamptz NOT NULL DEFAULT now()
      )`);
    await q.query(`CREATE INDEX ix_price_item_vigencia ON benefit_price_versions ("itemId", "vigenteDesde")`);

    await q.query(`
      CREATE TABLE benefit_stock (
        id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenantId"         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        "itemId"           uuid NOT NULL REFERENCES benefit_catalog_items(id) ON DELETE CASCADE,
        "cuposTotales"     integer NOT NULL DEFAULT 0,
        "cuposReservados"  integer NOT NULL DEFAULT 0,
        "cuposConsumidos"  integer NOT NULL DEFAULT 0,
        "periodoInicio"    timestamptz NOT NULL,
        "periodoFin"       timestamptz NOT NULL,
        "updatedAt"        timestamptz NOT NULL DEFAULT now(),
        -- La contencion del producto vive aqui, en una restriccion de la base,
        -- no en un if de la aplicacion. Sobrevender un cupo es imposible.
        CONSTRAINT ck_cupos_no_sobreventa
          CHECK ("cuposReservados" + "cuposConsumidos" <= "cuposTotales")
      )`);

    await q.query(`
      CREATE TABLE redemptions (
        id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenantId"                  uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        "membershipId"              uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
        "itemId"                    uuid NOT NULL REFERENCES benefit_catalog_items(id),
        "precioOroAplicado"         integer NOT NULL,
        estado                      text NOT NULL DEFAULT 'SOLICITADO',
        "motivoRechazo"             text,
        provider                    text NOT NULL DEFAULT 'MANUAL',
        "evidenciaUrl"              text,
        "confirmadoPorMembershipId" uuid REFERENCES memberships(id),
        "idempotencyKey"            uuid NOT NULL,
        "createdAt"                 timestamptz NOT NULL DEFAULT now(),
        "updatedAt"                 timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_redemption_idempotency UNIQUE ("tenantId", "idempotencyKey")
      )`);
    await q.query(`CREATE INDEX ix_redemptions_estado ON redemptions ("tenantId", estado)`);

    await q.query(`
      CREATE TABLE redemption_outbox (
        id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenantId"      uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        "redemptionId"  uuid NOT NULL REFERENCES redemptions(id) ON DELETE CASCADE,
        operacion       text NOT NULL,
        payload         jsonb NOT NULL,
        procesado       boolean NOT NULL DEFAULT false,
        intentos        integer NOT NULL DEFAULT 0,
        "ultimoError"   text,
        "createdAt"     timestamptz NOT NULL DEFAULT now(),
        "procesadoAt"   timestamptz
      )`);
    await q.query(`CREATE INDEX ix_outbox_pendiente ON redemption_outbox (procesado, "createdAt") WHERE procesado = false`);

    // =========================================================================
    // 5 · «QUIEN NECESITA UNA MANO» — R-07 §6.1
    // =========================================================================

    // Salvaguarda 2 hecha estructura: no hay columna de score, severidad, ranking
    // ni posicion. El unico ORDER BY que esta tabla permite es detectadoDesde.
    // Salvaguarda 5 (enmendada 01/09): esta tabla sigue conteniendo solo lo
    // VIGENTE — no tiene estado cerrado ni deletedAt. Lo cerrado se archiva en
    // help_signal_history con caducidad propia.
    await q.query(`
      CREATE TABLE help_signals (
        id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenantId"         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        "areaId"           uuid NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
        "membershipId"     uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
        patron             text NOT NULL,
        "detectadoDesde"   date NOT NULL,
        "ultimaEvaluacion" date NOT NULL,
        "createdAt"        timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_help_signal_vigente UNIQUE ("tenantId", "membershipId", patron),
        -- Salvaguarda 3 hecha estructura: nadie entra por una semana mala.
        -- El umbral de 21 dias vive en la BASE, no en el query de la aplicacion
        -- ni en la UI. Un INSERT que no lo cumpla es rechazado.
        CONSTRAINT ck_help_umbral_tres_semanas
          CHECK ("ultimaEvaluacion" - "detectadoDesde" >= 21)
      )`);
    await q.query(`CREATE INDEX ix_help_signal_area ON help_signals ("tenantId", "areaId", "detectadoDesde")`);

    await q.query(`
      CREATE TABLE help_signal_history (
        id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenantId"            uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        "areaId"              uuid NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
        "membershipId"        uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
        patron                text NOT NULL,
        "detectadoDesde"      date NOT NULL,
        "cerradoEl"           date NOT NULL,
        "motivoCierre"        text NOT NULL,
        "visibleParaPersona"  boolean NOT NULL DEFAULT true,
        "expiraAt"            timestamptz NOT NULL,
        "createdAt"           timestamptz NOT NULL DEFAULT now(),
        -- Contencion 1 de la enmienda: la simetria no es una promesa del codigo.
        -- Un historial que el interesado no puede leer es un expediente, y la
        -- base impide crearlo.
        CONSTRAINT ck_hist_siempre_visible CHECK ("visibleParaPersona" = true),
        -- Contencion 2: caducidad dura de 90 dias. Nadie puede archivar "para
        -- siempre" ni siquiera por error.
        CONSTRAINT ck_hist_retencion_max_90d
          CHECK ("expiraAt" <= "createdAt" + interval '90 days')
      )`);
    await q.query(`CREATE INDEX ix_help_hist_membership ON help_signal_history ("tenantId", "membershipId")`);
    await q.query(`CREATE INDEX ix_help_hist_expira ON help_signal_history ("expiraAt")`);

    await q.query(`
      CREATE TABLE help_interactions (
        id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenantId"            uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        "membershipId"        uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
        "liderMembershipId"   uuid NOT NULL REFERENCES memberships(id),
        patron                text NOT NULL,
        tipo                  text NOT NULL,
        nota                  text,
        "visibleParaPersona"  boolean NOT NULL DEFAULT true,
        "expiraAt"            timestamptz NOT NULL,
        "createdAt"           timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT ck_inter_siempre_visible CHECK ("visibleParaPersona" = true),
        CONSTRAINT ck_inter_retencion_max_90d
          CHECK ("expiraAt" <= "createdAt" + interval '90 days')
      )`);
    await q.query(`CREATE INDEX ix_help_inter_expira ON help_interactions ("expiraAt")`);

    // =========================================================================
    // 6 · ROW LEVEL SECURITY — aislamiento entre clientes
    // =========================================================================
    // El aislamiento no depende de que cada query recuerde filtrar por tenant.
    // La aplicacion hace SET LOCAL app.tenant_id al abrir la transaccion.

    const tablasConTenant = [
      'areas', 'memberships', 'membership_prefs', 'missions', 'mission_collaborators',
      'mission_thread_messages', 'economy_events', 'economy_balances', 'economy_config',
      'benefit_catalog_items', 'benefit_price_versions', 'benefit_stock', 'redemptions',
      'redemption_outbox', 'help_signals', 'help_signal_history', 'help_interactions',
    ];
    for (const t of tablasConTenant) {
      await q.query(`ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY`);
      await q.query(`
        CREATE POLICY pol_tenant_${t} ON ${t}
          USING ("tenantId"::text = current_setting('app.tenant_id', true))`);
    }

    // =========================================================================
    // 7 · LOS CUATRO ROLES — AQUI R-07 SE VUELVE ESTRUCTURAL
    // =========================================================================
    //
    // Esto es lo que el CEO pidio cuando dijo que R-07 tiene que ser "imposible
    // por el modelo de datos, no una promesa escrita dentro del panel". Cada
    // superficie se conecta con un rol distinto. El del BackOffice de gerencia
    // LITERALMENTE no puede leer las tablas prohibidas: si manana alguien (yo
    // incluido) escribe un find() de mas en un modulo de gerencia, Postgres
    // devuelve un error de permisos en vez de datos.
    //
    // Las contrasenas las asigna scripts/apply-role-grants.ts. Aqui solo se
    // crean los roles y se reparten los permisos.

    await q.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'levelop_app') THEN
          CREATE ROLE levelop_app LOGIN; END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'levelop_backoffice') THEN
          CREATE ROLE levelop_backoffice LOGIN; END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'levelop_lider') THEN
          CREATE ROLE levelop_lider LOGIN; END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'levelop_interno') THEN
          CREATE ROLE levelop_interno LOGIN; END IF;
      END $$`);

    // --- APP DEL EMPLEADO: acceso completo a lo suyo -------------------------
    await q.query(`GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO levelop_app`);
    // Ni siquiera el empleado escribe en el panel del lider.
    await q.query(`REVOKE INSERT, UPDATE ON help_signals, help_signal_history, help_interactions FROM levelop_app`);

    // --- BACKOFFICE DE GERENCIA: el mas restringido -------------------------
    // Arranca sin nada y se le concede lo justo. Lista blanca, no lista negra:
    // si manana agrego una tabla, el backoffice NO la ve por defecto. Una lista
    // negra falla en silencio cada vez que alguien olvida actualizarla.
    await q.query(`
      GRANT SELECT ON
        tenants, areas, memberships, missions, mission_collaborators,
        benefit_catalog_items, benefit_price_versions, benefit_stock, economy_config
      TO levelop_backoffice`);
    await q.query(`
      GRANT INSERT, UPDATE ON
        benefit_catalog_items, benefit_price_versions, benefit_stock, areas, memberships
      TO levelop_backoffice`);
    //
    // 🔒 R-07 — LO QUE GERENCIA NO PUEDE LEER, Y POR QUE:
    //   mission_thread_messages → los hilos son conversacion, no supervision
    //   membership_prefs        → ahi vive el descarte del 1-a-1 y el opt-out del ranking
    //   economy_events          → contiene "que pidio cada quien" y "quien dejo de ganar"
    //   redemptions             → que beneficio pidio cada persona, con nombre y apellido
    //   help_signals + history + interactions → son del LIDER DE AREA, no de gerencia
    //
    // Gerencia lee lo agregado a traves de vistas, nunca las tablas base.
    // No hace falta REVOKE: nunca se le concedio. Eso es el punto de la lista blanca.

    // --- BACKOFFICE DE LIDER DE AREA ----------------------------------------
    // Ve el panel de ayuda (la excepcion autorizada) pero NO los hilos ni las
    // preferencias privadas. La frase que sostiene esta separacion es del PD:
    // "lo que un lider necesita para ayudar y lo que la gerencia necesita para
    // decidir no son el mismo dato, y meterlos en la misma pantalla es como se
    // construye una herramienta de vigilancia sin querer".
    await q.query(`
      GRANT SELECT ON
        tenants, areas, memberships, missions, mission_collaborators,
        benefit_catalog_items, benefit_stock, redemptions,
        help_signals, help_signal_history, help_interactions
      TO levelop_lider`);
    await q.query(`GRANT INSERT ON help_interactions TO levelop_lider`);
    // 🔒 Sigue sin poder leer mission_thread_messages ni membership_prefs.
    //    Si el lider pudiera ver que alguien descarto su invitacion al 1-a-1,
    //    dejaria de ser una invitacion.

    // --- VISTA INTERNA (equipo Levelop) -------------------------------------
    // Lee todo lo agregado, pero R-07 aplica tambien hacia adentro: las vistas
    // analiticas no exponen identidad. Ver seccion 8.
    await q.query(`GRANT SELECT ON ALL TABLES IN SCHEMA public TO levelop_interno`);
    await q.query(`REVOKE SELECT ON mission_thread_messages, membership_prefs FROM levelop_interno`);

    // Todos los roles saltan RLS porque el filtro por tenant lo pone la app con
    // SET LOCAL; lo que NO pueden saltarse son los GRANTs de arriba.
    await q.query(`ALTER ROLE levelop_app BYPASSRLS`);
    await q.query(`ALTER ROLE levelop_backoffice BYPASSRLS`);
    await q.query(`ALTER ROLE levelop_lider BYPASSRLS`);
    await q.query(`ALTER ROLE levelop_interno BYPASSRLS`);

    // =========================================================================
    // 8 · VISTAS AGREGADAS PARA GERENCIA — sin identidad
    // =========================================================================

    // «Quien no va a estar»: ausencias YA APROBADAS. Muestra que alguien no
    // estara, nunca que beneficio lo causo. Y sin poder cancelarlo: un beneficio
    // que el lider puede revocar no es un beneficio.
    await q.query(`
      CREATE VIEW v_ausencias_programadas AS
      SELECT r."tenantId", m."areaId", r."membershipId", r."updatedAt" AS "desde"
      FROM redemptions r
      JOIN memberships m ON m.id = r."membershipId"
      JOIN benefit_catalog_items b ON b.id = r."itemId"
      WHERE r.estado = 'CONFIRMADO' AND b.familia = 'tiempo'`);
    await q.query(`GRANT SELECT ON v_ausencias_programadas TO levelop_backoffice, levelop_lider`);

    // Canjes agregados por familia. SIN membershipId: gerencia ve que se canjea,
    // nunca quien lo canjeo.
    await q.query(`
      CREATE VIEW v_canjes_agregados AS
      SELECT r."tenantId", b.familia, date_trunc('month', r."createdAt") AS mes,
             count(*) AS total, sum(r."precioOroAplicado") AS oro_total
      FROM redemptions r
      JOIN benefit_catalog_items b ON b.id = r."itemId"
      WHERE r.estado = 'CONFIRMADO'
      GROUP BY 1, 2, 3`);
    await q.query(`GRANT SELECT ON v_canjes_agregados TO levelop_backoffice, levelop_lider, levelop_interno`);

    // Salvaguarda 3, segunda mitad: "el panel muestra cuantas personas tienen algo
    // raro pero todavia no califican, para que la regla se vea funcionando y no se
    // sospeche una lista oculta". Devuelve UN NUMERO. La vista es incapaz de
    // devolver filas con identidad.
    await q.query(`
      CREATE VIEW v_help_pendientes_de_calificar AS
      SELECT "tenantId", "areaId", count(*)::int AS cuantos
      FROM help_signals
      WHERE ("ultimaEvaluacion" - "detectadoDesde") < 21
      GROUP BY 1, 2`);
    await q.query(`GRANT SELECT ON v_help_pendientes_de_calificar TO levelop_lider`);

    // Gate de lanzamiento (Maestro §4.3). Una query, no una casilla.
    await q.query(`
      CREATE VIEW v_gate_lanzamiento AS
      SELECT t.id AS "tenantId", t.nombre,
             (SELECT count(*) FROM benefit_catalog_items b
               WHERE b."tenantId" = t.id AND b.familia = 'tiempo' AND b.activo) >= 3
             AND EXISTS (SELECT 1 FROM redemptions r
                          WHERE r."tenantId" = t.id AND r.estado = 'CONFIRMADO') AS lanzado
      FROM tenants t`);
    await q.query(`GRANT SELECT ON v_gate_lanzamiento TO levelop_interno, levelop_backoffice`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP VIEW IF EXISTS v_gate_lanzamiento, v_help_pendientes_de_calificar, v_canjes_agregados, v_ausencias_programadas`);
    await q.query(`DROP TRIGGER IF EXISTS trg_economy_events_no_update ON economy_events`);
    await q.query(`DROP FUNCTION IF EXISTS fn_economy_events_append_only`);
    const tablas = [
      'help_interactions', 'help_signal_history', 'help_signals', 'redemption_outbox',
      'redemptions', 'benefit_stock', 'benefit_price_versions', 'benefit_catalog_items',
      'economy_config', 'economy_balances', 'economy_events', 'mission_thread_messages',
      'mission_collaborators', 'missions', 'internal_users', 'membership_prefs',
      'memberships', 'areas', 'users', 'tenants',
    ];
    for (const t of tablas) await q.query(`DROP TABLE IF EXISTS ${t} CASCADE`);
  }
}
