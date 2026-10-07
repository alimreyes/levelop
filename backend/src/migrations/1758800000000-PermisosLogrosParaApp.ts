import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * =============================================================================
 * PERMISOS DE LOGROS PARA LA APP — 24/09/26
 * =============================================================================
 *
 * Corrige un error de `MedallasYMetaDelMes` (19/09), encontrado al correrla
 * por primera vez contra un Postgres real.
 *
 * Esa migración asumía que `levelop_app` «ya tiene SELECT/INSERT/UPDATE sobre
 * todo el esquema». No es así: el `GRANT ... ON ALL TABLES IN SCHEMA` de la
 * migración inicial solo cubre las tablas que existían el 01/09. Las tablas
 * nuevas no heredan nada, porque esta base no tiene `ALTER DEFAULT PRIVILEGES`.
 * Ya lo habíamos anotado en `AprobacionCanjeEnlaces...` (notifications) y en
 * `InvitacionesYOnboarding` (invitations), y aun así se nos pasó.
 *
 * Qué rompía: la app respondía «permission denied for table member_goals».
 * Como `cerrarMetasCumplidas()` corre ANTES del evaluador al cerrar una
 * misión, el error cortaba todo: no se otorgaba NINGUNA medalla ni trofeo, y
 * la vitrina y la meta del mes daban error. El cierre de la misión igual
 * funcionaba, porque las medallas van en «mejor esfuerzo».
 *
 * No se edita la migración del 19/09 porque puede estar ya aplicada en
 * Railway (la base local de Alim y la de producción son la misma). Esta es
 * nueva y es idempotente: correr un GRANT dos veces no cambia nada.
 *
 * R-07 sigue igual: solo `levelop_app` recibe permisos sobre `member_goals` y
 * `member_badges`. Gerencia, líder e interno no ganan nada.
 */
export class PermisosLogrosParaApp1758800000000 implements MigrationInterface {
  name = 'PermisosLogrosParaApp1758800000000';

  public async up(q: QueryRunner): Promise<void> {
    // La app es la que evalúa y otorga (INSERT) y la que muestra (SELECT).
    await q.query(`GRANT SELECT, INSERT ON member_badges TO levelop_app`);
    await q.query(`GRANT SELECT, INSERT ON area_badges TO levelop_app`);
    // La meta se fija, se corrige hasta el día 7 y se marca cumplida: UPDATE.
    await q.query(`GRANT SELECT, INSERT, UPDATE ON member_goals TO levelop_app`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`REVOKE SELECT, INSERT, UPDATE ON member_goals FROM levelop_app`);
    await q.query(`REVOKE SELECT, INSERT ON area_badges FROM levelop_app`);
    await q.query(`REVOKE SELECT, INSERT ON member_badges FROM levelop_app`);
  }
}
