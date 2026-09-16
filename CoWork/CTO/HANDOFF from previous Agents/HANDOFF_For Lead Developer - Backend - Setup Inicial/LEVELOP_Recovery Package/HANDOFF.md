# 🎮 LVL UP! — Documento de Traspaso (Handoff) para el Próximo Agente

> **Última actualización:** 7 de agosto 2026
> **Preparado por:** Claude (sesión de recuperación post-crash de laptop)
> **Para:** El próximo agente/sesión de Claude que continúe este proyecto

---

## 1️⃣ OBJETIVO DEL PROYECTO

**LVL UP!** es una plataforma SaaS de gamificación que convierte la gestión de tareas empresariales en una experiencia tipo RPG, para combatir el desenganche laboral.

- **Fundador/CEO:** Alim
- **Propuesta de valor:** las tareas diarias se convierten en "misiones" con recompensas de XP y oro virtual, niveles, logros y leaderboards de equipo.
- **Mercado objetivo:** agencias y empresas tech pequeñas (10-30 empleados) en Santiago, Chile (prospectos identificados: Base1 Publicidad y Marketing, Agencia Salvaje).
- **Precio:** US$10-12/usuario/mes (oferta fundador: US$4/usuario/mes, 60% off, para early adopters).
- **Meta de negocio inmediata:** conseguir 4-5 clientes beta mediante un plan de outreach de 14 días (LinkedIn, email, WhatsApp).
- **Stack técnico objetivo:**
  - Frontend: React + TypeScript + Vite + Tailwind CSS + lucide-react + Recharts
  - Backend: NestJS + TypeORM + PostgreSQL
  - Auth: JWT (passport-jwt / passport-local)
- **Filosofía del fundador:** "hecho es mejor que perfecto" — priorizar ejecución rápida sobre planificación exhaustiva.

---

## 2️⃣ STATUS ACTUAL (dónde estamos AHORA MISMO)

🔴 **Estado crítico:** El 7 de agosto Alim reinició su laptop y **perdió todo el entorno de desarrollo local** (carpetas del proyecto, `node_modules`, archivos backend editados). No se perdió el frontend (vive en Project Knowledge de este chat) ni la base de datos (hay un backup).

**Lo que SÍ sobrevivió:**
| Elemento | Estado |
|---|---|
| 3 archivos frontend `.tsx` completos | ✅ Intactos (en Project Knowledge / carpeta `01_frontend/`) |
| Backup PostgreSQL (`backup_pre_migration.backup`) | ✅ Disponible, pero es **PRE-migración** (esquema antiguo camelCase) |
| `Lvl_Up.code-workspace` | ✅ Disponible (solo define 2 carpetas: `Lvl Up` y `lvl-up-backend`) |
| `package.json` | ⚠️ Solo parcial (unas pocas dependencias del frontend, no es el real completo) |
| Todo el código backend NestJS en disco | ❌ **PERDIDO** — solo quedan fragmentos que Claude había generado como archivos de salida en chats anteriores |

**Lo que se hizo en ESTA sesión (recuperación):**
No se escribió ni probó código nuevo. Fue una sesión de **diagnóstico y empaquetado de recuperación**: se repasó todo el historial de la conversación (varias sesiones desde el 29 dic 2025 hasta el 24 ene 2026), se identificaron las versiones más recientes/correctas de cada archivo backend, y se armó un paquete de recuperación (ver sección 3).

**⚠️ Importante — dos caminos que NO son iguales:**
1. Al inicio de esta sesión, antes de tener claridad del historial completo, Claude generó **2 prompts genéricos para Claude Code** (`PROMPT_CLAUDE_CODE_LVL_UP.md` y `PROMPT_PARA_CLAUDE_CODE.md`) que proponen reconstruir el backend **desde cero con una estructura simplificada** (entities con carpetas modulares tipo `src/users/entities/`, enums en inglés `low/medium/high`, campos distintos a los reales).
2. Esto **NO coincide** con el esquema real que se fue corrigiendo en sesiones anteriores (estructura más plana `src/entities/`, enums en español `baja/media/alta`, campos específicos como `unassignableUntil`, `department`, `assignedTo`, `collaborators`, IDs de items como **enteros**, etc.)

