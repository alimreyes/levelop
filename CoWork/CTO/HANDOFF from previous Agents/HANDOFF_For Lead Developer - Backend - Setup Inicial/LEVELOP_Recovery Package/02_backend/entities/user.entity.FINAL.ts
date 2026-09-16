import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from './task.entity';
import { Comment } from './comment.entity';
import { Achievement } from './achievement.entity';
import { UserPurchase } from './user-purchase.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MANAGER = 'manager'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'integer', default: 1 })
  level: number;

  @Column({ type: 'integer', default: 0 })
  xp: number;

  @Column({ name: 'xp_to_next', type: 'integer', default: 100 })
  xpToNext: number;

  @Column({ type: 'integer', default: 0 })
  gold: number;

  @Column({ type: 'varchar', length: 50, default: '⚔️' })
  avatar: string;

  @Column({ name: 'avatar_color', type: 'varchar', length: 50, default: 'bg-blue-600' })
  avatarColor: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole;

  @Column({ name: 'refresh_token', type: 'varchar', length: 500, nullable: true })
  refreshToken: string;

  // ✅ CAMPO NECESARIO para date-change-requests
  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  // ✅ CAMPO NECESARIO para Espada de Fuego (bloqueo de asignaciones)
  @Column({ name: 'unassignable_until', type: 'timestamp', nullable: true })
  unassignableUntil: Date;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // ✅ RELACIONES
  @OneToMany(() => Task, (task) => task.assignedUser)
  tasks: Task[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Achievement, (achievement) => achievement.user)
  achievements: Achievement[];

  @OneToMany(() => UserPurchase, (purchase) => purchase.user)
  purchases: UserPurchase[];
}
