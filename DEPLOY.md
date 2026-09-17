# Despliegue de prueba — Levelop (LVL UP!)

Decisión de hosting: `LVL-029` (01/09/26). Frontend estático en **Vercel**, backend NestJS y
Postgres en **Railway**, JWT propio. Este documento es el paso a paso para el primer
despliegue privado de prueba (16/09/26) y para repetirlo después.

## Estado: EN VIVO desde el 16/09/26 (noche)

| Pieza | Dónde |
| :--- | :--- |
| Repo | `github.com/alimreyes/levelop` (privado, rama `main`) |
| Web | https://levelop-pi.vercel.app, Vercel, proyecto `levelop`, Root `web` |
| API | https://levelop-production.up.railway.app/api/v1, Railway, Root `backend`, en el mismo proyecto que el Postgres |

**Publicar un cambio**, desde `somoslevelop-main` en PowerShell:

```
git add <archivos>
git commit -m "qué cambió"
git push
```

Vercel y Railway se redespliegan solos. Si el cambio trae una migración nueva, se corre **antes**
desde `backend` con `npm run migration:run`.

## Qué se despliega y desde dónde

| Pieza | Carpeta en este repo | Dónde corre |
| :--- | :--- | :--- |
| Backend (NestJS + TypeORM) | `backend/` | Railway, como servicio conectado al repo, root directory `backend` |
| Postgres | — | Railway (ya existe: es la misma base que se usa en local) |
| Frontend (web pública + 4 superficies + cliente API) | `web/` | Vercel, proyecto estático, root directory `web` |

`web/` es la copia canónica de despliegue del frontend. `CoWork/Product Designer/MVP/` sigue
siendo la carpeta de trabajo del Product Designer; cuando cambia una, se copia a la otra
(hoy lo hace el CTO al escribir cada cambio). La única diferencia entre local y producción
en el frontend es `web/levelop-config.js`: decide a qué backend hablar según el dominio desde
el que se abrió la página.

## Secretos: qué NO va al repositorio

`backend/.env` está en `.gitignore` y nunca se sube. Contiene `DATABASE_URL`, las cuatro URLs
de los roles de Postgres (`DB_ROLE_*_URL`) y `JWT_SECRET`. En Railway esas mismas variables
se cargan en el panel del servicio (Variables), copiando los valores del `.env` local. Si
alguna vez se sube un `.env` por error, hay que rotar `JWT_SECRET` y las contraseñas de los
cuatro roles (`npm run db:grants`), no solo borrar el archivo del historial.


## Rutas del frontend (17/09/26)

`web/vercel.json` define rutas limpias. Los `.html` siguen respondiendo igual (y abiertos como
archivo local todo sigue funcionando), pero los links que se comparten son estos:

| Ruta | Archivo | Quién |
| :--- | :--- | :--- |
| `/` | `index.html` | Web pública: qué es Levelop!, **Agenda una demo**, e **Iniciar sesión** (login único) |
| `/app` | `levelop-mvp.html` | Colaborador/empleado. Aquí aterrizan también los links de invitación: `/app?invitacion=TOKEN` |
| `/lider` | `levelop-lider.html` | Líder de área |
| `/gerencia` | `levelop-backoffice.html` | Gerencia y administrador de la empresa |
| `/levelop-interno/` | `levelop-interno.html` | Solo equipo Levelop. **No se enlaza desde ningún lado** |

El login de `/` pregunta al backend a qué empresa y con qué rol pertenece la persona
(`GET /auth/mis-membresias`) y la manda a su área. Líder y gerencia eligen entre su panel y la app
de misiones (también participan en misiones). Sin cuenta: aviso de que su empleador debe
invitarla + CTA de demo. Cerrar sesión en cualquier superficie vuelve a `/?entrar=1`.

Pendiente honesto: el formulario de demo abre un correo prellenado a `hola@levelop.app` (no hay
backend de leads). Confirmar que ese buzón existe o cambiar `DEMO_EMAIL` en `web/index.html`.

## Empresa de ejemplo — probar todo con datos reales

