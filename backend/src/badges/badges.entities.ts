import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

/**
 * Una medalla GANADA por una persona. El catálogo de qué medallas existen no
 * está acá — está en `badges.catalogo.ts`, en código. Ver la nota larga de la
 * migración `MedallasYMetaDelMes` sobre por qué una regla no se guarda en una
 * fila.
 *
 * Inmutable a propósito: se inserta y no se toca. Si una medalla desaparece del
 * catálogo, la fila queda y la pantalla la ignora — quitarle a alguien algo que
 * ganó porque cambiamos de opinión es como se rompe un sistema de
 * reconocimiento.
 */
@Entity('member_badges')
@Unique('uq_member_badge', ['membershipId', 'clave'])
export class MemberBadge {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'uuid' })
  membershipId!: string;

  /** Clave del catálogo (`badges.catalogo.ts`), no un nombre para mostrar. */
  @Column({ type: 'text' })
  clave!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  ganadaAt!: Date;
}

/**
 * Un trofeo de ÁREA. Tabla aparte, y no `member_badges` con un `areaId` al
 * lado: un trofeo de área no le pertenece a nadie en particular, y si la gente
 * del área cambia el trofeo sigue siendo del área. Mezclarlos obligaría a
 * elegir a quién asignárselo, y no hay respuesta correcta.
 *
 * `periodo` ('2026-03' para las mensuales, '2026-T1' para las trimestrales,
 * null para las que se ganan una sola vez) entra en la unicidad: «Área puntual»
 * en marzo y en abril son dos logros, no uno repetido.
 */
@Entity('area_badges')
export class AreaBadge {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'uuid' })
  areaId!: string;

  @Column({ type: 'text' })
  clave!: string;

  @Column({ type: 'text', nullable: true })
  periodo!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  ganadaAt!: Date;
}

/**
 * La meta del mes: un número de misiones que la persona se pone a sí misma.
 *
 * NO la ve nadie más — ni gerencia, ni el líder. La migración no les concede
 * SELECT sobre esta tabla, así que no es una promesa de pantalla. Cumplirla no
 * da Oro (si diera, la meta racional de todo el mundo sería el número más bajo
 * posible); da medalla, y la racha de meses cumplidos alimenta las tres
 * especiales de trimestre, semestre y año.
 *
 * `mes` es el día 1 del mes, como fecha, para que la unicidad y las
 * comparaciones sean triviales.
 */
@Entity('member_goals')
@Unique('uq_member_goal_mes', ['membershipId', 'mes'])
export class MemberGoal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'uuid' })
  membershipId!: string;

  /** Primer día del mes al que corresponde la meta. */
  @Column({ type: 'date' })
  mes!: string;

  @Column({ type: 'int' })
  objetivo!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  fijadaAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  cumplidaAt!: Date | null;
}
