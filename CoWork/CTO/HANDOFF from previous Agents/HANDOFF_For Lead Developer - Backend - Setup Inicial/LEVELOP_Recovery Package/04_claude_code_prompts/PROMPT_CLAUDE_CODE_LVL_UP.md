# 🎮 PROMPT PARA CLAUDE CODE - RECONSTRUCCIÓN COMPLETA DE LVL UP!

## 📌 CONTEXTO DEL PROYECTO

Soy el fundador de **LVL UP!**, una plataforma SaaS de gestión de tareas gamificada que transforma la productividad empresarial en una experiencia RPG. El proyecto constaba de:

1. **Backend**: NestJS + TypeORM + PostgreSQL (32 archivos, 5 módulos)
2. **Frontend**: React + TypeScript + Vite + Tailwind CSS (3 archivos principales)
3. **Base de datos**: PostgreSQL con backup existente

**Perdí el proyecto después de reiniciar la laptop**, pero tengo:
- ✅ Backup de PostgreSQL (`backup_pre_migration.backup` - 39KB)
- ✅ 3 archivos completos del frontend
- ✅ Documentación completa de la arquitectura

---

## 🎯 TU MISIÓN

Reconstruir **completamente** el proyecto LVL UP! desde cero con la siguiente estructura:

```
📁 LVL Up!/
├── 📁 lvl-up-backend/          # Backend NestJS
│   ├── 📁 src/
│   │   ├── 📁 auth/
│   │   ├── 📁 users/
│   │   ├── 📁 tasks/
│   │   ├── 📁 shop/
│   │   ├── 📁 inventory/
│   │   ├── 📁 achievements/
│   │   ├── 📁 notifications/
│   │   ├── 📁 comments/
│   │   ├── 📁 date-change-requests/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── .env
│
└── 📁 Lvl Up/                   # Frontend React
    ├── 📁 src/
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── index.html
```

---

## 🚀 PASO 1: SETUP INICIAL

### 1.1 Crear Estructura de Carpetas

```bash
# En la ubicación que el usuario indique (ej: C:\Users\alimr\Documents\)
mkdir "LVL Up!"
cd "LVL Up!"

# Backend
mkdir lvl-up-backend
cd lvl-up-backend
npm init -y

# Frontend
cd ..
mkdir "Lvl Up"
cd "Lvl Up"
npm create vite@latest . -- --template react-ts
```

---

## 📦 PASO 2: BACKEND - INSTALACIÓN DE DEPENDENCIAS

### 2.1 package.json del Backend

Crear `lvl-up-backend/package.json`:

```json
{
  "name": "lvl-up-backend",
  "version": "1.0.0",
  "description": "Backend para LVL UP! - Sistema de tareas gamificado",
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "build": "nest build",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/schedule": "^4.0.0",
    "typeorm": "^0.3.17",
    "pg": "^8.11.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "bcrypt": "^5.1.1",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/express": "^4.17.17",
    "@types/node": "^20.3.1",
    "@types/passport-jwt": "^3.0.9",
    "@types/passport-local": "^1.0.35",
    "@types/bcrypt": "^5.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.42.0",
    "jest": "^29.5.0",
    "prettier": "^3.0.0",
    "source-map-support": "^0.5.21",
    "ts-jest": "^29.1.0",
    "ts-loader": "^9.4.3",
    "ts-node": "^10.9.1",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.1.3"
  }
}
```

### 2.2 Instalar dependencias

```bash
cd lvl-up-backend
npm install
```

---

## 🔧 PASO 3: CONFIGURACIÓN DEL BACKEND

### 3.1 nest-cli.json

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

### 3.2 tsconfig.json

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false,
    "esModuleInterop": true
  }
}
```

### 3.3 .env

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password_aqui
DB_NAME=lvl_up_db

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro_aqui_cambiar_en_produccion
JWT_EXPIRATION=7d

# App
PORT=3000
NODE_ENV=development
```

**IMPORTANTE**: El usuario debe cambiar `DB_PASSWORD` y `JWT_SECRET`.

---

## 📁 PASO 4: ESTRUCTURA DEL BACKEND

### 4.1 main.ts

Crear `src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:5173', // Vite dev server
    credentials: true,
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
```

### 4.2 app.module.ts

