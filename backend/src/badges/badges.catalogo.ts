/**
 * =============================================================================
 * EL CATÁLOGO DE MEDALLAS Y TROFEOS — 19/09/26
 * =============================================================================
 *
 * 15 personales y 10 de área, cerradas con Alim en `LVL-060 v2`.
 *
 * NINGUNA DA ORO. Es la regla que sostiene todo el mecanismo: el día que una
 * medalla pague, deja de ser reconocimiento y se convierte en una segunda
 * moneda que nadie diseñó, con su propia inflación y su propio incentivo a
 * buscarla en vez de trabajar.
 *
 * Todas se evalúan solas contra hechos que ya están en la base. Ninguna se
 * otorga a mano, y eso también es deliberado: una medalla que alguien concede
 * es política de oficina con otro nombre.
 *
 * CÓMO LEER ESTE ARCHIVO: cada medalla es una clave, un nombre, una frase que
 * explica cómo se gana (la misma que ve la persona, no una versión técnica) y
 * un SQL que devuelve las membresías que la cumplen HOY. El evaluador inserta
 * lo que falte; la UNIQUE de la tabla hace que correrlo mil veces dé el mismo
 * resultado que correrlo una.
 *
 * Los SQL reciben siempre `$1 = tenantId`. Devuelven una columna
 * `membershipId` (o `areaId` para los de equipo). Nada más.
 */

export interface MedallaPersonal {
  clave: string;
  nombre: string;
  comoSeGana: string;
  /** `$1 = tenantId`. Devuelve filas con `membershipId`. */
  sql: string;
}

export interface TrofeoArea {
  clave: string;
  nombre: string;
  comoSeGana: string;
  /** `$1 = tenantId`, `$2 = piso de miembros activos`. Devuelve `areaId` y, si aplica, `periodo`. */
  sql: string;
  /** Si es true, se puede volver a ganar en otro período. */
  porPeriodo: boolean;
}

/**
 * Misiones que cuentan como «de esta persona»: se la asignaron, la aceptó, o la
 * sumaron como colaboradora. Se repite en varias consultas; está acá una sola
 * vez para que las 15 cuenten lo mismo.
 */
const SUYAS = `
  SELECT DISTINCT m.*, mem.id AS "membershipId"
    FROM memberships mem
    JOIN missions m ON m."tenantId" = mem."tenantId"
    LEFT JOIN mission_collaborators c ON c."missionId" = m.id AND c."membershipId" = mem.id
   WHERE mem."tenantId" = $1 AND mem.activo
     AND (m."asignadoMembershipId" = mem.id OR m."aceptadaPorMembershipId" = mem.id OR c.id IS NOT NULL)`;

/** Cuántas cerró cada quien. Base de las cuatro de conteo. */
const cerradas = (n: number) => `
  WITH suyas AS (${SUYAS})
  SELECT "membershipId" FROM suyas WHERE estado = 'cerrada'
  GROUP BY "membershipId" HAVING count(*) >= ${n}`;

/**
 * Racha de entregas a tiempo. «Seguidas» se cuenta sobre las misiones con fecha
 * límite, ordenadas por cierre: una misión sin fecha no rompe la racha ni suma,
 * porque no se le puede llegar tarde a algo que no tenía cuándo.
 */
const puntualesSeguidas = (n: number) => `
  WITH suyas AS (${SUYAS}),
  conFecha AS (
    SELECT "membershipId", "cerradaAt", ("cerradaAt" <= "fechaLimite") AS aTiempo,
           row_number() OVER (PARTITION BY "membershipId" ORDER BY "cerradaAt") AS rn
      FROM suyas
     WHERE estado = 'cerrada' AND "fechaLimite" IS NOT NULL AND "cerradaAt" IS NOT NULL
  ),
  grupos AS (
    SELECT "membershipId", aTiempo,
           rn - row_number() OVER (PARTITION BY "membershipId", aTiempo ORDER BY rn) AS g
      FROM conFecha
  )
  SELECT "membershipId" FROM grupos WHERE aTiempo
  GROUP BY "membershipId", g HAVING count(*) >= ${n}`;

/** Misiones que montó OTRA persona y que esta aceptó y cerró. */
const deOtros = (n: number) => `
  WITH suyas AS (${SUYAS})
  SELECT "membershipId" FROM suyas
   WHERE estado = 'cerrada' AND "creadorMembershipId" IS DISTINCT FROM "membershipId"
   GROUP BY "membershipId" HAVING count(*) >= ${n}`;