`backend/scripts/empresa-ejemplo.ts` arma **Café Andino C.A. (demo)**: 18 personas en 3 áreas
(que entran por su link de invitación), catálogo con cupos, ~25 misiones entre personas y entre
áreas, canjes (auto-confirmados, aprobados por el líder, revertidos por gerencia, cupo agotado,
saldo insuficiente), opt-out, ranking, señales de «quién necesita una mano» y una conversación del
líder. Al final imprime **34 verificaciones** (anti-cheat, tope diario, deriva de reloj, roles 403,
qué ve cada superficie) y las credenciales. Contraseña de todas las cuentas: `Demo2026!`.

```
cd backend
npm run demo:empresa                                              # contra el backend local
npm run demo:empresa -- --api=https://ALGO.up.railway.app/api/v1  # contra Railway
```

Usa `DATABASE_URL` del `.env` (la misma base local/Railway) para lo que todavía no tiene
endpoint: la empresa + su admin, los cupos, los colaboradores de misión y las señales de ayuda.
Todo lo demás pasa por la API real. Correrlo otra vez = «un día más» de actividad.
Probado el 16/09/26 contra un Postgres limpio con las 5 migraciones: 34/34 OK, y 30/30 en la
segunda corrida del mismo día.

## Paso 1 — Repositorio privado en GitHub

Desde la carpeta raíz de este repo (`somoslevelop-main`), en PowerShell. Las dos líneas de
`git config` evitan *"Filename too long"* por las rutas profundas de `CoWork/CTO/HANDOFF…` y los
avisos de fin de línea:

```
git init
git config core.longpaths true
git config core.autocrlf false
git add .
git status
```

Antes de seguir, revisar que `git status` NO liste `backend/.env`, `backend/node_modules` ni
`backend/dist`. Comprobación directa (no debe imprimir nada):

```
git ls-files --cached | Select-String -Pattern "\.env$|node_modules|dist/"
```

Si aparece algo, el `.gitignore` no se aplicó: parar y avisar.

```
git commit -m "Levelop: backend + web, primer despliegue de prueba"
```

Crear el repo privado en GitHub (web: New repository → Private → sin README) y luego:

```
git branch -M main
git remote add origin https://github.com/TU-USUARIO/levelop.git
git push -u origin main
```

## Paso 2 — Backend en Railway

1. **Abrir el proyecto de Railway donde ya vive el Postgres** (el del ícono del elefante), no uno
   nuevo. Un servicio creado en otro proyecto no ve la base y se cae con *"Falta la URL de
   conexion para el perfil app"*. En ese proyecto: **+ New → GitHub Repo** → `alimreyes/levelop`.
2. **Settings → Root Directory**: `backend`. Sin esto, Railpack mira la raíz del repo y falla con
   *"Railpack failed to prepare the build"*. Railway lee `backend/railway.json`:
   - builder `RAILPACK`
   - build `npm run build` (Railpack ya corre `npm ci`; repetirlo daba `EBUSY … node_modules/.cache`)
   - start `npm run start:prod` = `node dist/src/main` (el build deja `dist/src/`, porque
     `tsconfig` también incluye `scripts/`)
   - healthcheck `/api/v1/health`
3. **Variables → Raw Editor.** Railway puede ofrecer importar `.env.example`: **no usar esos
   valores**, son de plantilla (`usuario:password@host`). Pegar el `backend/.env` real y ajustar:
   - `NODE_ENV=production`
   - `PORT`: borrarla, Railway la inyecta.
   - `DATABASE_URL` y las cuatro `DB_ROLE_*_URL`: tal cual el `.env`. **Cada `DB_ROLE_*_URL` debe
     usar su propio usuario** (`levelop_app`, `levelop_backoffice`, `levelop_lider`,
     `levelop_interno`), no `postgres`. Con `postgres`, R-07 deja de estar garantizado por la base.
   - `JWT_SECRET`: puede ser el que genera Railway (`${{ secret(...) }}`). `JWT_EXPIRES_IN=15m`,
     `JWT_REFRESH_EXPIRES_IN=30d`.
   - `CORS_ORIGIN=https://levelop-pi.vercel.app`, sin barra final. Si hay varios orígenes, van
     separados por coma.
   - `DB_SSL`: solo si el deploy falla con *"The server does not support SSL connections"*
     (entonces `false`) o *"self-signed certificate"* (entonces `true`).
