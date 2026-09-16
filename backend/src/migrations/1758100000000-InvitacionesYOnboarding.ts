import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * =============================================================================
 * INVITACIONES Y ONBOARDING (16/09/26)
 * =============================================================================
 *
 * Pedido de Alim, textual: "es como si hubiéramos invertido todos estos días
 * en hacer log in y ya, ni siquiera en el registro porque lo hicimos con
 * usuarios inventados y hardcodeados". Tiene razón: hasta hoy no existía
 * ninguna forma de que una empresa real entrara al sistema sin que yo
 * corriera un script. Esta migración es el esquema de ese camino:
 *
 *   1. Tabla `invitations` (ver la entidad para el porqué de cada columna).
 *   2. Permisos, por rol, siguiendo la lista blanca de la migración inicial:
 *      - `levelop_interno` puede CREAR empresas e invitaciones (es quien da de
 *        alta un cliente y emite la primera invitación al admin). Hasta hoy
 *        solo leía.
 *      - `levelop_backoffice` puede crear y anular invitaciones de su tenant,
 *        y leer `users` SOLO por columna (id, email, nombre) — lo mínimo para
 *        administrar personas: a quién invité, quién es cada membresía, qué
 *        rol y qué área tiene. Mismo mecanismo que se usó el 15/09 para líder.
 *        NO es una fuga de R-07: R-07 prohíbe juntar identidad con desempeño
 *        en una superficie de gestión; una lista de "quién trabaja aquí y en
 *        qué área" sin ningún número de desempeño es administración, no
 *        evaluación. Las vistas agregadas siguen sin nombre.
 *      - `levelop_app` lee y actualiza `invitations` porque aceptar una
 *        invitación es una acción de la persona (endpoint público en
 *        `/auth`, que usa la conexión `app`). El GRANT ... ON ALL TABLES de
 *        la migración inicial no cubre tablas nuevas (misma lección que
 *        `notifications` el 14/09).
 */
export class InvitacionesYOnboarding1758100000000 implements MigrationInterface {
  name = 'InvitacionesYOnboarding1758100000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE invitations (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        email text NOT NULL,
        rol text NOT NULL DEFAULT 'empleado',
        "areaId" uuid REFERENCES areas(id) ON DELETE SET NULL,
        zona text,
        token text NOT NULL,
        "creadaPorMembershipId" uuid,
        "creadaPorInternalUserId" uuid,
        "expiraAt" timestamptz NOT NULL,
        "aceptadaAt" timestamptz,
        "aceptadaMembershipId" uuid,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT ck_invitations_rol CHECK (rol IN ('empleado','lider_area','gerencia','admin_tenant')),
        CONSTRAINT ck_invitations_email_minusculas CHECK (email = lower(email))
      )`);
    await q.query(`CREATE UNIQUE INDEX uq_invitations_token ON invitations (token)`);
    await q.query(`CREATE INDEX idx_invitations_tenant ON invitations ("tenantId")`);
    await q.query(`CREATE INDEX idx_invitations_email ON invitations (email)`);

    // --- app: aceptar la invitación (público, conexión app) ------------------
    await q.query(`GRANT SELECT, INSERT, UPDATE ON invitations TO levelop_app`);

    // --- gerencia: administrar personas e invitaciones de SU tenant ----------
    await q.query(`GRANT SELECT, INSERT, UPDATE ON invitations TO levelop_backoffice`);
    await q.query(`GRANT SELECT (id, email, nombre) ON users TO levelop_backoffice`);

    // --- interno: dar de alta empresas y emitir la primera invitación --------
    await q.query(`GRANT INSERT, UPDATE ON tenants TO levelop_interno`);
    // (SELECT también: el "ON ALL TABLES" inicial no alcanza a tablas nuevas)
    await q.query(`GRANT SELECT, INSERT, UPDATE ON invitations TO levelop_interno`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`REVOKE SELECT, INSERT, UPDATE ON invitations FROM levelop_interno`);
    await q.query(`REVOKE INSERT, UPDATE ON tenants FROM levelop_interno`);
    await q.query(`REVOKE SELECT (id, email, nombre) ON users FROM levelop_backoffice`);
    await q.query(`DROP TABLE IF EXISTS invitations`);
  }
}
