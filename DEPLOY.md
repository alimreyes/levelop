# Despliegue de prueba — Levelop (LVL UP!)

Decisión de hosting: `LVL-029` (01/09/26). Frontend estático en **Vercel**, backend NestJS y
Postgres en **Railway**, JWT propio. Este documento es el paso a paso para el primer
despliegue privado de prueba (16/09/26) y para repetirlo después.

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

Desde la carpeta raíz de este repo (`somoslevelop-main`), en PowerShell:

```
git init
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

1. En el proyecto de Railway donde ya vive el Postgres: **New → GitHub Repo** → elegir el
   repo recién subido.
2. En el servicio nuevo, **Settings → Root Directory**: `backend`. Railway lee
   `backend/railway.json` (build `npm ci && npm run build`, start `npm run start:prod`,
   healthcheck `/api/v1/health`).
3. **Variables**: copiar del `.env` local, con estos cambios:
   - `NODE_ENV=production`
   - `PORT`: no ponerla — Railway la inyecta.
   - `DATABASE_URL` y las cuatro `DB_ROLE_*_URL`: si el Postgres está en el mismo proyecto
     de Railway, usar la URL **interna** (`postgres.railway.internal`) en vez de la pública;
     es más rápida y no sale a internet. La contraseña y el nombre de la base son los mismos.
   - `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`: iguales al local.
   - `CORS_ORIGIN`: **vacía por ahora**; se llena en el paso 4 con el dominio de Vercel.
   - `DB_SSL`: no ponerla salvo que el deploy falle con *"The server does not support SSL
     connections"* (pasa con la URL interna de algunos Postgres de Railway). En ese caso,
     `DB_SSL=false`.
4. **Settings → Networking → Generate Domain**. Anotar el dominio
   (`algo.up.railway.app`). Probar en el navegador:
   `https://ALGO.up.railway.app/api/v1/health` → debe responder `{"ok":true,"db":"ok",...}`.

Las migraciones **no** se corren en Railway: la base es la misma que la local y ya están
aplicadas desde la máquina de Alim (`npm run migration:run`). Cada migración nueva se sigue
corriendo desde local antes de desplegar el código que la usa.

## Paso 3 — Frontend en Vercel

1. Editar `web/levelop-config.js`: reemplazar `PONER-DOMINIO-RAILWAY.up.railway.app` por el
   dominio real del paso 2. Commit y push.
2. Vercel (equipo *Alim Reyes' projects*) → **Add New → Project** → importar el repo → **Root Directory**: `web` →
   Framework: *Other* (estático, sin build) → Deploy. También se puede hacer desde el
   conector de Vercel del CTO (`create_git_project` con `rootDirectory: web`).
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

## Arreglo del 16/09/26 que bloqueaba el deploy

`backend/src/health.controller.ts` importaba `'../common/enums'` (ruta rota). `nest build`
fallaba con TS2307 → Railway no habría compilado. Corregido a `'./common/enums'`.