Crear `src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

// Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { ShopModule } from './shop/shop.module';
import { InventoryModule } from './inventory/inventory.module';
import { AchievementsModule } from './achievements/achievements.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CommentsModule } from './comments/comments.module';
import { DateChangeRequestsModule } from './date-change-requests/date-change-requests.module';

// Entities
import { User } from './users/entities/user.entity';
import { Task } from './tasks/entities/task.entity';
import { ShopItem } from './shop/entities/shop-item.entity';
import { UserInventory } from './inventory/entities/user-inventory.entity';
import { UserPurchase } from './inventory/entities/user-purchase.entity';
import { Achievement } from './achievements/entities/achievement.entity';
import { Notification } from './notifications/entities/notification.entity';
import { Comment } from './comments/entities/comment.entity';
import { DateChangeRequest } from './date-change-requests/entities/date-change-request.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        User,
        Task,
        ShopItem,
        UserInventory,
        UserPurchase,
        Achievement,
        Notification,
        Comment,
        DateChangeRequest,
      ],
      synchronize: true, // CAMBIAR A FALSE EN PRODUCCIÓN
      logging: true,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    TasksModule,
    ShopModule,
    InventoryModule,
    AchievementsModule,
    NotificationsModule,
    CommentsModule,
    DateChangeRequestsModule,
  ],
})
export class AppModule {}
```

---

## 👤 PASO 5: MÓDULO DE USUARIOS

### 5.1 user.entity.ts

Crear `src/users/entities/user.entity.ts`:

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Achievement } from '../../achievements/entities/achievement.entity';
import { UserPurchase } from '../../inventory/entities/user-purchase.entity';

export enum UserRole {
  EMPLOYEE = 'employee',
  TEAM_LEADER = 'team_leader',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.EMPLOYEE })
  role: UserRole;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'int', default: 0 })
  xp: number;

  @Column({ name: 'xp_to_next_level', type: 'int', default: 100 })
  xpToNextLevel: number;

  @Column({ type: 'int', default: 0 })
  gold: number;

  @Column({ type: 'varchar', length: 10, default: '⚔️' })
  avatar: string;

  @Column({ name: 'avatar_color', type: 'varchar', length: 50, default: 'bg-blue-600' })
  avatarColor: string;

  @Column({ name: 'unassignable_until', type: 'timestamp', nullable: true })
  unassignableUntil: Date;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Task, (task) => task.assignedUser)
  tasks: Task[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Achievement, (achievement) => achievement.user)
  achievements: Achievement[];

  @OneToMany(() => UserPurchase, (purchase) => purchase.user)
  purchases: UserPurchase[];
}
```

### 5.2 users.module.ts

Crear `src/users/users.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
```

### 5.3 users.service.ts

Crear `src/users/users.service.ts`:

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: any): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'username', 'name', 'department', 'role', 'level', 'xp', 'gold', 'avatar', 'avatarColor'],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async update(id: number, updateUserDto: any): Promise<User> {
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async addXP(userId: number, xp: number): Promise<User> {
    const user = await this.findOne(userId);
    user.xp += xp;
    
    while (user.xp >= user.xpToNextLevel) {
      user.xp -= user.xpToNextLevel;
      user.level += 1;
      user.xpToNextLevel = Math.floor(user.xpToNextLevel * 1.5);
    }
    
    return this.usersRepository.save(user);
  }

  async addGold(userId: number, gold: number): Promise<User> {
    const user = await this.findOne(userId);
    user.gold += gold;
    return this.usersRepository.save(user);
  }
}
```

### 5.4 users.controller.ts

Crear `src/users/users.controller.ts`:

```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: any) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
```

---

## ✅ PASO 6: MÓDULO DE TAREAS (CRÍTICO)

### 6.1 task.entity.ts

Crear `src/tasks/entities/task.entity.ts`:

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';

export enum TaskCategory {
  UPCOMING = 'upcoming',
  REVIEW = 'review',
  DELAYED = 'delayed',
  COMPLETED = 'completed',
}

