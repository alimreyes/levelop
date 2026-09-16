import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { TipoNotificacion } from '../common/enums';

/**
 * NOTIFICACIONES — MVP por polling (ver el comentario de `TipoNotificacion` en
 * `common/enums.ts` sobre por qué no es WebSocket todavía).
 *
 * `mensaje` se precalcula al emitir, no se recompone en cada lectura — más
 * barato, y evita que un cambio de copy futuro reescriba avisos ya entregados
 * de forma inconsistente (el aviso que alguien vio es el aviso que existió en
 * ese momento).
 *
 * No hay tabla separada por superficie ni GRANT restringido: una notificación
 * le pertenece a UNA membresía (`membershipId`), nunca es un agregado ni
 * expone a nadie más que a su dueño — R-07 no aplica aquí porque no hay dato
 * de terceros que filtrar.
 */
@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ type: 'uuid' })
  membershipId!: string;

  @Column({ type: 'text' })
  tipo!: TipoNotificacion;

  @Column({ type: 'text' })
  mensaje!: string;

  @Column({ type: 'text', nullable: true })
  refTipo!: string | null;

  @Column({ type: 'uuid', nullable: true })
  refId!: string | null;

  @Index()
  @Column({ type: 'boolean', default: false })
  leida!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
