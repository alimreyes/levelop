# 🎯 LVL UP - Matriz de Prioridades y Quick Start

## 📊 MATRIZ DE IMPACTO vs COMPLEJIDAD

```
ALTO IMPACTO, BAJA COMPLEJIDAD (Quick Wins - Hacer YA)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟢 Navegación intuitiva (oro→tienda, nivel→héroe)
🟢 Botón mostrar contraseña
🟢 Mantener sesión iniciada
🟢 Modal para nueva tarea
🟢 Mejoras en filtros (X, dropdown indicator)


ALTO IMPACTO, ALTA COMPLEJIDAD (Críticos - Planificar bien)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 Backend + Auth + API REST
🔴 Sistema de roles (jefe vs usuario)
🔴 Notificaciones real-time
🔴 Inventario + efectos de ítems
🔴 Sistema de logros automático
🔴 Acciones rápidas en tareas


BAJO IMPACTO, BAJA COMPLEJIDAD (Pulido - Después)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟡 Búsqueda mejorada
🟡 Ente regulador "Alim"
🟡 Fechas en gráficas


BAJO IMPACTO, ALTA COMPLEJIDAD (Evitar por ahora)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚫ Sistema de batallas completo
⚫ Amenazas grupales
⚫ Marketplace de recompensas reales
```

---

## 🚀 QUICK START GUIDE - PRIMERAS 2 SEMANAS

### Semana 1: Quick Wins + Setup Backend

#### DÍA 1-2: Quick Wins de UX (6-8 horas)
```typescript
// 1. Botón mostrar contraseña (30 min)
const [showPassword, setShowPassword] = useState(false);

<div className="relative">
  <input 
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />
  <button 
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-3"
  >
    {showPassword ? <EyeOff /> : <Eye />}
  </button>
</div>

// 2. Navegación intuitiva (1 hora)
// En header:
<button onClick={() => setActiveTab('rewards')}>
  <Coins className="w-4 h-4" />
  <span>{user.gold}</span>
</button>

<button onClick={() => setActiveTab('hero')}>
  <span>Nivel {user.level}</span>
</button>

// 3. Mantener sesión (1 hora)
const [rememberMe, setRememberMe] = useState(false);

const handleLogin = () => {
  // ... validar credenciales
  const token = generateToken(); // Tu lógica
  
  if (rememberMe) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('token_expiry', Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días
  }
  
  setIsLoggedIn(true);
};

// Al cargar app:
useEffect(() => {
  const token = localStorage.getItem('auth_token');
  const expiry = localStorage.getItem('token_expiry');
  
  if (token && expiry && Date.now() < parseInt(expiry)) {
    // Auto-login
    validateTokenAndLogin(token);
  }
}, []);

// 4. Modal para nueva tarea (2 horas)
// Reemplazar el componente inline por un modal
{showNewTask && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-slide-up">
      <h3 className="text-xl font-bold mb-4">✨ Nueva Misión</h3>
      {/* Formulario mejorado */}
    </div>
  </div>
)}

// 5. Mejoras en filtros (1.5 horas)
<button 
  onClick={() => setShowFilters(!showFilters)}
  className="relative"
>
  <Filter className="w-4 h-4" />
  {showFilters && (
    <X className="absolute -top-1 -right-1 w-3 h-3 text-red-500" />
  )}
  {getActiveFiltersCount() > 0 && (
    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5">
      {getActiveFiltersCount()}
    </span>
  )}
</button>
```

**Resultado Día 1-2:** 5 mejoras visibles que los usuarios notarán de inmediato ✅

---

#### DÍA 3-5: Setup Backend Básico (24 horas de desarrollo)

**Tecnología sugerida:** NestJS + PostgreSQL

```bash
# Día 3: Inicializar proyecto
npm i -g @nestjs/cli
nest new lvlup-backend
cd lvlup-backend

# Instalar dependencias
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install bcrypt class-validator class-transformer
npm install @nestjs/config

# Estructura de carpetas
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── jwt.strategy.ts
│   └── dto/
│       ├── login.dto.ts
│       └── register.dto.ts
├── users/
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   ├── entities/
│   │   └── user.entity.ts
│   └── dto/
├── tasks/
│   ├── tasks.controller.ts
│   ├── tasks.service.ts
│   ├── tasks.module.ts
│   └── entities/
│       └── task.entity.ts
└── common/
    ├── guards/
    │   └── roles.guard.ts
    └── decorators/
        └── roles.decorator.ts
```

