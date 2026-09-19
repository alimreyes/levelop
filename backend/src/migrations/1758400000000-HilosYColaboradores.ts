import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * =============================================================================
 * HILOS, MENCIONES Y COLABORADORES — 19/09/26
 * =============================================================================
 *
 * Las dos tablas ya existen desde la migración inicial (`mission_thread_messages`
 * y `mission_collaborators`). Lo único que faltaba para poder usarlas era un
 * permiso, y vale la pena explicar por qué hizo falta una migración para algo
 * que parece trivial.
 *
 * `levelop_app` tiene `GRANT SELECT, INSERT, UPDATE ON ALL TABLES` — **sin
 * DELETE**. Eso fue deliberado: en un sistema donde el saldo es la suma de un
 * log, poder borrar filas es poder reescribir la historia. Por eso el decay
 * emite eventos negativos en vez de borrar, y por eso una misión cancelada
 * cambia de estado en vez de desaparecer.
 *
 * Pero Alim pidió que un mensaje del hilo se pueda borrar, y un mensaje de chat
 * no es un asiento contable: si alguien escribe algo y se arrepiente, «borrar»
 * tiene que significar borrar. Un borrado lógico (`borradoAt`) habría evitado
 * esta migración usando el UPDATE que ya existe, y lo descarté: dejar el texto
 * en la base después de que la persona lo borró es exactamente el tipo de
 * promesa incumplida que R-07 existe para evitar. Que gerencia no pueda leer la
 * tabla no es excusa para guardar lo que alguien pidió eliminar.
 *
 * Entonces el DELETE se concede, pero SOLO sobre estas dos tablas y SOLO para
 * `levelop_app`. La lista blanca se mantiene: el rol de la app sigue sin poder
 * borrar un evento de economía, un canje ni una misión. Gerencia, líder e
 * interno no ganan nada — de hecho `mission_thread_messages` les sigue estando
 * prohibida hasta para leer.
 *
 * Quién puede borrar QUÉ es una regla de aplicación, no de base: el endpoint
 * solo deja borrar el mensaje propio. Postgres no distingue «mi fila» de «la de
 * otro», así que ese control vive en `MissionsController.borrarMensaje()` con
 * un WHERE por `membershipId`. Lo digo explícito porque el resto del sistema
 * empuja lo contrario —las reglas que importan viven en el esquema— y esta es
 * una excepción consciente, no un olvido.
 */
export class HilosYColaboradores1758400000000 implements MigrationInterface {
  name = 'HilosYColaboradores1758400000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`GRANT DELETE ON mission_thread_messages TO levelop_app`);
    await q.query(`GRANT DELETE ON mission_collaborators TO levelop_app`);

    // El hilo se lee siempre en orden por misión: sin este índice, cada apertura
    // de una misión con conversación larga es un scan de la tabla entera.
    await q.query(`
      CREATE INDEX IF NOT EXISTS ix_thread_mision_fecha
        ON mission_thread_messages ("missionId", "createdAt")`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX IF EXISTS ix_thread_mision_fecha`);
    await q.query(`REVOKE DELETE ON mission_collaborators FROM levelop_app`);
    await q.query(`REVOKE DELETE ON mission_thread_messages FROM levelop_app`);
  }
}