export const MEDALLAS_PERSONALES: MedallaPersonal[] = [
  {
    clave: 'primera_mision',
    nombre: 'Primera misión',
    comoSeGana: 'Cerraste tu primera misión.',
    sql: cerradas(1),
  },
  {
    clave: 'diez_cerradas',
    nombre: 'Diez cerradas',
    comoSeGana: 'Acumulaste 10 misiones cerradas.',
    sql: cerradas(10),
  },
  {
    clave: 'cincuenta_cerradas',
    nombre: 'Cincuenta cerradas',
    comoSeGana: 'Acumulaste 50 misiones cerradas.',
    sql: cerradas(50),
  },
  {
    clave: 'cien_cerradas',
    nombre: 'Cien cerradas',
    comoSeGana: 'Acumulaste 100 misiones cerradas.',
    sql: cerradas(100),
  },
  {
    clave: 'puntual',
    nombre: 'Puntual',
    comoSeGana: 'Cerraste 5 misiones seguidas antes de su fecha límite.',
    sql: puntualesSeguidas(5),
  },
  {
    clave: 'impecable',
    nombre: 'Impecable',
    comoSeGana: 'Cerraste 20 misiones seguidas antes de su fecha límite.',
    sql: puntualesSeguidas(20),
  },
  {
    clave: 'buen_companero',
    nombre: 'Buen compañero',
    comoSeGana: 'Aceptaste y cerraste 5 misiones que montó otra persona.',
    sql: deOtros(5),
  },
  {
    clave: 'mano_derecha',
    nombre: 'Mano derecha',
    comoSeGana: 'Aceptaste y cerraste 20 misiones que montó otra persona.',
    sql: deOtros(20),
  },
  {
    clave: 'puente',
    nombre: 'Puente',
    comoSeGana: 'Cerraste misiones de tres áreas distintas de la tuya.',
    sql: `
      WITH suyas AS (${SUYAS})
      SELECT s."membershipId"
        FROM suyas s JOIN memberships mem ON mem.id = s."membershipId"
       WHERE s.estado = 'cerrada' AND s."areaId" IS NOT NULL
         AND s."areaId" IS DISTINCT FROM mem."areaId"
       GROUP BY s."membershipId" HAVING count(DISTINCT s."areaId") >= 3`,
  },
  {
    clave: 'constante',
    nombre: 'Constante',
    comoSeGana: 'Cerraste al menos una misión por semana, ocho semanas seguidas.',
    sql: `
      WITH suyas AS (${SUYAS}),
      semanas AS (
        SELECT DISTINCT "membershipId", date_trunc('week', "cerradaAt") AS sem
          FROM suyas WHERE estado = 'cerrada' AND "cerradaAt" IS NOT NULL
      ),
      grupos AS (
        SELECT "membershipId", sem,
               sem - (row_number() OVER (PARTITION BY "membershipId" ORDER BY sem) * interval '1 week') AS g
          FROM semanas
      )
      SELECT "membershipId" FROM grupos
      GROUP BY "membershipId", g HAVING count(*) >= 8`,
  },
  {
    clave: 'primer_canje',
    nombre: 'Primer canje',
    comoSeGana: 'Confirmaste tu primer canje en la Tienda.',
    sql: `
      SELECT DISTINCT r."membershipId"
        FROM redemptions r
       WHERE r."tenantId" = $1 AND r.estado = 'CONFIRMADO'`,
  },
  {
    clave: 'meta_cumplida',
    nombre: 'Meta cumplida',
    comoSeGana: 'Cumpliste la meta que te pusiste para el mes.',
    sql: `
      SELECT DISTINCT "membershipId" FROM member_goals
       WHERE "tenantId" = $1 AND "cumplidaAt" IS NOT NULL`,
  },
  {
    clave: 'trimestre_redondo',
    nombre: 'Trimestre redondo',
    comoSeGana: 'Cumpliste tu meta tres meses seguidos.',
    sql: rachaDeMetas(3),
  },
  {
    clave: 'medio_ano_redondo',
    nombre: 'Medio año redondo',
    comoSeGana: 'Cumpliste tu meta seis meses seguidos.',
    sql: rachaDeMetas(6),
  },
  {
    clave: 'ano_redondo',
    nombre: 'Año redondo',
    comoSeGana: 'Cumpliste tu meta doce meses seguidos.',
    sql: rachaDeMetas(12),
  },
];