export enum TaskUrgency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum TaskImportance {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: TaskCategory, default: TaskCategory.UPCOMING })
  category: TaskCategory;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: Date;

  @Column({ type: 'enum', enum: TaskUrgency, default: TaskUrgency.MEDIUM })
  urgency: TaskUrgency;

  @Column({ type: 'enum', enum: TaskImportance, default: TaskImportance.MEDIUM })
  importance: TaskImportance;

  @Column({ name: 'xp_reward', type: 'int', default: 100 })
  xpReward: number;

  @Column({ name: 'gold_reward', type: 'int', default: 50 })
  goldReward: number;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ name: 'assigned_to', type: 'int' })
  assignedTo: number;

  @Column({ type: 'simple-array', nullable: true })
  collaborators: number[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.tasks)
  @JoinColumn({ name: 'assigned_to' })
  assignedUser: User;

  @OneToMany(() => Comment, (comment) => comment.task)
  comments: Comment[];
}
```

### 6.2 tasks.module.ts

Crear `src/tasks/tasks.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    NotificationsModule,
  ],
  providers: [TasksService],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
```

### 6.3 tasks.service.ts

Crear `src/tasks/tasks.service.ts`:

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskCategory } from './entities/task.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private notificationsService: NotificationsService,
  ) {}

  async create(createTaskDto: any): Promise<Task> {
    const task = this.tasksRepository.create(createTaskDto);
    return this.tasksRepository.save(task);
  }

  async findAll(): Promise<Task[]> {
    return this.tasksRepository.find({
      relations: ['assignedUser', 'comments'],
    });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['assignedUser', 'comments'],
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: number, updateTaskDto: any): Promise<Task> {
    await this.tasksRepository.update(id, updateTaskDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.tasksRepository.delete(id);
  }

  async complete(id: number, userId: number): Promise<Task> {
    const task = await this.findOne(id);
    task.completed = true;
    task.category = TaskCategory.COMPLETED;
    await this.tasksRepository.save(task);
    
    // Create notification
    await this.notificationsService.create({
      userId: task.assignedTo,
      type: 'TASK_COMPLETED',
      message: `Task "${task.title}" completed`,
      relatedTaskId: task.id,
    });
    
    return task;
  }

  async completeWithPenalty(id: number, userId: number): Promise<{ task: Task; penalty: any }> {
    const task = await this.complete(id, userId);
    const penalty = {
      applied: false,
      amount: 0,
      reason: 'Task completed on time',
    };
    return { task, penalty };
  }
}
```

### 6.4 tasks.controller.ts

Crear `src/tasks/tasks.controller.ts`:

```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: any) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: any) {
    return this.tasksService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(+id);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string, @Body() body: any) {
    return this.tasksService.complete(+id, body.userId);
  }

  @Post(':id/complete-with-penalty')
  completeWithPenalty(@Param('id') id: string, @Body() body: any) {
    return this.tasksService.completeWithPenalty(+id, body.userId);
  }
}
```

---

## 🔔 PASO 7: MÓDULO DE NOTIFICACIONES

### 7.1 notification.entity.ts

Crear `src/notifications/entities/notification.entity.ts`:

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  TASK_ASSIGNED = 'task_assigned',
  TASK_COMPLETED = 'task_completed',
  TASK_OVERDUE = 'task_overdue',
  LEVEL_UP = 'level_up',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  PURCHASE = 'purchase',
  MENTION = 'mention',
  REASSIGN = 'reassign',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'related_task_id', type: 'int', nullable: true })
  relatedTaskId: number;

  @Column({ type: 'boolean', default: false })
  read: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

### 7.2 notifications.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
```

### 7.3 notifications.service.ts

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: any): Promise<Notification> {
    const notification = this.notificationsRepository.create(createNotificationDto);
    return this.notificationsRepository.save(notification);
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationsRepository.find();
  }

  async findByUser(userId: number): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: number): Promise<void> {
    await this.notificationsRepository.update(id, { read: true });
  }
}
```

### 7.4 notifications.controller.ts

```typescript
import { Controller, Get, Post, Param, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.notificationsService.findByUser(+userId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(+id);
  }
}
```

---

## 💬 PASO 8: MÓDULO DE COMENTARIOS

### 8.1 comment.entity.ts

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'task_id', type: 'int' })
  taskId: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ type: 'text' })
  text: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Task, (task) => task.comments)
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

### 8.2 comments.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment])],
  providers: [CommentsService],
  controllers: [CommentsController],
  exports: [CommentsService],
})
export class CommentsModule {}
```

### 8.3 comments.service.ts

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async create(createCommentDto: any): Promise<Comment> {
    const comment = this.commentsRepository.create(createCommentDto);
    return this.commentsRepository.save(comment);
  }

  async findByTask(taskId: number): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { taskId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }
}
```

