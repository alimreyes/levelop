import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * =============================================================================
 * NOMBRES PARA EL LÍDER DE ÁREA — decisión de Alim, 15/09/26
 * =============================================================================
 *
 * Al conectar `levelop-lider.html` a la API real (15/09) salió un hallazgo: el
 * rol `levelop_lider` no tenía SELECT sobre `users`, así que ningún endpoint de
 * líder podía resolver un `membershipId` a un nombre. Lo reporté como hallazgo,
 * sin decidir — y la respuesta de Alim, textual: "sí necesitamos mostrar los
 * nombres, con ID de usuario no sirve para el objetivo de incentivar a los que
 * les va bien y ayudar a los que no les va tan bien".
 *
 * Tiene razón, y además esto no es una excepción nueva a R-07: el propio
 * Maestro §6.1 salvaguarda 4 da a entender que el líder ve nombres en el panel
 * de «quién necesita una mano» — la excepción autorizada YA incluye identidad,
 * el esquema simplemente no había terminado de construirla.
 *
 * LA FORMA DEL GRANT, y por qué no es `GRANT SELECT ON users TO levelop_lider`
 * a secas: Postgres soporta permisos por COLUMNA. `users` tiene `email` y
 * `passwordHash` (este último ya con `select:false` a nivel de TypeORM, pero
 * eso NO protege una consulta SQL cruda de otro rol — la única protección real
 * es el GRANT). Conceder solo `(id, nombre)` significa que aunque alguien
 * escriba `SELECT * FROM users` conectado como `levelop_lider`, Postgres
 * rechaza la consulta — el líder nunca puede leer el email ni el hash de nadie,
 * columna por columna, no por disciplina del código.
 *
 * Alcance: SOLO `levelop_lider`. Gerencia (`levelop_backoffice`) sigue sin
 * ningún acceso a `users` — R-07 no se toca para esa superficie, esto es
 * específico del panel de líder y de la excepción ya autorizada en el Maestro.
 */
export class NombresParaLiderDeArea1758000000000 implements MigrationInterface {
  name = 'NombresParaLiderDeArea1758000000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`GRANT SELECT (id, nombre) ON users TO levelop_lider`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`REVOKE SELECT (id, nombre) ON users FROM levelop_lider`);
  }
}