/** Meses consecutivos con la meta cumplida. Mismo truco de islas que las semanas. */
function rachaDeMetas(n: number): string {
  return `
    WITH cumplidos AS (
      SELECT "membershipId", date_trunc('month', mes) AS m
        FROM member_goals WHERE "tenantId" = $1 AND "cumplidaAt" IS NOT NULL
    ),
    grupos AS (
      SELECT "membershipId", m,
             m - (row_number() OVER (PARTITION BY "membershipId" ORDER BY m) * interval '1 month') AS g
        FROM cumplidos
    )
    SELECT "membershipId" FROM grupos
    GROUP BY "membershipId", g HAVING count(*) >= ${n}`;
}

/**
 * El piso de 4 miembros activos aplica a TODOS los trofeos de área, sin
 * excepción. Un área de dos que no tiene atrasos no ganó nada: es chica. Ese
 * piso es el mismo que protege las métricas agregadas de gerencia desde el
 * 03/09, y por la misma razón — con pocos datos, un agregado deja de ser un
 * agregado y pasa a señalar a una persona.
 */
const CON_PISO = `
  SELECT a.id AS "areaId"
    FROM areas a
    JOIN memberships mem ON mem."areaId" = a.id AND mem.activo
   WHERE a."tenantId" = $1
   GROUP BY a.id HAVING count(*) >= $2`;