👉 **Recomendación:** el próximo agente NO debe usar esos 2 prompts genéricos tal cual. Debe usarlos solo como plantilla de *estructura de proyecto* (carpetas, `package.json`, `main.ts`, `.env`), pero reemplazar las entities/services/controllers por las versiones reales que están en `02_backend/` de este paquete (son las que de verdad se corrigieron a lo largo de varias sesiones).

**Estado del backend antes del crash (lo último confirmado que funcionaba parcialmente):**
- Se habían corregido "30 errores de TypeScript" reemplazando 4 archivos clave: `user.entity.ts`, `task.entity.ts`, `tasks.service.ts`, `tasks.controller.ts` (ver `02_backend/entities/` y `02_backend/tasks/`, sufijo `.FINAL.ts`).
- Justo después de aplicar esos 4 archivos, al reiniciar el servidor, TypeORM intentó sincronizar el esquema (`synchronize: true`) migrando la tabla `tasks` de columnas camelCase a snake_case, y **falló** por un error `NOT NULL constraint` (`due_date` con valores NULL en filas existentes). Se recomendó resetear la base de datos de desarrollo vía pgAdmin (borrar y recrear `lvl_up_db`), pero **no se confirmó si ese reset se llegó a hacer** antes del crash de la laptop.
- Es decir: **no tenemos confirmación de que el backend haya llegado a arrancar sin errores** con el esquema final.

---

## 3️⃣ ARCHIVOS RELEVANTES (paquete de recuperación entregado)

Se entregó un paquete `LVL_UP_RECOVERY/` con esta estructura:

```
LVL_UP_RECOVERY/
├── HANDOFF.md                          ← este documento
├── 01_frontend/
│   ├── App_Completa_Unificada__USAR_ESTE.tsx        ⭐ MÁS COMPLETO (incluye analíticas con Recharts)
│   ├── Sistema_Unificado_de_Misiones__referencia.tsx  (variante con más detalle de misiones, sin Recharts)
│   └── Misiones_Mejoradas_con_Detalles__referencia_antigua.tsx  (versión anterior/parcial)
├── 02_backend/
│   ├── entities/
│   │   ├── user.entity.FINAL.ts        ⭐ Última versión corregida (30-errores fix)
│   │   ├── task.entity.FINAL.ts        ⭐ Última versión corregida (30-errores fix)
│   │   ├── shop-item.entity.CORREGIDO.ts
│   │   └── user-inventory.entity.ts
│   ├── tasks/
│   │   ├── tasks.service.FINAL.ts      ⭐
│   │   └── tasks.controller.FINAL.ts   ⭐
│   ├── shop_inventory/
│   │   ├── shop.service.CORREGIDO.ts
│   │   ├── inventory.service.CORREGIDO.ts
│   │   ├── inventory.controller.ts
│   │   ├── inventory.dto.ts
│   │   └── item-effects.service.ts     (lógica de efectos de items: Arco de Hielo, Espada de Fuego, etc.)
│   └── guias_historicas/               (contexto de decisiones pasadas, ya no acciones pendientes)
├── 03_database/
│   └── backup_pre_migration.backup     ⚠️ Backup PRE-migración (esquema antiguo, camelCase)
├── 04_claude_code_prompts/
│   ├── PROMPT_CLAUDE_CODE_LVL_UP.md    ⚠️ Usar solo como plantilla de estructura, NO como fuente de verdad del schema
│   └── PROMPT_PARA_CLAUDE_CODE.md      ⚠️ Ídem
└── 05_config/
    ├── Lvl_Up.code-workspace
    └── package.json.parcial            (incompleto, solo referencia)
```

**Archivos más críticos a leer primero (en este orden):**
1. Este `HANDOFF.md`
2. `01_frontend/App_Completa_Unificada__USAR_ESTE.tsx` — fuente de verdad del modelo de datos real de la app (interfaces de `task`, `user`, `shop items`, etc. tal como los usa el frontend en `localStorage`)
3. `02_backend/entities/user.entity.FINAL.ts` y `task.entity.FINAL.ts`
4. `02_backend/tasks/tasks.service.FINAL.ts` y `tasks.controller.FINAL.ts`
5. `02_backend/guias_historicas/GUIA-ULTRA-SIMPLIFICADA.md` — resume el último set de correcciones aplicadas

---