**Schema de Base de Datos (PostgreSQL):**

```sql
-- Día 3: Crear schema básico

CREATE TYPE user_role AS ENUM ('user', 'team_leader', 'admin');
CREATE TYPE task_category AS ENUM ('upcoming', 'review', 'delayed', 'completed');
CREATE TYPE urgency_level AS ENUM ('baja', 'media', 'alta');
CREATE TYPE importance_level AS ENUM ('baja', 'media', 'alta');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role user_role DEFAULT 'user',
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  xp_to_next INTEGER DEFAULT 1000,
  gold INTEGER DEFAULT 0,
  avatar VARCHAR(10) DEFAULT '⚔️',
  avatar_color VARCHAR(50) DEFAULT 'bg-blue-600',
  department VARCHAR(50),
  team_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category task_category DEFAULT 'upcoming',
  urgency urgency_level DEFAULT 'media',
  importance importance_level DEFAULT 'media',
  due_date TIMESTAMP NOT NULL,
  xp_reward INTEGER NOT NULL,
  gold_reward INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  assigned_to INTEGER REFERENCES users(id),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE task_collaborators (
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (task_id, user_id)
);

CREATE TABLE task_comments (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shop_items (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  benefit TEXT,
  icon VARCHAR(10),
  price INTEGER NOT NULL,
  discount_percentage INTEGER DEFAULT 0,
  is_offer BOOLEAN DEFAULT FALSE,
  duration_hours INTEGER NOT NULL,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_purchases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  item_id VARCHAR(10) REFERENCES shop_items(id),
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  type VARCHAR(50),
  requirement JSONB
);

CREATE TABLE user_achievements (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, achievement_id)
);

-- Índices para performance
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
```

**Día 4: Implementar Auth + Users**

```typescript
// src/users/entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ['user', 'team_leader', 'admin'], default: 'user' })
  role: string;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  xp: number;

  @Column({ name: 'xp_to_next', default: 1000 })
  xpToNext: number;

  @Column({ default: 0 })
  gold: number;

  @Column({ default: '⚔️' })
  avatar: string;

  @Column({ name: 'avatar_color', default: 'bg-blue-600' })
  avatarColor: string;

  @Column({ nullable: true })
  department: string;

  @Column({ name: 'team_id', nullable: true })
  teamId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @CreateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// src/auth/auth.service.ts
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
    if (user && await bcrypt.compare(password, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { 
      sub: user.id, 
      username: user.username, 
      role: user.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async register(registerDto: any) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      passwordHash: hashedPassword,
    });

    const { passwordHash, ...result } = user;
    return result;
  }
}
```

**Día 5: Implementar Tasks CRUD**

```typescript
// src/tasks/entities/task.entity.ts
@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ['upcoming', 'review', 'delayed', 'completed'] })
  category: string;

  @Column({ type: 'enum', enum: ['baja', 'media', 'alta'] })
  urgency: string;

  @Column({ type: 'enum', enum: ['baja', 'media', 'alta'] })
  importance: string;

  @Column({ name: 'due_date', type: 'timestamp' })
  dueDate: Date;

  @Column({ name: 'xp_reward' })
  xpReward: number;

  @Column({ name: 'gold_reward' })
  goldReward: number;

  @Column({ default: false })
  completed: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_to' })
  assignedTo: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

// src/tasks/tasks.service.ts
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: number) {
    // Calcular recompensas
    const urgencyMult = { baja: 1, media: 1.5, alta: 2 };
    const importanceMult = { baja: 1, media: 1.5, alta: 2 };

    const xpReward = Math.floor(50 * urgencyMult[createTaskDto.urgency] * importanceMult[createTaskDto.importance]);
    const goldReward = Math.floor(20 * urgencyMult[createTaskDto.urgency] * importanceMult[createTaskDto.importance]);

    const task = this.tasksRepository.create({
      ...createTaskDto,
      xpReward,
      goldReward,
      createdBy: { id: userId },
    });

    return this.tasksRepository.save(task);
  }

  async completeTask(taskId: number, userId: number) {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId },
      relations: ['assignedTo'],
    });

    if (!task) throw new NotFoundException('Tarea no encontrada');

    // Verificar permisos
    if (task.assignedTo.id !== userId) {
      throw new ForbiddenException('No puedes completar esta tarea');
    }

    // Actualizar tarea
    task.completed = true;
    task.category = 'completed';
    await this.tasksRepository.save(task);

    // Actualizar usuario (XP y Gold)
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    user.xp += task.xpReward;
    user.gold += task.goldReward;

    // Subir de nivel si es necesario
    while (user.xp >= user.xpToNext) {
      user.level++;
      user.xp -= user.xpToNext;
      user.xpToNext = Math.floor(user.xpToNext * 1.5);
    }

    await this.usersRepository.save(user);

    return { task, user };
  }
}
```

