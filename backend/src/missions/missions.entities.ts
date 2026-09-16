import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { EstadoMision, NivelEsfuerzo, NivelTri } from '../common/enums';

/**
 * MISIONES — el nucleo de trabajo.
 *
 * Una mision es una tarea. Al cerrarse da XP y Oro (Maestro §9). Pero ojo con la
 * regla del §3.3 que esta implementada en `aceptadaPorMembershipId`: una mision
 * propia NO da Oro hasta que otro la acepte. Es el anti-cheat mas barato que
 * existe y no requiere criptografia: si el mismo que la crea es el que la cierra,
 * no hay Oro. El XP si.
 */
@Entity('missions')
export class Mission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'text' })
  titulo!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string | null;

  @Index()
  @Column({ type: 'uuid' })
  creadorMembershipId!: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  asignadoMembershipId!: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  areaId!: string | null;

  @Column({ type: 'text', default: NivelTri.MEDIA })
  urgencia!: NivelTri;

  @Column({ type: 'text', default: NivelTri.MEDIA })
  importancia!: NivelTri;

  @Column({ type: 'text', default: NivelEsfuerzo.MEDIO })
  esfuerzo!: NivelEsfuerzo;

  @Column({ type: 'timestamptz', nullable: true })
  fechaLimite!: Date | null;

  /**
   * Links opcionales relacionados (pedido de Alim 14/09) — un doc, un diseño,
   * lo que sea. Sin validar que sean URLs de verdad en el backend a propósito:
   * es texto libre, y validar formato de URL es trabajo del frontend, no una
   * regla de negocio que valga la pena imponer aquí.
   */
  @Column({ type: 'text', array: true, default: () => "'{}'" })
  enlaces!: string[];

  @Index()
  @Column({ type: 'text', default: EstadoMision.BORRADOR })
  estado!: EstadoMision;

  /**
   * Quien acepto la mision. Si es null, o si coincide con el creador, la mision
   * no genera Oro al cerrarse. Ver `EconomyService.registrarMisionCerrada`.
   */
  @Column({ type: 'uuid', nullable: true })
  aceptadaPorMembershipId!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  aceptadaAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  cerradaAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}

/**
 * Colaboradores de una mision.
 *
 * Alimenta «Quien trabaja con quien» del BackOffice de Lider de Area. La frase
 * del PD que justifica ese panel vale la pena tenerla aqui: "lo que revela no es
 * quien trabaja poco: es quien trabaja solo". Por eso este dato SI puede verlo un
 * lider — no senala desempeno, senala aislamiento, que es un problema del equipo
 * y no de la persona.
 */
@Entity('mission_collaborators')
@Unique('uq_mission_collaborator', ['missionId', 'membershipId'])
export class MissionCollaborator {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ type: 'uuid' })
  missionId!: string;

  @Index()
  @Column({ type: 'uuid' })
  membershipId!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}

/**
 * Hilo de mensajes de una mision.
 *
 * 🔒 R-07 — TABLA PROHIBIDA PARA TODA SUPERFICIE DE GERENCIA.
 *
 * Ni el BackOffice de gerencia ni el de Lider de Area tienen SELECT sobre esta
 * tabla. No es que la UI no los muestre: sus roles de Postgres no pueden leerla.
 * Si manana alguien (yo incluido) escribe un `find()` de mas en un modulo de
 * gerencia, la base devuelve un error de permisos en vez de datos.
 *
 * El razonamiento del CEO, que es el que sostiene esto: "R-03 muere sin R-07. Si
 * el jefe puede ver quien apago el juego, el opt-out no es voluntario aunque el
 * codigo diga que si."
 */
@Entity('mission_thread_messages')
export class MissionThreadMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ type: 'uuid' })
  missionId!: string;

  @Column({ type: 'uuid' })
  membershipId!: string;

  @Column({ type: 'text' })
  cuerpo!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
