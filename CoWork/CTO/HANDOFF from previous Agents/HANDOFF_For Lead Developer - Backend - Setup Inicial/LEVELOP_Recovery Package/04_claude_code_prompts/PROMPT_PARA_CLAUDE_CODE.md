# 🚀 PROMPT COMPLETO PARA CLAUDE CODE - RECUPERACIÓN LVL UP!

## 📋 CONTEXTO DEL PROYECTO

Soy Alim, fundador de **LVL UP!** - una plataforma SaaS de gestión de tareas gamificada que transforma el trabajo diario en una experiencia RPG. El proyecto se perdió después de reiniciar mi laptop, pero tengo:

1. ✅ **Backup de base de datos PostgreSQL** (backup_pre_migration.backup)
2. ✅ **3 archivos frontend completos** (React + TypeScript + Tailwind)
3. ✅ **Documentación completa** del backend

Necesito que reconstruyas TODO el proyecto desde cero.

---

## 🎯 ESTRUCTURA DEL PROYECTO

```
LVL UP!/
├── lvl-up-frontend/          # React + Vite + Tailwind
│   ├── src/
│   │   ├── App.tsx           # 3 componentes completos
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── lvl-up-backend/           # NestJS + TypeORM + PostgreSQL
    ├── src/
    │   ├── main.ts
    │   ├── app.module.ts
    │   ├── auth/              # Módulo de autenticación
    │   ├── users/             # Gestión de usuarios
    │   ├── tasks/             # Sistema de tareas/misiones
    │   ├── notifications/     # Sistema de notificaciones
    │   ├── achievements/      # Sistema de logros
    │   ├── shop/              # Tienda virtual
    │   ├── inventory/         # Inventario de usuarios
    │   ├── comments/          # Sistema de comentarios
    │   └── date-change-requests/  # Solicitudes de cambio de fecha
    ├── package.json
    ├── tsconfig.json
    └── .env
```

---

## 🔥 TAREA PRINCIPAL

**Crea el proyecto completo con todos los archivos necesarios.**

### PASO 1: INSTALACIONES NECESARIAS

**Primero verifica e instala lo que falte:**

```bash
# Verificar Node.js (debe ser v18+)
node -v

# Si no está instalado, descárgalo de: https://nodejs.org/

# Verificar PostgreSQL
psql --version

# Si no está instalado, descárgalo de: https://www.postgresql.org/download/
```

### PASO 2: CREAR FRONTEND (React + Vite + Tailwind)

**Ubicación:** `C:\Users\alimr\Documents\LVL Up!\lvl-up-frontend`

#### Archivos a crear:

**1. package.json**
```json
{
  "name": "lvl-up-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
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
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.22",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.17",
    "typescript": "^5.2.2",
    "vite": "^5.2.0"
  }
}
```

**2. vite.config.ts**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})
```

**3. tsconfig.json**
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

**4. tsconfig.node.json**
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

**5. tailwind.config.js**
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

**6. postcss.config.js**
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**7. index.html**
```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LVL UP! - Gamifica tu Trabajo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**8. src/main.tsx**
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**9. src/index.css**
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

* {
  box-sizing: border-box;
}
```

**10. src/App.tsx**
```typescript
// PEGAR AQUÍ EL CONTENIDO DEL ARCHIVO: "LVL UP - App Completa Unificada.tsx"
// (Es el archivo más completo de los 3 que tienes)
```

### PASO 3: CREAR BACKEND (NestJS + TypeORM + PostgreSQL)

**Ubicación:** `C:\Users\alimr\Documents\LVL Up!\lvl-up-backend`

#### Crear proyecto base:
```bash
cd "C:\Users\alimr\Documents\LVL Up!"
npx @nestjs/cli new lvl-up-backend
# Selecciona "npm" como package manager
cd lvl-up-backend
```

#### Instalar dependencias:
```bash
npm install @nestjs/typeorm typeorm pg @nestjs/passport passport passport-local @nestjs/jwt passport-jwt bcrypt class-validator class-transformer @nestjs/config
npm install -D @types/passport-local @types/passport-jwt @types/bcrypt
```

#### Archivos a crear:

**1. .env**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password_aqui
DB_NAME=lvl_up_db

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui_cambiar_en_produccion
JWT_EXPIRES_IN=7d

# Server
PORT=3001
```

**2. src/main.ts**
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  await app.listen(process.env.PORT || 3001);
  console.log(`🚀 Backend running on: http://localhost:${process.env.PORT || 3001}`);
}
bootstrap();
```

**3. src/app.module.ts**
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AchievementsModule } from './achievements/achievements.module';
import { ShopModule } from './shop/shop.module';
import { InventoryModule } from './inventory/inventory.module';
import { CommentsModule } from './comments/comments.module';
import { DateChangeRequestsModule } from './date-change-requests/date-change-requests.module';

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
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // ⚠️ Cambiar a false en producción
      logging: false,
    }),
    AuthModule,
    UsersModule,
    TasksModule,
    NotificationsModule,
    AchievementsModule,
    ShopModule,
    InventoryModule,
    CommentsModule,
    DateChangeRequestsModule,
  ],
})
export class AppModule {}
```

