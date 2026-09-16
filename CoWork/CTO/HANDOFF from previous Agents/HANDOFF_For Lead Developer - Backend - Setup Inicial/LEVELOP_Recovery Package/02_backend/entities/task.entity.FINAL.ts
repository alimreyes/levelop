import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Comment } from './comment.entity';

export type TaskCategory = 'upcoming' | 'review' | 'delayed' | 'completed';
export type TaskUrgency = 'baja' | 'media' | 'alta';
export type TaskImportance = 'baja' | 'media' | 'alta';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['upcoming', 'review', 'delayed', 'completed'],
    default: 'upcoming'
  })
  category: TaskCategory;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: ['baja', 'media', 'alta'],
    default: 'media'
  })
  urgency: TaskUrgency;

  @Column({
    type: 'enum',
    enum: ['baja', 'media', 'alta'],
    default: 'media'
  })
  importance: TaskImportance;

  @Column({ name: 'xp_reward', type: 'integer' })
  xpReward: number;

  @Column({ name: 'gold_reward', type: 'integer' })
  goldReward: number;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  // ✅ CAMPO NECESARIO - Usuario asignado
  @Column({ name: 'assigned_to', type: 'integer' })
  assignedTo: number;

  // ✅ CAMPO NECESARIO - Colaboradores (array de IDs)
  @Column({ type: 'simple-array', nullable: true })
  collaborators: number[];

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // ✅ RELACIÓN con usuario asignado
  @ManyToOne(() => User, (user) => user.tasks)
  @JoinColumn({ name: 'assigned_to' })
  assignedUser: User;

  // ✅ RELACIÓN con comentarios
  @OneToMany(() => Comment, (comment) => comment.task)
  comments: Comment[];
}