## 4️⃣ CAMBIOS Y CORRECCIONES IMPLEMENTADOS (a lo largo de todas las sesiones, resumen histórico)

En orden cronológico, lo que se ha resuelto hasta ahora:

1. **Dic 2025 / Ene 2026 — Migración de `item_id` (INTEGER → VARCHAR):** se intentó varias veces migrar `item_id` de entero a string (`'w1'`, `'a1'`, etc.) para tener IDs semánticos. Se chocó repetidamente con foreign keys que se recreaban solas y bloqueaban la migración en pgAdmin.
2. **✅ DECISIÓN FINAL tomada:** se **abandonó** la migración a VARCHAR. Se adaptó el backend para seguir usando **IDs numéricos** (1-5) que ya coincidían con la base de datos real, evitando tocar la BD. Ver `RESUMEN-CAMBIOS-BACKEND.md`. **Todos los scripts `.sql` de migración a varchar que puedan verse en el historial ya NO aplican — están obsoletos.**
3. **Corrección de rutas de import rotas** entre `shop-item.entity.ts`, `user-inventory.entity.ts`, `inventory.service.ts` (errores de rutas relativas tras reorganizar carpetas).
4. **Eliminación de código muerto:** se borraron `item-effects.controller.ts` (llamaba métodos inexistentes en `ItemEffectsService`) y `shop-discount.service.ts` (usaba una propiedad `rotationExpiresAt` que no existía en `ShopItem`). Se limpiaron las referencias en `inventory.module.ts` y `shop.module.ts`.
5. **Corrección de 30 errores de TypeScript** por entities incompletas:
   - `user.entity.ts` no tenía: `UserRole` exportado, `department`, `unassignableUntil`, relaciones `comments`/`achievements`/`purchases`.
   - `task.entity.ts` no tenía: `assignedTo`, `collaborators`, relación `assignedUser`/`comments`.
   - `tasks.service.ts`/`tasks.controller.ts` tenían firmas de métodos desincronizadas (`completeTaskWithPenalty` vs `completeWithPenalty`) y mal uso de `NotificationType`.
   - `TasksModule` no importaba `NotificationsModule`.
   - → Se generaron y aplicaron los 4 archivos `.FINAL.ts` que están en este paquete.
6. **Error post-corrección:** al reiniciar con los entities `.FINAL.ts`, TypeORM (con `synchronize: true`) intentó alterar la tabla `tasks` de camelCase a snake_case y falló por `NOT NULL constraint` en `due_date` (había filas existentes sin ese valor). Se recomendó borrar y recrear la BD de desarrollo (sin problema porque eran datos de prueba). **No confirmado si se ejecutó.**
7. **Crash de laptop (esta sesión):** se perdió el entorno local. Esta sesión se dedicó a diagnosticar el historial completo y armar este paquete de recuperación + handoff.

---

## 5️⃣ ERRORES CONOCIDOS / LO QUE FUNCIONA Y LO QUE NO

### ❌ Errores ya resueltos (no repetir estos intentos):
- Migración de `item_id` a VARCHAR → **abandonada**, usar INTEGER.
- 30 errores de TypeScript por entities incompletas → resueltos con los archivos `.FINAL.ts`.
- Referencias a servicios/controladores eliminados (`shopDiscountService`, `ItemEffectsController`) → limpiado.
- `psql` no reconocido en PowerShell (Windows) → usar **pgAdmin** para restaurar/administrar la BD, no la terminal.

### ⚠️ Error sin confirmar resolución (verificar primero):
- `NOT NULL constraint` en `tasks.due_date` durante `synchronize: true` de TypeORM al migrar columnas camelCase → snake_case. La solución (borrar y recrear la BD de desarrollo) fue indicada pero nunca se confirmó su ejecución exitosa antes del crash.

### 🔴 Problema estructural NO resuelto — **requiere una decisión antes de escribir más código:**
Hay una **inconsistencia de estructura de carpetas** entre los archivos entregados en distintas sesiones:
- Los entities `user.entity.FINAL.ts` / `task.entity.FINAL.ts` (sesión "30 errores") importan con rutas planas: `import { Task } from './task.entity'` → sugiere que TODAS las entities viven juntas en algo como `src/entities/`.
- Los archivos `shop-item.entity.CORREGIDO.ts` / `inventory.service.CORREGIDO.ts` (sesión anterior) importan con rutas modulares: `import { UserInventory } from '../inventory/entities/user-inventory.entity'` → sugiere una estructura por módulo tipo `src/shop/entities/`, `src/inventory/entities/`.

