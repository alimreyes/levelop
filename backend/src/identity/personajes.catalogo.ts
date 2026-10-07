/**
 * =============================================================================
 * EL ELENCO — 07/10/26
 * =============================================================================
 *
 * Los ocho personajes que la persona puede elegir. Pixel art de 32×32 (busto) y
 * 40×48 (cuerpo entero), hechos con el Agente de Diseño.
 *
 * VIVE EN CÓDIGO, como el catálogo de medallas y por la misma razón: lo que
 * define un personaje —su nombre, su dibujo, su poder— no es un dato que se
 * edite desde una pantalla, es parte del producto. Una tabla obligaría a
 * mantener sincronizadas las filas con los archivos de imagen, y el día que no
 * coincidan la app muestra un cuadro roto.
 *
 * LOS PODERES NO ESTÁN ACÁ TODAVÍA, y es a propósito. El `GTD` los propuso en
 * «PASIVAS v0.2»; yo le respondí en `LVL-064` que cuatro de los ocho dependen
 * de funciones que Levelop no tiene (recordatorios automáticos, «pedir ayuda»,
 * plantillas de misión). Hasta que eso se resuelva, elegir personaje es elegir
 * cómo te ves, no cómo jugás. Prometer un poder que no hace nada envejece peor
 * que no prometerlo: cuando llegue, se agrega acá y la pantalla lo muestra.
 *
 * `descripcion` es lo único que la persona lee al elegir. No dice «te da X»
 * porque todavía no da nada; dice quién es el personaje.
 */

export interface Personaje {
  clave: string;
  nombre: string;
  descripcion: string;
}

export const ELENCO: Personaje[] = [
  {
    clave: 'caballero',
    nombre: 'Caballero',
    descripcion: 'Va de frente y cumple lo que promete. El que llega cuando dijo que iba a llegar.',
  },
  {
    clave: 'elfo',
    nombre: 'Elfo',
    descripcion: 'Ve venir las cosas de lejos. Nada lo agarra desprevenido.',
  },
  {
    clave: 'sirena',
    nombre: 'Sirena',
    descripcion: 'Trabaja en su propio ritmo y no se deja apurar. Sabe cuándo desconectarse.',
  },
  {
    clave: 'duende',
    nombre: 'Duende guerrero',
    descripcion: 'Chiquito y rapidísimo. Pide ayuda sin pena y la da sin que se la pidan.',
  },
  {
    clave: 'mago',
    nombre: 'Mago',
    descripcion: 'Le pone orden al caos. Tiene todo anotado antes de que haga falta.',
  },
  {
    clave: 'dragon',
    nombre: 'Dragón',
    descripcion: 'Piensa en el equipo antes que en sí mismo. Cuando se prende, prende a todos.',
  },
  {
    clave: 'barbaro',
    nombre: 'Bárbaro',
    descripcion: 'Agarra lo más pesado sin quejarse. Si hay que empujar, empuja.',
  },
  {
    clave: 'bardo',
    nombre: 'Bardo',
    descripcion: 'Se acuerda de dar las gracias. El que hace que trabajar con otros se sienta bien.',
  },
];

export const CLAVES_VALIDAS = new Set(ELENCO.map((p) => p.clave));

/** Ruta del busto de 32×32 y del cuerpo entero de 40×48, servidos por el front. */
export const imagenesDe = (clave: string) => ({
  avatar: `personajes/${clave}_avatar_1x.png`,
  cuerpo: `personajes/${clave}_full_1x.png`,
});