### 8.4 comments.controller.ts

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Body() createCommentDto: any) {
    return this.commentsService.create(createCommentDto);
  }

  @Get('task/:taskId')
  findByTask(@Param('taskId') taskId: string) {
    return this.commentsService.findByTask(+taskId);
  }
}
```

---

## 🏆 PASO 9: MÓDULOS RESTANTES (SIMPLIFICADOS)

### 9.1 AUTH MODULE (Estructura básica)

Crear carpeta `src/auth/` con:

**auth.module.ts**:
```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
```

**auth.service.ts**:
```typescript
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(createUserDto: any) {
    return this.usersService.create(createUserDto);
  }
}
```

**auth.controller.ts**:
```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: any) {
    const user = await this.authService.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      return { message: 'Invalid credentials' };
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() registerDto: any) {
    return this.authService.register(registerDto);
  }
}
```

### 9.2 SHOP MODULE

Crear estructura mínima en `src/shop/`:

**shop-item.entity.ts** en `src/shop/entities/`:
```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum ShopItemCategory {
  WEAPONS = 'weapons',
  ARMOR = 'armor',
  POTIONS = 'potions',
}

@Entity('shop_items')
export class ShopItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'enum', enum: ShopItemCategory })
  category: ShopItemCategory;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  benefit: string;

  @Column({ type: 'varchar', length: 50 })
  icon: string;

  @Column({ type: 'int' })
  price: number;

  @Column({ name: 'discount_percentage', type: 'int', default: 0 })
  discountPercentage: number;

  @Column({ name: 'is_offer', type: 'boolean', default: false })
  isOffer: boolean;

  @Column({ name: 'duration_hours', type: 'int' })
  durationHours: number;

  @Column({ type: 'boolean', default: true })
  available: boolean;
}
```

**shop.module.ts**, **shop.service.ts**, **shop.controller.ts** - estructura básica similar a otros módulos.

### 9.3 INVENTORY MODULE

Estructura en `src/inventory/`:

**user-inventory.entity.ts**:
```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ShopItem } from '../../shop/entities/shop-item.entity';

@Entity('user_inventory')
export class UserInventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'item_id', type: 'int' })
  itemId: number;

  @Column({ type: 'boolean', default: false })
  equipped: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ShopItem)
  @JoinColumn({ name: 'item_id' })
  item: ShopItem;
}
```

**user-purchase.entity.ts**:
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_purchases')
export class UserPurchase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'item_id', type: 'varchar' })
  itemId: string;

  @CreateDateColumn({ name: 'purchased_at' })
  purchasedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.purchases)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

### 9.4 ACHIEVEMENTS MODULE

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AchievementType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  icon: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: AchievementType })
  type: AchievementType;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ type: 'int', nullable: true })
  progress: number;

  @Column({ type: 'int', nullable: true })
  total: number;

  @ManyToOne(() => User, (user) => user.achievements)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

### 9.5 DATE-CHANGE-REQUESTS MODULE

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('date_change_requests')
export class DateChangeRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'task_id', type: 'int' })
  taskId: number;

  @Column({ name: 'requested_by', type: 'int' })
  requestedBy: number;

  @Column({ name: 'old_date', type: 'date' })
  oldDate: Date;

  @Column({ name: 'new_date', type: 'date' })
  newDate: Date;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

---

## 🎨 PASO 10: FRONTEND - INSTALACIÓN

### 10.1 package.json del Frontend

Crear `Lvl Up/package.json`:

```json
{
  "name": "lvl-up-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.553.0",
    "recharts": "^3.4.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@typescript-eslint/eslint-plugin": "^7.2.0",
    "@typescript-eslint/parser": "^7.2.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.22",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.6",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.17",
    "typescript": "^5.2.2",
    "vite": "^5.2.0"
  }
}
```

### 10.2 Instalar dependencias

```bash
cd "Lvl Up"
npm install
```

### 10.3 Archivos de configuración

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
})
```

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**tailwind.config.js**:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**postcss.config.js**:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**index.html**:
```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LVL UP! - Gamificación Empresarial</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 📱 PASO 11: ARCHIVOS FRONTEND PRINCIPALES

### 11.1 src/main.tsx

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 11.2 src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### 11.3 src/App.tsx

**IMPORTANTE**: Usa el archivo más completo de los 3 que tienes. El archivo "LVL UP - App Completa Unificada.tsx" es el más avanzado. Copia TODO su contenido aquí.

*(El contenido del archivo ya está documentado arriba en los primeros documentos que adjuntaste)*

---

## 🗄️ PASO 12: RESTAURAR BASE DE DATOS

### 12.1 Crear base de datos vacía

Abre pgAdmin y:
1. Click derecho en "Databases"
2. Create → Database
3. Name: `lvl_up_db`
4. Save

### 12.2 Restaurar el backup

En la terminal de Windows (PowerShell):

```powershell
# Navega a donde está el backup
cd "C:\Users\alimr\Downloads"  # O donde esté el archivo

