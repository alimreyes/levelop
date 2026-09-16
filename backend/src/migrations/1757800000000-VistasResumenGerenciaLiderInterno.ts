import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * =============================================================================
 * VISTAS DE RESUMEN — acuerdo del 03/09 con Alim, nunca implementado hasta hoy
 * =============================================================================
 *
 * Contexto (`EA - CTO.md` MSG-014, `CTO - Product Designer.md` MSG-006):
 * Alim propuso una tabla por persona (área/nombre/tareas cumplidas/Oro/
 * beneficios) explícitamente para identificar "TOP PERFORMER / BOTTOM
 * PERFORMER" en gerencia y líder de área — eso es exactamente lo que R-07
 * prohíbe. Se acordó: la fila completa por persona vive SOLO en el Backoffice
 * interno de Levelop (no es superficie de gestión sobre empleados del
 * cliente); gerencia y líder reciben el mismo dato agregado por área, sin
 * nombre, y solo si el área tiene 4+ miembros activos (mismo piso que `CH-10`
 * para el Desafío entre áreas, por consistencia).
 *
 * NUEVA migración, no edición de la inicial — esa ya corrió contra la base
 * real de Alim; TypeORM no vuelve a ejecutar una migración ya aplicada, así
 * que un cambio ahí no haría nada. Las migraciones son de solo-agregar.
 *
 * DEUDA DECLARADA, a propósito: `beneficios adquiridos / activos / por
 * vencer` del boceto original de Alim NO están en ninguna de las dos vistas
 * todavía. No es un olvido — es que "activo" y "por vencer" no tienen una
 * definición de producto clara hoy (¿un beneficio "vence" cuándo? ¿el
 * `benefit_stock` no trackea vencimiento individual por canje). Adivinar la
 * regla sería peor que no tener la columna: alguien tomaría una decisión
 * sobre un número inventado. Falta que el PD o Alim la definan.
 */
export class VistasResumenGerenciaLiderInterno1757800000000 implements MigrationInterface {
  name = 'VistasResumenGerenciaLiderInterno1757800000000';

  public async up(q: QueryRunner): Promise<void> {
    // --- Vista interna: fila completa POR PERSONA, sin restricción --------
    // Solo `levelop_interno` la lee. No es superficie de gestión sobre los
    // empleados del cliente — es la vista operativa propia de Levelop.
    await q.query(`
      CREATE VIEW v_resumen_usuario_interno AS
      SELECT
        m."tenantId",
        m.id                                              AS "membershipId",
        m."areaId",
        u.nombre,
        COALESCE(eb.oro, 0)                                AS "oroDisponible",
        COALESCE((
          SELECT SUM(e."oroDelta") FROM economy_events e
           WHERE e."membershipId" = m.id AND e.tipo = 'ORO_GANADO'
             AND e."serverReceivedAt" > now() - interval '365 days'
        ), 0)::int                                         AS "oroGanadoAnio",
        (
          SELECT count(*) FROM missions mi
           WHERE mi."aceptadaPorMembershipId" = m.id AND mi.estado = 'cerrada'
             AND mi."cerradaAt" > now() - interval '365 days'
        )::int                                             AS "tareasCumplidasAnio"
      FROM memberships m
      JOIN users u ON u.id = m."userId"
      LEFT JOIN economy_balances eb ON eb."membershipId" = m.id
      WHERE m.activo`);
    await q.query(`GRANT SELECT ON v_resumen_usuario_interno TO levelop_interno`);

    // --- Vista de área: el mismo dato, agregado, SIN nombre ni user_id ------
    // Las columnas de identidad no EXISTEN aquí — no es que la UI no las
    // muestre, es que no hay de dónde leerlas para gerencia/líder.
    await q.query(`
      CREATE VIEW v_resumen_area AS
      SELECT
        a."tenantId",
        a.id                                                AS "areaId",
        a.nombre                                             AS "nombreArea",
        count(m.id) FILTER (WHERE m.activo)::int             AS "miembrosActivos",
        (count(m.id) FILTER (WHERE m.activo) >= 4)           AS "mostrarDesempeno",
        COALESCE(AVG(
          (SELECT count(*) FROM missions mi
            WHERE mi."aceptadaPorMembershipId" = m.id AND mi.estado = 'cerrada'
              AND mi."cerradaAt" > now() - interval '365 days')
        ) FILTER (WHERE m.activo), 0)                        AS "tareasCumplidasAnioPromedio",
        COALESCE(SUM(
          (SELECT SUM(e."oroDelta") FROM economy_events e
            WHERE e."membershipId" = m.id AND e.tipo = 'ORO_GANADO'
              AND e."serverReceivedAt" > now() - interval '365 days')
        ) FILTER (WHERE m.activo), 0)::int                   AS "oroGanadoAnioTotal"
      FROM areas a
      LEFT JOIN memberships m ON m."areaId" = a.id
      GROUP BY a."tenantId", a.id, a.nombre`);
    await q.query(`GRANT SELECT ON v_resumen_area TO levelop_backoffice, levelop_lider`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP VIEW IF EXISTS v_resumen_area`);
    await q.query(`DROP VIEW IF EXISTS v_resumen_usuario_interno`);
  }
}
