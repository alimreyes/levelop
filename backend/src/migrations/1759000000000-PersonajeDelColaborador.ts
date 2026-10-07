import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * =============================================================================
 * PERSONAJE DEL COLABORADOR — 07/10/26 («LEVELOP - Batch de Cambios»)
 * =============================================================================
 *
 * Ocho personajes de pixel art, hechos con el Agente de Diseño. La persona
 * ELIGE el suyo —no se gana— y el cambio queda bloqueado un tiempo.
 *
 * CUATRO DECISIONES, Y LA RAZÓN DE CADA UNA:
 *
 * 1 · VA EN `memberships`, NO EN `users`.
 *
 *    Una misma persona puede estar en dos empresas. Su personaje es su
 *    identidad DENTRO de una empresa, igual que su zona, su rol y su opt-in del
 *    juego — todos viven en la membresía. Si viviera en `users`, cambiar de
 *    personaje en un trabajo lo cambiaría en el otro, y nadie lo entendería.
 *
 * 2 · LA LISTA DE PERSONAJES NO ES UNA TABLA NI UN ENUM DE POSTGRES.
 *
 *    Es `text` con un CHECK contra las ocho claves. Un enum de Postgres
 *    obligaría a una migración para agregar el noveno personaje; un CHECK
 *    también, pero al menos se lee de un vistazo. La lista viva está en
 *    `personajes.catalogo.ts`, junto a los nombres y los archivos de imagen,
 *    por el mismo motivo que el catálogo de medallas vive en código: lo que
 *    define un personaje (su nombre, su dibujo, su poder) no es un dato que se
 *    edite, es parte del producto.
 *
 *    El CHECK está igual porque es la última línea: si alguien escribe
 *    'mago ' con espacio desde un script, la base lo rechaza.
 *
 * 3 · `personajeCambiadoAt` ES LA ÚNICA FUENTE DEL BLOQUEO.
 *
 *    No guardo «puede cambiar el día X» ni un contador: guardo CUÁNDO cambió, y
 *    el bloqueo se calcula. Un dato derivado guardado es un dato que se puede
 *    desviar del hecho que lo originó, y además el día que Alim cambie el plazo
 *    —hoy mismo hay una contradicción entre 30 y 15 días en su documento— todas
 *    las filas guardadas quedarían con el plazo viejo.
 *
 *    NULL = nunca eligió. Eso permite la regla de «primera elección libre» sin
 *    una columna más: si nunca eligió, no hay bloqueo que aplicar.
 *
 * 4 · EL PLAZO VIVE EN `economy_config`, COMO EL RESTO DE LAS PALANCAS.
 *
 *    Default 30. El documento de Alim dice «cada 30 días» en una frase y
 *    «esperar 15 días» en la siguiente; se lo pregunté. Mientras no responda,
 *    cambiarlo es un UPDATE, no un despliegue — que es exactamente para lo que
 *    sirve tener la configuración en la base.
 *
 *    Un detalle que pidió el GTD y que esta forma cumple sola: el reloj corre
 *    aunque la persona apague el juego. Como el bloqueo se calcula contra una
 *    fecha y no contra actividad, apagar y prender no lo reinicia.
 *
 * R-07: `personaje` es visible entre compañeros, como un avatar cualquiera —
 * va en el ranking y en la ficha. `personajeCambiadoAt` NO se expone a nadie
 * más que a su dueño: cuándo alguien cambió de personaje es un dato de
 * comportamiento sin ninguna acción posible asociada, y eso es justo lo que
 * R-07 mantiene fuera de las superficies de gestión.
 */
export class PersonajeDelColaborador1759000000000 implements MigrationInterface {
  name = 'PersonajeDelColaborador1759000000000';

  private static readonly CLAVES = [
    'caballero',
    'elfo',
    'sirena',
    'duende',
    'mago',
    'dragon',
    'barbaro',
    'bardo',
  ];

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE memberships ADD COLUMN personaje text`);
    await q.query(`ALTER TABLE memberships ADD COLUMN "personajeCambiadoAt" timestamptz`);
    await q.query(`
      ALTER TABLE memberships ADD CONSTRAINT ck_personaje_valido
        CHECK (personaje IS NULL OR personaje IN (${PersonajeDelColaborador1759000000000.CLAVES.map(
          (c) => `'${c}'`,
        ).join(', ')}))`);
    await q.query(`
      COMMENT ON COLUMN memberships.personaje IS
        'Clave del personaje elegido. NULL = todavia no eligio. Catalogo en personajes.catalogo.ts'`);
    await q.query(`
      COMMENT ON COLUMN memberships."personajeCambiadoAt" IS
        'Cuando cambio por ultima vez. El bloqueo se calcula desde aqui, no se guarda.'`);

    await q.query(`
      ALTER TABLE economy_config ADD COLUMN "diasBloqueoPersonaje" integer NOT NULL DEFAULT 30`);
    await q.query(`
      COMMENT ON COLUMN economy_config."diasBloqueoPersonaje" IS
        'Dias que hay que esperar para volver a cambiar de personaje. 0 = sin bloqueo.'`);

    // El ranking y la lista de compañeros leen el personaje de todo el tenant
    // de una sola vez; sin esto es un scan por cada carga del ranking.
    await q.query(`
      CREATE INDEX IF NOT EXISTS ix_memberships_personaje
        ON memberships ("tenantId", personaje) WHERE personaje IS NOT NULL`);

    // ⚠️ GRANTS — la lección del 24/09, que me costó que no se otorgara ni una
    // medalla: `GRANT ... ON ALL TABLES IN SCHEMA public` solo alcanza a las
    // tablas que EXISTÍAN cuando se ejecutó. No cubre las futuras.
    //
    // Acá no hace falta conceder nada porque son COLUMNAS de tablas que ya
    // existían, y los GRANT por tabla cubren las columnas nuevas. Lo escribo
    // igual para que la próxima vez que alguien lea esta migración buscando el
    // patrón, encuentre la distinción: columna nueva en tabla vieja, no hace
    // falta; tabla nueva, SIEMPRE hace falta.
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX IF EXISTS ix_memberships_personaje`);
    await q.query(`ALTER TABLE economy_config DROP COLUMN IF EXISTS "diasBloqueoPersonaje"`);
    await q.query(`ALTER TABLE memberships DROP CONSTRAINT IF EXISTS ck_personaje_valido`);
    await q.query(`ALTER TABLE memberships DROP COLUMN IF EXISTS "personajeCambiadoAt"`);
    await q.query(`ALTER TABLE memberships DROP COLUMN IF EXISTS personaje`);
  }
}