export const TROFEOS_AREA: TrofeoArea[] = [
  {
    clave: 'arranque',
    nombre: 'Arranque',
    comoSeGana: 'El área cerró sus primeras 25 misiones.',
    porPeriodo: false,
    sql: `
      WITH elegibles AS (${CON_PISO})
      SELECT m."areaId", NULL::text AS periodo
        FROM missions m JOIN elegibles e ON e."areaId" = m."areaId"
       WHERE m."tenantId" = $1 AND m.estado = 'cerrada'
       GROUP BY m."areaId" HAVING count(*) >= 25`,
  },
  {
    clave: 'centenaria',
    nombre: 'Centenaria',
    comoSeGana: 'El área cerró 100 misiones.',
    porPeriodo: false,
    sql: `
      WITH elegibles AS (${CON_PISO})
      SELECT m."areaId", NULL::text AS periodo
        FROM missions m JOIN elegibles e ON e."areaId" = m."areaId"
       WHERE m."tenantId" = $1 AND m.estado = 'cerrada'
       GROUP BY m."areaId" HAVING count(*) >= 100`,
  },
  {
    clave: 'area_puntual',
    nombre: 'Área puntual',
    comoSeGana: 'Un mes con menos del 10 % de entregas atrasadas.',
    porPeriodo: true,
    sql: mesDeAtrasos('< 0.10'),
  },
  {
    clave: 'area_impecable',
    nombre: 'Área impecable',
    comoSeGana: 'Un mes entero sin una sola entrega atrasada.',
    porPeriodo: true,
    sql: mesDeAtrasos('= 0'),
  },
  {
    clave: 'racha_de_area',
    nombre: 'Racha de área',
    comoSeGana: 'Tres meses seguidos por debajo del 10 % de atrasos.',
    porPeriodo: true,
    sql: `
      WITH elegibles AS (${CON_PISO}),
      meses AS (
        SELECT m."areaId", date_trunc('month', m."cerradaAt") AS mes,
               avg(CASE WHEN m."fechaLimite" IS NOT NULL AND m."cerradaAt" > m."fechaLimite" THEN 1 ELSE 0 END) AS pct
          FROM missions m JOIN elegibles e ON e."areaId" = m."areaId"
         WHERE m."tenantId" = $1 AND m.estado = 'cerrada' AND m."cerradaAt" IS NOT NULL
           AND m."cerradaAt" < date_trunc('month', now())   -- solo meses terminados
         GROUP BY 1, 2 HAVING count(*) >= 4
      ),
      buenos AS (SELECT "areaId", mes FROM meses WHERE pct < 0.10),
      grupos AS (
        SELECT "areaId", mes,
               mes - (row_number() OVER (PARTITION BY "areaId" ORDER BY mes) * interval '1 month') AS g
          FROM buenos
      )
      SELECT "areaId", to_char(max(mes), 'YYYY-MM') AS periodo
        FROM grupos GROUP BY "areaId", g HAVING count(*) >= 3`,
  },
  {
    clave: 'todos_adentro',
    nombre: 'Todos adentro',
    comoSeGana: 'En un mes, cada miembro activo del área cerró al menos una misión.',
    porPeriodo: true,
    sql: `
      WITH elegibles AS (${CON_PISO}),
      activos AS (
        SELECT "areaId", count(*)::int AS n FROM memberships
         WHERE "tenantId" = $1 AND activo AND "areaId" IS NOT NULL GROUP BY "areaId"
      ),
      cerradores AS (
        SELECT mem."areaId", date_trunc('month', m."cerradaAt") AS mes,
               count(DISTINCT mem.id)::int AS n
          FROM missions m
          JOIN memberships mem ON mem.id = COALESCE(m."aceptadaPorMembershipId", m."asignadoMembershipId")
         WHERE m."tenantId" = $1 AND m.estado = 'cerrada' AND m."cerradaAt" IS NOT NULL
           AND mem.activo AND mem."areaId" IS NOT NULL
         GROUP BY 1, 2
      )
      SELECT c."areaId", to_char(c.mes, 'YYYY-MM') AS periodo
        FROM cerradores c
        JOIN activos a ON a."areaId" = c."areaId"
        JOIN elegibles e ON e."areaId" = c."areaId"
       WHERE c.n >= a.n`,
  },
  {
    clave: 'puertas_abiertas',
    nombre: 'Puertas abiertas',
    comoSeGana: 'En un mes, el área compartió misión con cada una de las otras áreas activas.',
    porPeriodo: true,
    sql: `
      WITH elegibles AS (${CON_PISO}),
      otras AS (
        SELECT count(DISTINCT a.id)::int AS n FROM areas a
          JOIN memberships mem ON mem."areaId" = a.id AND mem.activo
         WHERE a."tenantId" = $1
      ),
      cruces AS (
        SELECT mem."areaId" AS propia, m."areaId" AS ajena, date_trunc('month', m."createdAt") AS mes
          FROM missions m
          JOIN mission_collaborators c ON c."missionId" = m.id
          JOIN memberships mem ON mem.id = c."membershipId"
         WHERE m."tenantId" = $1 AND m."areaId" IS DISTINCT FROM mem."areaId"
           AND mem."areaId" IS NOT NULL AND m."areaId" IS NOT NULL
      )
      SELECT cr.propia AS "areaId", to_char(cr.mes, 'YYYY-MM') AS periodo
        FROM cruces cr JOIN elegibles e ON e."areaId" = cr.propia, otras o
       GROUP BY cr.propia, cr.mes, o.n
      HAVING count(DISTINCT cr.ajena) >= o.n - 1`,
  },
  {
    clave: 'buenos_vecinos',
    nombre: 'Buenos vecinos',
    comoSeGana: 'Fue el área que más misiones compartió con otras en el trimestre.',
    porPeriodo: true,
    sql: `
      WITH elegibles AS (${CON_PISO}),
      cruces AS (
        SELECT mem."areaId" AS propia, date_trunc('quarter', m."createdAt") AS trim, count(*)::int AS n
          FROM missions m
          JOIN mission_collaborators c ON c."missionId" = m.id
          JOIN memberships mem ON mem.id = c."membershipId"
         WHERE m."tenantId" = $1 AND m."areaId" IS DISTINCT FROM mem."areaId" AND mem."areaId" IS NOT NULL
           AND m."createdAt" < date_trunc('quarter', now())   -- solo trimestres terminados
         GROUP BY 1, 2
      ),
      top AS (
        SELECT propia, trim, rank() OVER (PARTITION BY trim ORDER BY n DESC) AS r FROM cruces
      )
      SELECT t.propia AS "areaId", to_char(t.trim, 'YYYY-"T"Q') AS periodo
        FROM top t JOIN elegibles e ON e."areaId" = t.propia
       WHERE t.r = 1`,
  },
  {
    clave: 'desafio_ganado',
    nombre: 'Desafío ganado',
    comoSeGana: 'El área ganó un desafío entre áreas.',
    porPeriodo: true,
    // Se otorga desde el cierre del desafío, no por consulta: el ganador lo
    // decide esa lógica y reconstruirlo acá sería tener dos veces la misma
    // regla. Hasta que el desafío exista, no devuelve nada.
    // Referencia los dos parámetros aunque no devuelva nada: el evaluador
    // pasa siempre ($1, $2) y Postgres rechaza una consulta que reciba
    // parámetros que no usa. Lo encontré ejecutándolas de verdad — compilaba
    // perfecto y fallaba en la primera corrida.
    sql: `SELECT a.id AS "areaId", NULL::text AS periodo
            FROM areas a WHERE a."tenantId" = $1 AND $2 > 0 AND false`,
  },
  {
    clave: 'bicampeon',
    nombre: 'Bicampeón',
    comoSeGana: 'El área ganó dos desafíos seguidos.',
    porPeriodo: true,
    // Referencia los dos parámetros aunque no devuelva nada: el evaluador
    // pasa siempre ($1, $2) y Postgres rechaza una consulta que reciba
    // parámetros que no usa. Lo encontré ejecutándolas de verdad — compilaba
    // perfecto y fallaba en la primera corrida.
    sql: `SELECT a.id AS "areaId", NULL::text AS periodo
            FROM areas a WHERE a."tenantId" = $1 AND $2 > 0 AND false`,
  },
];