4. **Aplicar:** los cambios de variables quedan "staged". Hay que apretar **Deploy** en la barra
   morada ("Apply N changes") o no llegan al servicio.
5. **Settings → Networking → Generate Domain.** Probar
   `https://levelop-production.up.railway.app/api/v1/health`, que debe responder
   `{"ok":true,"db":"ok",...}`. La raíz `/` responde 404: es normal.

Si el deploy queda en **CRASHED**, no apretar Restart. Hay que abrir el deploy → **Deploy Logs**
y leer las últimas líneas rojas.

Las migraciones **no** se corren en Railway: la base es la misma que la local y ya están
aplicadas desde la máquina de Alim (`npm run migration:run`). Cada migración nueva se sigue
corriendo desde local antes de desplegar el código que la usa.

## Paso 3 — Frontend en Vercel

1. `web/levelop-config.js` ya apunta a `https://levelop-production.up.railway.app/api/v1`. Si el
   dominio de Railway cambia, se edita esa constante y se publica con commit + push.
2. Vercel (equipo *Alim Reyes' projects*) → **Add New → Project** → importar el repo → **Root Directory**: `web` →
   Framework: *Other* (estático, sin build) → Deploy. También se puede hacer desde el
   conector de Vercel del CTO (`create_git_project` con `rootDirectory: web`). **Nota 16/09:** el
   conector respondió 403 (sin permiso para crear proyectos); el proyecto se creó desde el panel.
3. Anotar el dominio (`levelop-xxx.vercel.app`).

## Paso 4 — Cerrar el círculo: CORS

En Railway, variable `CORS_ORIGIN` = `https://levelop-xxx.vercel.app` (sin barra final; si
hay varios orígenes, separados por coma). Railway redespliega solo al cambiar variables.
Sin esto, el navegador bloquea las llamadas del frontend al backend y se ve "No se pudo
conectar".

## Sobre "privado" en Vercel (plan Hobby)

- **Password Protection** no está disponible en Hobby (es de Pro).
- **Vercel Authentication** sí, pero obliga a que quien abra la página tenga cuenta de
  Vercel y sea miembro del equipo — inservible para invitar a gente de prueba con el link de
  invitación.
- Lo que sí hay: la URL no está indexada (`X-Robots-Tag: noindex`, `robots.txt`), no se
  publica en ningún lado, y **cada superficie exige sesión**: sin login no hay un solo dato
  visible. Es el mismo nivel de privacidad que un link de invitación.

## Verificar (nada cuenta hasta que esto pase de verdad)

1. `https://ALGO.up.railway.app/api/v1/health` → `ok: true`.
2. `https://levelop-xxx.vercel.app/` → abre el índice; abajo dice `Backend: https://ALGO.up.railway.app/api/v1 · entorno produccion`.
3. `/levelop-interno/` → login del equipo → crear empresa → abrir el link de invitación
   **en otro dispositivo o navegador** (esa es la prueba real: alguien que no es Alim, desde
   otra máquina, entrando por el link). El link ahora sale como `https://…/app?invitacion=…`.
4. `npm run demo:empresa -- --api=https://ALGO.up.railway.app/api/v1` → 34/34.
5. `https://levelop-xxx.vercel.app/` → **Iniciar sesión** con `mariana@cafeandino.test`,
   `carlos@cafeandino.test` y `luisa@cafeandino.test` (`Demo2026!`): cada una cae en su área.
   Un correo inventado → aviso de «contacta a tu empleador» + CTA de demo.

## Arreglos del 16/09/26 que bloqueaban el deploy

- `backend/src/health.controller.ts` importaba `'../common/enums'`, una ruta rota. `nest build`
  fallaba con TS2307. Se corrigió a `'./common/enums'`.
- `backend/railway.json`: builder `RAILPACK` y build sin el `npm ci` duplicado (que daba `EBUSY`).
- `start:prod` → `node dist/src/main`, y `nest-cli.json` con `entryFile: "src/main"`
  (antes daba *"Cannot find module '/app/dist/main'"*).
- `.gitignore`: `*.backup`, `*.dump` y `*.sql.gz`. Un respaldo viejo de la base quedó fuera del
  repo antes del primer push.

**Regla que sale de esto:** antes de publicar, correr lo mismo que corre la plataforma:
`npm run build` y `npm run start:prod`.
