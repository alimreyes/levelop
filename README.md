# Levelop! (LVL UP!)

Sistema de beneficios por desempeño para PyMEs venezolanas de 10 a 100 empleados. El trabajo se
organiza en misiones que dan XP y Oro. El Oro es puntaje de juego, no dinero, y se canjea por
beneficios no salariales que la empresa ya da: tiempo, comida, aliados. Esos beneficios tienen
cupos finitos. *"Tus beneficios ya existen. Levelop decide quién se los gana."*

**Estado (16/09/26): en vivo, en fase de pruebas.**

| | |
| :--- | :--- |
| Web + superficies | https://levelop-pi.vercel.app (Vercel, carpeta `web/`) |
| API | https://levelop-production.up.railway.app/api/v1 (Railway, carpeta `backend/`) |
| Repo | privado, `github.com/alimreyes/levelop`. Un push a `main` redespliega los dos |

## Qué hay en este repositorio

| Carpeta / archivo | Qué es |
| :--- | :--- |
| `backend/` | API NestJS + TypeORM + PostgreSQL. Empezar por [`backend/README.md`](./backend/README.md) |
| `web/` | Frontend desplegado: web pública con login único, más las 4 superficies en HTML y el cliente `levelop-api.js` |
| [`DEPLOY.md`](./DEPLOY.md) | Cómo se despliega (GitHub → Vercel + Railway), las rutas y la empresa de ejemplo |
| [`LEVELOP_CONTEXTO_COMPLETO.md`](./LEVELOP_CONTEXTO_COMPLETO.md) | Contexto de negocio, decisiones y research. Sirve de base de conocimiento para un Proyecto de Claude |
| `CoWork/` | ⚠️ **Copia antigua** del espacio de trabajo de los agentes (CEO, CFO, CTO, PD…). La versión viva está fuera de este repo, en `Levelop/CoWork/` |
| `Inspiración/` | Referencias visuales |

## Rutas del producto

| Ruta | Para quién |
| :--- | :--- |
| `/` | Web pública: **Agenda una demo** e **Iniciar sesión**. El login lleva a cada persona a su área según su rol |
| `/app` | Colaborador: misiones, Oro, tienda, ranking y avisos. También recibe las invitaciones: `/app?invitacion=TOKEN` |
| `/lider` | Líder de área |
| `/gerencia` | Gerencia y administrador de la empresa |
| `/levelop-interno/` | Solo el equipo Levelop (no se enlaza desde ningún lado) |

No hay registro abierto: Levelop da de alta la empresa, y la empresa invita a su gente.

## Probar con datos

```
cd backend
npm run demo:empresa -- --api=https://levelop-production.up.railway.app/api/v1
```

Arma **Café Andino C.A. (demo)**, con 18 personas y actividad real, y corre 34 verificaciones.
Todas las cuentas usan la contraseña `Demo2026!` (por ejemplo `mariana@cafeandino.test` en
gerencia, `carlos@cafeandino.test` como líder y `luisa@cafeandino.test` como colaboradora).

## Reglas que no se rompen

- **R-07:** ninguna superficie de gestión muestra datos que sirvan para señalar a una persona.
  Lo hace cumplir Postgres con cuatro roles, no el código.
- **R-03:** el juego siempre es opt-in. Quien lo apaga deja de ganar Oro.
- **El saldo de Oro es una suma de eventos, nunca una columna editable.**
- **Migraciones append-only:** se corren desde local (`npm run migration:run`) antes de publicar
  el código que las usa.
- **`.env` nunca se sube** (ni respaldos `*.backup` o `*.dump`).