**Estas dos convenciones nunca se probaron juntas compilando.** El próximo agente debe **elegir UNA estructura** (se recomienda la modular, que es el estándar de NestJS: `src/<módulo>/entities/<archivo>.entity.ts`) y ajustar los imports de TODOS los archivos entregados para que sean consistentes antes de intentar levantar el proyecto.

### 🟡 Riesgo a vigilar:
- `synchronize: true` en TypeORM es cómodo en desarrollo pero fue la causa raíz del error de `NOT NULL`. Si se vuelve a cambiar el esquema de una tabla con datos existentes, puede volver a fallar. Considerar migrar a `migrations` reales de TypeORM en vez de `synchronize` una vez que el modelo de datos se estabilice.
- El backup disponible (`backup_pre_migration.backup`) es **anterior** a los cambios de esquema (snake_case). Si se restaura tal cual y luego se aplican los entities `.FINAL.ts` con `synchronize: true`, es probable que **se repita el mismo error de `NOT NULL`**. Lo más seguro es partir de una base de datos **vacía** y dejar que TypeORM cree el esquema desde cero (los datos del backup son de prueba, no hay pérdida real de valor).

---

## 6️⃣ SIGUIENTES PASOS RECOMENDADOS

**Paso 0 — Alinear expectativas con Alim:**
- Confirmar que tiene Node.js y PostgreSQL instalados en la laptop nueva/reiniciada.
- Confirmar si prefiere reconstruir manualmente con ayuda de Claude en el chat, o delegarlo a **Claude Code** directamente sobre su máquina (recomendado dado el volumen de archivos).

**Paso 1 — Decidir y fijar la estructura de carpetas del backend** (ver sección 5, problema estructural). Documentarla una vez decidida para no volver a repetir el problema.

**Paso 2 — Reconstruir el proyecto backend desde cero** usando como base:
- La estructura general de `04_claude_code_prompts/` (carpetas, `package.json`, `main.ts`, `app.module.ts`, `.env`)
- Mas **NO** sus entities/services genéricos — reemplazar por los reales de `02_backend/`
- Completar los módulos que faltan con el mismo patrón (`achievements`, `notifications`, `comments`, `date-change-requests`, `auth`) — estos existen mencionados en el historial pero no hay versiones "FINAL" guardadas como archivo; hay que reconstruirlos siguiendo el mismo estilo de los que sí están completos.

**Paso 3 — Base de datos:**
- Crear una base de datos **vacía** nueva en PostgreSQL (vía pgAdmin).
- Dejar `synchronize: true` para que TypeORM genere el esquema desde cero con los entities ya corregidos (evita repetir el error `NOT NULL`).
- Opcional/más adelante: usar `backup_pre_migration.backup` solo como referencia de datos de prueba a re-cargar manualmente (no restaurarlo directo por el desfase de esquema).

**Paso 4 — Levantar backend y frontend, verificar compilación limpia** (`npm run start:dev` sin errores de TypeScript).

**Paso 5 — Conectar frontend a backend real:**
- El frontend (`App_Completa_Unificada__USAR_ESTE.tsx`) hoy funciona 100% con `localStorage` (sin backend). Falta el trabajo de reemplazar esos `useState`/`localStorage` por llamadas fetch/axios al backend NestJS. Esto es trabajo pendiente que aún no se ha empezado formalmente.
- Implementar JWT auth end-to-end (login real contra `/auth/login`).

**Paso 6 — Retomar roadmap de negocio** (en paralelo, no depende del backend):
- Seguir el plan de 14 días de outreach a Base1 Publicidad y Agencia Salvaje.
- Landing page + demo video.

---

## 📌 Resumen de una línea para el próximo agente:
> El frontend está intacto y es la fuente de verdad del modelo de datos. El backend tiene piezas correctas dispersas en el historial (ya consolidadas en este paquete) pero **nunca llegó a compilar y correr limpio de punta a punta**, y todo el entorno local se perdió en un crash de laptop. Antes de generar código nuevo, resolver la inconsistencia de estructura de carpetas (sección 5) y partir de una BD vacía.