---

### PASO 4: CREAR MÓDULOS DEL BACKEND

Para cada módulo, necesitas crear 5 archivos:
1. **module.ts** - Configuración del módulo
2. **entity.ts** - Modelo de base de datos
3. **dto/** - Objetos de transferencia de datos
4. **service.ts** - Lógica de negocio
5. **controller.ts** - Endpoints API

#### MÓDULO: AUTH (src/auth/)

**auth.module.ts**
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
```

**auth.service.ts**
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
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
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        level: user.level,
        xp: user.xp,
        gold: user.gold,
      },
    };
  }

  async register(createUserDto: any) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.login(user);
  }
}
```

**auth.controller.ts**
```typescript
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() createUserDto: any) {
    return this.authService.register(createUserDto);
  }
}
```

**strategies/local.strategy.ts**
```typescript
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return user;
  }
}
```

**strategies/jwt.strategy.ts**
```typescript
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, username: payload.username, role: payload.role };
  }
}
```

**guards/local-auth.guard.ts**
```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
```

**guards/jwt-auth.guard.ts**
```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

---

#### MÓDULO: USERS (src/users/)

**users.entity.ts**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Task } from '../tasks/task.entity';
import { Comment } from '../comments/comment.entity';
import { Achievement } from '../achievements/achievement.entity';
import { UserPurchase } from '../inventory/user-purchase.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  TEAM_LEADER = 'team_leader',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  xp: number;

  @Column({ name: 'xp_to_next', default: 100 })
  xpToNext: number;

  @Column({ default: 0 })
  gold: number;

  @Column({ default: '⚔️' })
  avatar: string;

  @Column({ name: 'avatar_color', default: 'bg-blue-600' })
  avatarColor: string;

  @Column({ name: 'is_team_leader', default: false })
  isTeamLeader: boolean;

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken: string;

  @Column({ name: 'unassignable_until', type: 'timestamp', nullable: true })
  unassignableUntil: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

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

**users.service.ts**
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'username', 'name', 'department', 'role', 'level', 'xp', 'gold', 'avatar', 'avatarColor'],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async create(createUserDto: any): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async update(id: number, updateUserDto: any): Promise<User> {
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async addXP(id: number, xp: number): Promise<User> {
    const user = await this.findOne(id);
    user.xp += xp;
    
    while (user.xp >= user.xpToNext) {
      user.xp -= user.xpToNext;
      user.level += 1;
      user.xpToNext = Math.floor(user.xpToNext * 1.5);
    }
    
    return this.usersRepository.save(user);
  }

  async addGold(id: number, gold: number): Promise<User> {
    const user = await this.findOne(id);
    user.gold += gold;
    return this.usersRepository.save(user);
  }
}
```

**users.controller.ts**
```typescript
import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

  @Patch(':id/xp')
  addXP(@Param('id') id: string, @Body('xp') xp: number) {
    return this.usersService.addXP(+id, xp);
  }

  @Patch(':id/gold')
  addGold(@Param('id') id: string, @Body('gold') gold: number) {
    return this.usersService.addGold(+id, gold);
  }
}
```

**users.module.ts**
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

---

#### MÓDULO: TASKS (src/tasks/)

**task.entity.ts**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Comment } from '../comments/comment.entity';

export enum TaskCategory {
  UPCOMING = 'upcoming',
  REVIEW = 'review',
  DELAYED = 'delayed',
  COMPLETED = 'completed',
}

export enum TaskUrgency {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
}

export enum TaskImportance {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TaskCategory,
    default: TaskCategory.UPCOMING,
  })
  category: TaskCategory;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: TaskUrgency,
    default: TaskUrgency.MEDIA,
  })
  urgency: TaskUrgency;

  @Column({
    type: 'enum',
    enum: TaskImportance,
    default: TaskImportance.MEDIA,
  })
  importance: TaskImportance;

  @Column({ name: 'xp_reward', default: 50 })
  xpReward: number;

  @Column({ name: 'gold_reward', default: 20 })
  goldReward: number;

  @Column({ default: false })
  completed: boolean;

  @Column({ name: 'assigned_to' })
  assignedTo: number;

  @Column({ type: 'simple-array', nullable: true })
  collaborators: number[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.tasks)
  @JoinColumn({ name: 'assigned_to' })
  assignedUser: User;

  @OneToMany(() => Comment, (comment) => comment.task)
  comments: Comment[];
}
```

**tasks.service.ts**
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskCategory } from './task.entity';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

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
      throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    }
    return task;
  }

  async create(createTaskDto: any): Promise<Task> {
    const task = this.tasksRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      category: createTaskDto.category || TaskCategory.UPCOMING,
      dueDate: createTaskDto.dueDate,
      urgency: createTaskDto.urgency,
      importance: createTaskDto.importance,
      xpReward: createTaskDto.xpReward || 50,
      goldReward: createTaskDto.goldReward || 20,
      assignedTo: createTaskDto.assignedTo,
      collaborators: createTaskDto.collaborators || [],
    });
    return this.tasksRepository.save(task);
  }

  async update(id: number, updateTaskDto: any): Promise<Task> {
    const task = await this.findOne(id);
    Object.assign(task, updateTaskDto);
    return this.tasksRepository.save(task);
  }

  async remove(id: number): Promise<void> {
    const task = await this.findOne(id);
    await this.tasksRepository.remove(task);
  }

  async complete(id: number, userId: number): Promise<Task> {
    const task = await this.findOne(id);
    task.completed = true;
    task.category = TaskCategory.COMPLETED;

    await this.usersService.addXP(userId, task.xpReward);
    await this.usersService.addGold(userId, task.goldReward);

    await this.notificationsService.create({
      userId,
      type: NotificationType.TASK_COMPLETED,
      message: `Has completado la misión "${task.title}"`,
      relatedTaskId: task.id,
    });

    return this.tasksRepository.save(task);
  }

  async completeWithPenalty(id: number, userId: number): Promise<{ task: Task; penalty: any }> {
    const task = await this.findOne(id);
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    
    let penalty = { applied: false, xpLost: 0, goldLost: 0 };
    
    if (now > dueDate) {
      const daysLate = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      penalty = {
        applied: true,
        xpLost: Math.floor(task.xpReward * 0.5),
        goldLost: Math.floor(task.goldReward * 0.5),
        daysLate,
      };
      
      task.xpReward = Math.floor(task.xpReward * 0.5);
      task.goldReward = Math.floor(task.goldReward * 0.5);
    }
    
    const completedTask = await this.complete(id, userId);
    return { task: completedTask, penalty };
  }
}
```

**tasks.controller.ts**
```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

  @Post()
  create(@Body() createTaskDto: any) {
    return this.tasksService.create(createTaskDto);
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
  complete(@Param('id') id: string, @Body('userId') userId: number) {
    return this.tasksService.complete(+id, userId);
  }

  @Post(':id/completeWithPenalty')
  completeWithPenalty(@Param('id') id: string, @Body('userId') userId: number) {
    return this.tasksService.completeWithPenalty(+id, userId);
  }
}
```

**tasks.module.ts**
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './task.entity';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    UsersModule,
    NotificationsModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
```

---

### PASO 5: CREAR BASE DE DATOS Y RESTAURAR BACKUP

```bash
# 1. Abrir pgAdmin 4

# 2. Crear nueva base de datos:
#    - Click derecho en "Databases" → Create → Database
#    - Name: lvl_up_db
#    - Owner: postgres
#    - Save

# 3. Restaurar backup:
#    - Click derecho en "lvl_up_db" → Restore...
#    - Format: Custom or tar
#    - Filename: Selecciona "backup_pre_migration.backup"
#    - Click "Restore"

# 4. Verificar que las tablas se crearon correctamente
```

### PASO 6: EJECUTAR EL PROYECTO

**Terminal 1 - Backend:**
```bash
cd "C:\Users\alimr\Documents\LVL Up!\lvl-up-backend"
npm install
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd "C:\Users\alimr\Documents\LVL Up!\lvl-up-frontend"
npm install
npm run dev
```

### PASO 7: VERIFICAR

Abre tu navegador en: **http://localhost:3000**

Credenciales de prueba:
- Usuario: `prueba`
- Contraseña: `123456789`

---

## 🚨 NOTAS IMPORTANTES

1. **INSTALA Node.js SI NO LO TIENES:** https://nodejs.org/
2. **INSTALA PostgreSQL SI NO LO TIENES:** https://www.postgresql.org/download/
3. **Cambia las contraseñas** en el archivo `.env` del backend
4. **Ejecuta ambos servidores** (backend y frontend) al mismo tiempo

---

## ✅ MÓDULOS FALTANTES (CREAR DESPUÉS)

Los siguientes módulos siguen el mismo patrón que los anteriores:

- **notifications** (Sistema de notificaciones)
- **achievements** (Sistema de logros)
- **shop** (Tienda virtual)
- **inventory** (Inventario de usuarios)
- **comments** (Sistema de comentarios)
- **date-change-requests** (Solicitudes de cambio de fecha)

Cada uno necesita:
1. entity.ts
2. service.ts
3. controller.ts
4. module.ts
5. DTOs (si es necesario)

---

## 🎯 RESUMEN DE LO QUE DEBES HACER

1. ✅ Instala Node.js y PostgreSQL
2. ✅ Crea ambas carpetas del proyecto (frontend y backend)
3. ✅ Copia todos los archivos que te proporcioné
4. ✅ Instala dependencias con `npm install`
5. ✅ Crea la base de datos en pgAdmin
6. ✅ Restaura el backup
7. ✅ Ejecuta ambos servidores
8. ✅ Abre http://localhost:3000

---

**¿NECESITAS QUE CREE LOS MÓDULOS FALTANTES?** Avísame y los genero completos.