/**
 * Meses con el porcentaje de atrasos bajo el umbral, con piso de 4 cierres.
 *
 * 24/09 — SOLO MESES TERMINADOS. Estaba evaluando también el mes en curso, y
 * estos trofeos no son monótonos: «Área impecable» se habría otorgado el día 5
 * con cuatro cierres a tiempo, y un atraso el día 20 ya no podía quitarla
 * (las ganadas son inmutables, a propósito). Lo mismo con «Racha de área» y
 * «Buenos vecinos» (el primero en compartir en el trimestre salía primero).
 * Los que SÍ son monótonos dentro del mes —«Todos adentro», «Puertas
 * abiertas»— se siguen otorgando en el acto: una vez logrados, nada los
 * deshace. El cierre de mes lo toma la evaluación diaria de `BadgesService`.
 */
function mesDeAtrasos(condicion: string): string {
  return `
    WITH elegibles AS (${CON_PISO})
    SELECT m."areaId", to_char(date_trunc('month', m."cerradaAt"), 'YYYY-MM') AS periodo
      FROM missions m JOIN elegibles e ON e."areaId" = m."areaId"
     WHERE m."tenantId" = $1 AND m.estado = 'cerrada' AND m."cerradaAt" IS NOT NULL
       AND m."cerradaAt" < date_trunc('month', now())   -- solo meses YA terminados (ver nota)
     GROUP BY 1, 2
    HAVING count(*) >= 4
       AND avg(CASE WHEN m."fechaLimite" IS NOT NULL AND m."cerradaAt" > m."fechaLimite" THEN 1 ELSE 0 END) ${condicion}`;
}

/** Para que la app pueda mostrar el catálogo completo, no solo lo ganado. */
export const CATALOGO_PUBLICO = {
  personales: MEDALLAS_PERSONALES.map(({ clave, nombre, comoSeGana }) => ({ clave, nombre, comoSeGana })),
  area: TROFEOS_AREA.map(({ clave, nombre, comoSeGana }) => ({ clave, nombre, comoSeGana })),
};

/**
 * 24/09 — Trofeos de equipo agrupados por área, para gerencia y para el
 * líder. Una sola función y una sola forma de respuesta, para que las dos
 * superficies muestren exactamente lo mismo.
 *
 * Solo lee `area_badges` y `areas`: son logros del ÁREA (con el piso de 4
 * miembros ya aplicado al otorgarlos), nunca de una persona. Por eso los
 * roles `levelop_backoffice` y `levelop_lider` tienen SELECT sobre esa tabla
 * desde `MedallasYMetaDelMes`, y ninguno sobre `member_badges`.
 *
 * `areaIds = null` = todas las áreas de la empresa (gerencia).
 */
export async function trofeosPorArea(
  ds: { query: (sql: string, params?: unknown[]) => Promise<any> },
  tenantId: string,
  areaIds: string[] | null,
) {
  const areas: Array<{ id: string; nombre: string; color: string | null }> = await ds.query(
    `SELECT id, nombre, color FROM areas
      WHERE "tenantId" = $1 AND ($2::uuid[] IS NULL OR id = ANY($2::uuid[]))
      ORDER BY "createdAt", id`,
    [tenantId, areaIds],
  );
  const ganados: Array<{ areaId: string; clave: string; periodo: string | null; ganadaAt: Date }> =
    await ds.query(
      `SELECT "areaId", clave, periodo, "ganadaAt" FROM area_badges
        WHERE "tenantId" = $1 AND ($2::uuid[] IS NULL OR "areaId" = ANY($2::uuid[]))
        ORDER BY "ganadaAt" DESC`,
      [tenantId, areaIds],
    );
  return {
    catalogo: CATALOGO_PUBLICO.area,
    areas: areas.map((a) => {
      const suyos = ganados.filter((g) => g.areaId === a.id);
      return {
        areaId: a.id,
        nombre: a.nombre,
        color: a.color,
        total: suyos.length,
        trofeos: suyos
          .map((g) => {
            const c = CATALOGO_PUBLICO.area.find((x) => x.clave === g.clave);
            return c ? { clave: g.clave, nombre: c.nombre, comoSeGana: c.comoSeGana, periodo: g.periodo, ganadaAt: g.ganadaAt } : null;
          })
          .filter(Boolean),
      };
    }),
  };
}