# Restaurar (ajusta la ruta de pg_restore si es necesaria)
"C:\Program Files\PostgreSQL\[VERSION]\bin\pg_restore" -U postgres -d lvl_up_db backup_pre_migration.backup
```

*(Reemplaza [VERSION] con tu versión de PostgreSQL, ej: 15 o 16)*

**ALTERNATIVA**: Desde pgAdmin:
1. Click derecho en `lvl_up_db`
2. Restore...
3. Format: Custom or tar
4. Filename: Selecciona `backup_pre_migration.backup`
5. Restore

---

## ▶️ PASO 13: EJECUTAR EL PROYECTO

### 13.1 Iniciar Backend

```bash
cd lvl-up-backend
npm run start:dev
```

Deberías ver:
```
🚀 Application is running on: http://localhost:3000
```

### 13.2 Iniciar Frontend

En otra terminal:

```bash
cd "Lvl Up"
npm run dev
```

Deberías ver:
```
Local: http://localhost:5173
```

---

## ✅ PASO 14: VERIFICACIÓN FINAL

1. **Abre el navegador**: http://localhost:5173
2. **Credenciales de prueba**:
   - Usuario: `prueba`
   - Contraseña: `123456789`
3. **Verifica que funcione**:
   - Login
   - Ver misiones
   - Crear tarea
   - Completar tarea

---

## 🆘 TROUBLESHOOTING

### Error: "Cannot find module"
```bash
cd lvl-up-backend
npm install
```

### Error: Database connection
- Verifica que PostgreSQL esté corriendo
- Revisa credenciales en `.env`
- Confirma que la base de datos `lvl_up_db` existe

### Error: Puerto ocupado
- Backend (3000): Cierra otras apps en ese puerto
- Frontend (5173): Cierra otras instancias de Vite

### TypeScript errors
```bash
npm install --save-dev @types/node @types/bcrypt @types/passport-jwt
```

---

## 📋 CHECKLIST FINAL

- [ ] Node.js instalado (`node -v`)
- [ ] PostgreSQL instalado y corriendo
- [ ] Carpeta del proyecto creada
- [ ] Backend instalado (`npm install` en lvl-up-backend)
- [ ] Frontend instalado (`npm install` en Lvl Up)
- [ ] Archivo `.env` configurado con contraseña correcta
- [ ] Base de datos `lvl_up_db` creada
- [ ] Backup restaurado en PostgreSQL
- [ ] Backend ejecutándose (http://localhost:3000)
- [ ] Frontend ejecutándose (http://localhost:5173)
- [ ] Login funciona con usuario `prueba` / `123456789`

---

## 🎯 RESUMEN DE COMANDOS RÁPIDOS

```bash
# Crear estructura
mkdir "LVL Up!"
cd "LVL Up!"

# Backend
mkdir lvl-up-backend
cd lvl-up-backend
npm init -y
# [Configurar package.json como se indicó arriba]
npm install
npm run start:dev

# Frontend (en otra terminal)
cd ..
mkdir "Lvl Up"
cd "Lvl Up"
npm create vite@latest . -- --template react-ts
# [Configurar package.json como se indicó arriba]
npm install
npm run dev
```

---

## ✨ NOTAS FINALES

1. **No olvides cambiar** las contraseñas en `.env` antes de producción
2. **synchronize: true** está activado para desarrollo - cambiar a `false` en producción
3. El backup contiene datos de prueba - puedes usarlos o crear nuevos
4. Los 3 archivos frontend que tienes son versiones iterativas - usa el más completo

---

## 🚀 ¡LISTO!

Con estas instrucciones, Claude Code debería poder reconstruir **completamente** tu proyecto LVL UP!.

Si encuentras errores, pídele a Claude Code que:
1. Verifique la instalación de dependencias
2. Revise la configuración de PostgreSQL
3. Confirme que todos los archivos fueron creados correctamente

**¡Mucho éxito con la recuperación del proyecto!** 💪
