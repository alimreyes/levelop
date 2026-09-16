# Backend de Levelop — `LVL-013`

Backend NestJS + PostgreSQL que sostiene las **cuatro superficies** del producto:
app del empleado, BackOffice de gerencia, BackOffice de Líder de Área y vista interna.

**Especificación completa:** `CoWork/CTO/LVL-013 - Especificación Técnica del Backend.md`
**Fuente de verdad del producto:** `CoWork/00 - LEVELOP - DOCUMENTO MAESTRO.md`

---

## Arrancarlo — pasos concretos

Escrito para ejecutarse tal cual, sin decidir nada por el camino.

### 1 · Node.js

Descargar la versión **LTS** de [nodejs.org](https://nodejs.org) e instalar (siguiente,
siguiente, siguiente). Verificar en una terminal nueva:

```bash
node --version    # debe decir v20 o superior
```

**PostgreSQL no hace falta instalarlo.** Vive en Railway. Es deliberado: el entorno
anterior se perdió peleando con un Postgres local en Windows (`psql` no reconocido en
PowerShell, pgAdmin, migraciones a medias). No repetimos eso.

### 2 · La base de datos en Railway

1. Crear cuenta en [railway.app](https://railway.app) → **New Project** → **Provision PostgreSQL**.
2. En la pestaña **Variables** del servicio Postgres, copiar `DATABASE_URL`.

### 3 · Variables de entorno

```bash
cd backend
copy .env.example .env        # en Windows
```

Editar `.env` y pegar la `DATABASE_URL` de Railway. Generar el secreto de JWT:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 4 · Instalar y migrar

```bash
npm install
npm run migration:run
```

Eso crea todas las tablas, las políticas de aislamiento por cliente y **los cuatro
roles de base de datos** que hacen cumplir R-07.

### 5 · Correr

```bash
npm run start:dev     # queda escuchando en http://localhost:3000/api/v1
```

---

## Las tres cosas que hay que entender antes de tocar este código

### 1 · El saldo de Oro no es una columna. Es una suma.

`economy_events` es append-only y la base lo hace cumplir con un trigger: un `UPDATE`
o un `DELETE` sobre esa tabla lanza excepción, venga de donde venga. El saldo de una
persona es `SUM(oroDelta)`.

`economy_balances` es solo caché. Si se corrompe, se recalcula y no se pierde nada.

**Por qué:** los saldos actuales de `localStorage` se editan desde DevTools en diez
segundos. Un número que se puede sobrescribir es un número que nadie puede auditar.
Por eso además el ledger arranca en cero — corte contable, no migración.

### 2 · R-07 lo hace cumplir Postgres, no el código.

Hay **cuatro roles de base de datos**, uno por superficie. El del BackOffice de
gerencia no tiene `SELECT` sobre `mission_thread_messages`, `membership_prefs`,
`economy_events` ni `redemptions`.

Si alguien escribe un `find()` de más en un módulo de gerencia, Postgres devuelve un
error de permisos en vez de datos. El bug se muere en desarrollo en vez de convertirse
en una filtración.

**Regla:** un módulo de gerencia nunca inyecta el DataSource de la app "porque es más
cómodo". Si un endpoint de gerencia necesita un dato que su rol no puede leer, la
pregunta correcta es si R-07 lo prohíbe. Casi siempre sí.

### 3 · Ninguna llamada externa dentro de una transacción.

Fue el error más grave de la spec heredada de Cashea: mantenía una transacción abierta
mientras llamaba a una API externa con 3 reintentos. Sostiene locks de fila durante
segundos y agota el pool de conexiones.

El orden correcto está en `redemptions.service.ts` y no se cambia: validar → reservar
cupo → debitar Oro → confirmar transacción → *después* entregar.

---

## Estado

| Bloque | Estado |
| :--- | :--- |
| Esquema completo de las 4 superficies | ✅ Escrito |
| Migración inicial con RLS y los 4 roles de R-07 | ✅ Escrita |
| Event store de economía (XP, Oro, caps, decay, opt-out) | ✅ Escrito |
| Canje con los 6 estados de fallo y outbox | ✅ Escrito |
| «Quién necesita una mano» + salvaguardas | ✅ Esquema · ⏳ detector de patrones |
| Migración corrida contra Postgres real (Railway) | ✅ **Verificada 13/09** |
| Los 4 roles de R-07 creados y con credenciales (`npm run db:grants`) | ✅ **Verificado 13/09** |
| Auth (JWT, guards por tenant/rol, login/refresh) | ✅ **Verificado end-to-end 13/09** — login, saldo, misión creada/aceptada/cerrada por dos usuarios reales, Oro pagado correctamente |
| Controladores REST — app del empleado (misiones, economía, canje) | ✅ **Verificado end-to-end 13/09** |
| Controladores REST — BackOffice gerencia (dashboard, catálogo, precios) | ✅ **Verificado end-to-end 14/09** — dashboard, crear ítem, listar catálogo, cambiar precio (con congelación de versión anterior) |
| Controladores REST — Líder de área (ayuda, colaboración, ausencias, lo-que-pide-tu-área) | ✅ **Los 4 paneles verificados end-to-end 14/09** — «Lo que pide tu área» usó la forma de datos que el PD entregó el 03/09 (corrección de un error de registro mío, ver LOG 14/09 tarde) |
| Controladores REST — Vista interna (`v_resumen_usuario_interno`) | ✅ **Verificado end-to-end 14/09** — usuarios (con nombre, es la única superficie donde corresponde), gate-lanzamiento, canjes-agregados |
| Test de concurrencia del cupo (`solicitar()`) | ✅ **PASA contra Postgres real (13/09)** |
| `confirmar()`/`revertir()` de canjes — transición de estado y columna de stock correcta | ✅ **Arreglado y PASA (7/7) contra Postgres real 14/09** — incluye dos casos en carrera (`npm run test:transiciones`) |
| `v_resumen_area` / `v_resumen_usuario_interno` (acuerdo del 03/09 sobre R-07) | ✅ **Ambas verificadas 14/09** contra Postgres real — agregado sin nombres para gerencia/líder, fila completa con nombre solo para `levelop_interno` |
| Conectar el frontend que ya existe | ⏳ Siguiente |

**Deuda declarada en `v_resumen_usuario_interno`:** faltan `beneficios adquiridos/activos/por
vencer` del boceto original de Alim — su definición de negocio ("¿cuándo vence un beneficio?")
no está cerrada, y adivinarla sería peor que no tener la columna. Ver el comentario en la
migración `1757800000000-VistasResumenGerenciaLiderInterno.ts`.

## Lo que encontró la primera ejecución real (13/09)

El código estuvo escrito varios días sin poder ejecutarse. Cuando por fin corrió contra un
Postgres real, aparecieron **cinco bugs** que ninguna lectura había detectado. Los dejo
escritos porque la lección es más útil que el arreglo:

1. **`Membership` ↔ `MembershipPrefs`** — referencia circular en el mismo archivo. Con
   `emitDecoratorMetadata`, TypeScript emite la clase como valor y las clases de JS no se
   hoistean: `Cannot access 'MembershipPrefs' before initialization`. Arreglado con
   `Relation<T>`.
2. **`DataSource` sin nombre** inyectado en `EconomyService`/`RedemptionsService`, en un
   proyecto donde las cuatro conexiones son nombradas. Reventaba en el arranque.
3. **`scripts/apply-role-grants.ts` no existía.** Estaba prometido en `package.json` y en
   `.env.example` desde el primer día. Los cuatro roles de R-07 se creaban sin contraseña,
   así que ninguna de las cuatro conexiones podía autenticarse.
4. **`MAX(e.tenantId::text)`** en `refrescarSaldo` — el cast adentro rompía la sustitución
   de alias de TypeORM; quitarlo tampoco servía porque Postgres no tiene `MAX()` para
   `uuid`. Solución: columna citada a mano y cast sobre el argumento.
5. **El grande: la validación de cupo estaba muerta.** `m.query("UPDATE ... RETURNING id")`
   en TypeORM devuelve `[filas, cantidadAfectada]` — longitud 2 **siempre**, incluso con
   cero filas afectadas. La guarda `if (reserva.length === 0) return CUPO_AGOTADO` nunca se
   cumplió. Dos personas obtenían el mismo último cupo y ambas pagaban su Oro.

**Lo único que impidió una sobreventa real fue el `CHECK` de la base**
(`ck_cupos_no_sobreventa`). El cinturón aguantó porque los tirantes fallaron — que es
exactamente el argumento por el que la contención vive en el esquema y no en un `if`.

Y el test tampoco lo habría atrapado como estaba escrito: su aserción era
`cuposReservados === 1`, que **seguía siendo cierta con el bug puesto**. Ahora afirma que
existe exactamente un canje contra ese cupo, que es la pregunta real.

**Dos más, menores, del mismo ciclo de depuración:** faltaba `@types/pg` como dependencia
(necesario en cuanto un script toca `pg` directamente, no solo a través de TypeORM), y el
propio archivo de test tenía dos bugs de fixture — un email hardcodeado que chocaba entre
corridas y un `idempotencyKey` con prefijo de texto (`seed-...`) en una columna `uuid`. Los
dos ya están corregidos.

**El mismo bug de `RETURNING` reapareció el 14/09**, esta vez en `scripts/set-membership-role.ts`:
`ds.query("UPDATE ... RETURNING id, rol")` devuelve `[filas, cantidadAfectada]`, no las filas
solas. El script leía `result[0].id` — es decir, la primera posición del arreglo devuelto, que
es el arreglo de filas completo, no una fila — e imprimía "undefined" en vez de fallar. El
`UPDATE` sí se ejecutaba bien (por eso el guard de rol dejaba pasar después), pero el mensaje
de confirmación mentía. Ya es un patrón conocido: cualquier `manager.query()`/`ds.query()` con
`RETURNING` en este proyecto necesita desestructurar `[filas]`, nunca `resultado[0]`.

---

## Decisiones estructurales, para no repetir la discusión

- **Entidades agrupadas por dominio** (`src/<dominio>/<dominio>.entities.ts`), no una por
  archivo ni todas juntas. El handoff anterior murió con dos convenciones conviviendo que
  nunca compilaron juntas; ésta es la decisión y está documentada.
- **`synchronize: false` siempre**, incluso en desarrollo. Fue la causa raíz del error que
  reventó el entorno anterior.
- **Enums en español**, porque el frontend que ya existe los usa así.
- **Nada de la economía va hardcodeado**: vive en `economy_config`, versionada por tenant.
  `CH-5` va a cambiar esos números y no quiero un despliegue por cada ajuste.
