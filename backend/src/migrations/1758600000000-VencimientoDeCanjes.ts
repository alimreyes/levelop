import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * =============================================================================
 * VENCIMIENTO DE CANJES — 19/09/26 (CAMBIOS 1.1, Perfil punto 4)
 * =============================================================================
 *
 * Alim pidió que en «Tus beneficios» aparezca «Se vence en [N] días», rojo a
 * los 2, amarillo a los 3, verde de 4 en adelante.
 *
 * PARA PONER ESE NÚMERO HUBO QUE INVENTAR EL CONCEPTO: hasta hoy un canje
 * confirmado **no vencía nunca**. Se confirmaba y quedaba ahí para siempre. Lo
 * digo explícito porque es la clase de cosa que se construye sin darse cuenta
 * de que se está creando una regla de negocio nueva, y después nadie recuerda
 * quién la decidió.
 *
 * LA REGLA QUE PROPONGO, y que queda escrita para que se pueda discutir:
 *
 * Un canje CONFIRMADO se puede usar dentro de `diasParaUsarCanje` días desde
 * que se confirmó. El default es 30. Lo fija gerencia por empresa, porque el
 * plazo razonable de «un día libre» y el de «un café» no son el mismo y no me
 * corresponde elegirlo a mí.
 *
 * TRES DECISIONES DENTRO DE ESA REGLA:
 *
 * 1 · El reloj arranca al CONFIRMAR, no al solicitar. Si empezara al
 *     solicitar, el tiempo que tarda gerencia en aprobar se lo comería el
 *     colaborador. Castigar a alguien por la demora de otro es la forma más
 *     rápida de que una regla se sienta injusta.
 *
 * 2 · Un canje vencido **no devuelve el Oro**, y esto sí es discutible: lo dejo
 *     así porque el cupo se reservó y la empresa lo tuvo apartado todo ese
 *     tiempo. Si el CFO prefiere devolverlo, es un evento compensatorio y la
 *     maquinaria ya existe (`revertir`). Anotado, no decidido por mí.
 *
 * 3 · `0` significa **sin vencimiento**, igual que el tope diario de Oro. La
 *     palanca queda puesta y apagable sin borrar el mecanismo — mismo criterio
 *     del 17/09, y por la misma razón: el día que un cliente pida lo contrario,
 *     es un registro, no un despliegue.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * UNA CORRECCIÓN QUE VALE ANOTAR: escribí la primera versión de esta migración
 * dando por hecho que `redemptions.confirmadoAt` ya existía, porque existe
 * `confirmadoPorMembershipId` y parecía impensable guardar QUIÉN confirmó sin
 * guardar CUÁNDO. No existía. Es el mismo error del 15/09 con
 * `levelop-interno.html` —describir un insumo de memoria en vez de abrirlo— y
 * la corrección es la misma: abrir el archivo antes de escribir contra él.
 *
 * Por eso la columna se crea acá. Y por eso el relleno de las filas viejas usa
 * `updatedAt`, que es lo mejor disponible pero **no es lo mismo**: si un canje
 * confirmado se tocó después por cualquier razón, su `updatedAt` es posterior
 * a su confirmación real y su vencimiento va a quedar corrido hacia adelante.
 * Prefiero un dato aproximado y declarado a uno exacto e inventado; de acá en
 * adelante el valor lo escribe `RedemptionsService.confirmar()` y es exacto.
 * ──────────────────────────────────────────────────────────────────────────
 */
export class VencimientoDeCanjes1758600000000 implements MigrationInterface {
  name = 'VencimientoDeCanjes1758600000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      ALTER TABLE economy_config ADD COLUMN "diasParaUsarCanje" integer NOT NULL DEFAULT 30`);
    await q.query(`
      COMMENT ON COLUMN economy_config."diasParaUsarCanje" IS
        'Dias para usar un canje confirmado. 0 = sin vencimiento. Lo fija gerencia.'`);

    await q.query(`ALTER TABLE redemptions ADD COLUMN "confirmadoAt" timestamptz`);
    await q.query(`
      COMMENT ON COLUMN redemptions."confirmadoAt" IS
        'Cuando paso a CONFIRMADO. Desde aqui corre el plazo para usarlo.'`);

    // Relleno aproximado y declarado, ver la nota de arriba.
    await q.query(`
      UPDATE redemptions SET "confirmadoAt" = "updatedAt"
       WHERE estado = 'CONFIRMADO' AND "confirmadoAt" IS NULL`);

    // El semáforo de la app pregunta siempre por lo confirmado de una persona,
    // ordenado por cuándo vence. Sin esto es un scan por cada apertura del
    // perfil, y el perfil se abre mucho.
    await q.query(`
      CREATE INDEX IF NOT EXISTS ix_redemptions_confirmados
        ON redemptions ("membershipId", "confirmadoAt")
        WHERE estado = 'CONFIRMADO'`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX IF EXISTS ix_redemptions_confirmados`);
    await q.query(`ALTER TABLE redemptions DROP COLUMN IF EXISTS "confirmadoAt"`);
    await q.query(`ALTER TABLE economy_config DROP COLUMN IF EXISTS "diasParaUsarCanje"`);
  }
}
