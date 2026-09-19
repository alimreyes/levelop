import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * =============================================================================
 * COLOR POR ÁREA — 19/09/26 (CAMBIOS 1.1, punto general de la APP)
 * =============================================================================
 *
 * Alim: «¿Podemos asignar un color a cada área? Bien sea un borde o un fondo
 * súper sutil, y que cambie de color la sección en el panel cuando se haga
 * click».
 *
 * DOS DECISIONES QUE VALE LA PENA EXPLICAR:
 *
 * 1 · La columna es NULLABLE y el color por defecto NO se guarda.
 *
 *    Si escribiera un color en cada área existente, el día que alguien agregue
 *    una novena área tendría que acordarse de elegirle uno, y si no lo hace se
 *    ve gris entre ocho de colores. Con la columna vacía, el frontend deriva el
 *    color de la POSICIÓN del área (orden estable de creación) contra una
 *    paleta fija de ocho. Una empresa que nunca toca nada tiene colores
 *    coherentes desde el primer día, y la columna existe para cuando gerencia
 *    quiera decir «Ventas es azul porque siempre fue azul».
 *
 *    O sea: el default no es un valor, es una regla. Un valor hay que
 *    mantenerlo; una regla se aplica sola.
 *
 * 2 · La paleta no la elegí a ojo.
 *
 *    Ocho colores validados con el verificador de paletas: banda de luminosidad
 *    correcta en modo claro y oscuro, croma suficiente para que ninguno se lea
 *    como gris, contraste ≥ 3:1 contra las dos superficies, y separación para
 *    daltonismo. El peor par adyacente queda en ΔE 7,3 (deuteranopía), que es
 *    aceptable SOLO con una segunda señal además del color — y acá siempre la
 *    hay: el nombre del área va escrito al lado del color, nunca el color solo.
 *    Eso último no es un detalle de accesibilidad, es la diferencia entre una
 *    pantalla que se puede usar y una que hay que adivinar.
 *
 * La paleta vive en `levelop-api.js` (`LevelopAPI.colorArea`) para que las
 * cuatro superficies usen exactamente la misma, y no tres parecidas.
 */
export class ColorDeArea1758500000000 implements MigrationInterface {
  name = 'ColorDeArea1758500000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE areas ADD COLUMN color text`);
    await q.query(`
      COMMENT ON COLUMN areas.color IS
        'Color de la marca del area (#rrggbb). NULL = se deriva de su posicion contra la paleta fija.'`);
    // Sin CHECK de formato: el DTO valida el patrón y un CHECK aquí obligaría a
    // una migración el día que aceptemos otra notación.
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE areas DROP COLUMN IF EXISTS color`);
  }
}