**Resultado Semana 1:**
- ✅ 5 mejoras de UX visibles
- ✅ Backend funcional con auth
- ✅ Base de datos configurada
- ✅ CRUD de tareas funcionando

---

### Semana 2: Conectar Frontend + Sistema de Roles

#### DÍA 6-8: Conectar React con API (16 horas)

```bash
# Instalar dependencias en frontend
npm install @tanstack/react-query axios
```

```typescript
// src/api/client.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// src/api/auth.ts
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data;
  },

  register: async (userData: any) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

// src/api/tasks.ts
export const tasksApi = {
  getAll: async () => {
    const response = await apiClient.get('/tasks');
    return response.data;
  },

  create: async (taskData: any) => {
    const response = await apiClient.post('/tasks', taskData);
    return response.data;
  },

  complete: async (taskId: number) => {
    const response = await apiClient.post(`/tasks/${taskId}/complete`);
    return response.data;
  },

  delete: async (taskId: number) => {
    const response = await apiClient.delete(`/tasks/${taskId}`);
    return response.data;
  },
};

// src/hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks';

export const useTasks = () => {
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksApi.getAll,
  });

  const completeMutation = useMutation({
    mutationFn: tasksApi.complete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    tasks: tasks || [],
    isLoading,
    completeTask: completeMutation.mutate,
    createTask: createMutation.mutate,
  };
};

// Actualizar componente principal
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LvlUpApp />
    </QueryClientProvider>
  );
}
```

#### DÍA 9-10: Sistema de Roles en UI (8 horas)

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

interface AuthContextType {
  user: any;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isTeamLeader: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Auto-login si hay token
    const token = localStorage.getItem('auth_token');
    if (token) {
      authApi.getCurrentUser()
        .then(setUser)
        .catch(() => localStorage.removeItem('auth_token'))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const { access_token, user } = await authApi.login(username, password);
    localStorage.setItem('auth_token', access_token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isTeamLeader: user?.role === 'team_leader' || user?.role === 'admin',
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

// Usar en componentes:
import { useAuth } from './contexts/AuthContext';

function TaskCard({ task }) {
  const { isTeamLeader } = useAuth();

  return (
    <div>
      <h3>{task.title}</h3>
      {/* Solo jefes ven botón eliminar */}
      {isTeamLeader && (
        <button onClick={() => deleteTask(task.id)}>
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
```

**Resultado Semana 2:**
- ✅ Frontend conectado con backend
- ✅ Sistema de roles funcionando
- ✅ Usuarios pueden login/logout
- ✅ Persistencia real de datos
- ✅ Permisos diferenciados por rol

---

## 🎯 PRÓXIMOS PASOS (Semana 3+)

Ya con esto tienes una base sólida. Ahora puedes empezar con:

1. **Acciones rápidas en tareas** (Fase 1.4)
2. **Rebalanceo de economía** (Fase 2.1)
3. **Sistema de inventario** (Fase 2.2)

---

## ✅ CHECKLIST DE PRIMERAS 2 SEMANAS

### Semana 1
- [ ] Botón mostrar contraseña
- [ ] Navegación intuitiva (oro→tienda, nivel→héroe)
- [ ] Mantener sesión iniciada
- [ ] Modal nueva tarea
- [ ] Mejoras en filtros
- [ ] Setup NestJS backend
- [ ] Schema PostgreSQL
- [ ] Auth endpoints
- [ ] Tasks CRUD endpoints

### Semana 2
- [ ] Instalar React Query
- [ ] Crear API client
- [ ] Hooks para tasks
- [ ] Hooks para auth
- [ ] Conectar login con API
- [ ] Conectar tasks con API
- [ ] Implementar roles en UI
- [ ] Testing básico

---

## 💡 TIPS IMPORTANTES

1. **Commit frecuente:** Haz commits cada feature pequeño
2. **Testing desde el inicio:** Aunque sean tests básicos
3. **Environment variables:** Nunca commitees .env
4. **Docker:** Usa docker-compose para development local
5. **Documentation:** README actualizado con setup instructions

---

¿Quieres que empiece a implementar algo de esto o prefieres que profundice en alguna sección?
