# 🎮 LVL UP! — Handoff: Sección Héroe / Inventario

> Documento de traspaso para el próximo agente. Chat de origen: **"[FRONTEND] LVL UP - Héroe"**.
> Última actualización: sesión del 07-ago-2026.

---

## 1️⃣ Objetivo del proyecto

**LVL UP!** es una plataforma SaaS de gamificación (estilo RPG) para gestión de tareas laborales. Convierte tareas diarias en "misiones" con XP, oro virtual, niveles, logros y leaderboards de equipo, para atacar el problema de desenganche laboral.

- **Founder & CEO:** Alim.
- **Mercado objetivo:** agencias/empresas tech pequeñas (10-30 empleados), Santiago de Chile (Base1 Publicidad y Marketing, Agencia Salvaje como beta candidatos).
- **Pricing:** normal $10-12/usuario/mes; "founder's deal" de lanzamiento a $4/usuario/mes (-60%).
- **Stack objetivo:** Frontend React + TypeScript + Tailwind; Backend NestJS + TypeORM + PostgreSQL + Docker; 32 endpoints en 5 módulos (auth, users, tasks, notifications, achievements, shop/inventory, comments, date-change-requests).

**Este chat en particular** se enfoca exclusivamente en el **frontend de la sección "Héroe"**, y específicamente en construir su sistema de **Inventario** — la pantalla donde el usuario ve, equipa y gestiona los ítems que compró en la Tienda, con vigencia temporal tipo "loadout de videojuego".

---

## 2️⃣ Status actual

✅ **Frontend V1 completo y funcional** (todo en React con estado local — sin backend conectado todavía).
✅ **Sección Héroe → Tab "Inventario" implementada end-to-end** en esta sesión, agregada sobre la base de `LVL_UP_-_App_Completa_Unificada.tsx` (la versión más avanzada de las 3 que existían en el proyecto).

Todo lo solicitado en el checklist original está implementado y verificado en el código:

| Ítem del checklist | Estado |
|---|---|
| Nueva tab "Inventario" en sección Héroe | ✅ |
| Grid de ítems comprados | ✅ |
| Card: icono grande | ✅ |
| Card: nombre | ✅ |
| Card: fecha de vencimiento | ✅ |
| Card: countdown en tiempo real | ✅ |
| Card: botón Equipar/Desequipar | ✅ |
| Card: indicador "EQUIPADO" | ✅ |
| Sección "Ítems Activos" arriba | ✅ |
| Indicador en header (🛡️ x2) | ✅ |
| Animación al equipar | ✅ |
| Notificación al expirar | ✅ |

**Backend: sigue sin implementarse en este chat.** El sistema usa `useState` local con datos de prueba (mock), tal como el resto de la app. No hay persistencia real ni conexión a API.

---

## 3️⃣ Archivos relevantes

### Archivos base del proyecto (contexto, solo lectura)
- `/mnt/project/LVL_UP_-_App_Completa_Unificada.tsx` — versión más completa/avanzada de las 3 (la que se usó como base para esta sesión).
- `/mnt/project/LVL_UP_-_Sistema_Unificado_de_Misiones.tsx` — versión anterior, todas las secciones.
- `/mnt/project/LVL_UP_-_Misiones_Mejoradas_con_Detalles.tsx` — versión enfocada solo en Misiones.

### Archivo entregable de esta sesión (el más actualizado)
- **`LVL_UP_Heroe_con_Inventario.tsx`** (1285 líneas) → **este es el archivo que el próximo agente debe usar como punto de partida.** Es `App Completa Unificada` + el sistema de Inventario agregado.
- `RESUMEN_INVENTARIO.md` — resumen funcional de lo construido (documentación de features, no de handoff).
- `HANDOFF_HEROE_INVENTARIO.md` — este mismo documento.

> ⚠️ Nota para el próximo agente: existe otro chat anterior ("Héroe/Perfil") donde se prototipó una primera versión del inventario con un mecanismo distinto (ítem **bloqueado** hasta que expira, sin poder desequipar antes de tiempo). **Esta sesión implementó el enfoque contrario: equipar/desequipar libremente en cualquier momento.** Ver punto 5 — es una decisión de producto pendiente de confirmar con Alim, no un bug.

---

## 4️⃣ Cambios y correcciones implementados en esta sesión

Partiendo de `App Completa Unificada.tsx`, se agregó:

1. **Sub-navegación en Héroe:** nuevo estado `heroSubTab` (`'profile'` | `'inventory'`) con pestañas "Perfil" / "Inventario" y badge de cantidad de ítems.
2. **Estado de compras del usuario:** `userPurchases` (array con `id`, `userId`, `itemId`, `purchasedAt`, `expiresAt`, `isActive`, `equipped`) — precargado con 3 ítems de prueba.
3. **Sistema de countdown en tiempo real:** `itemTimers` + función `calculateItemTimeRemaining(expiresAt)` (línea ~285) que recalcula cada segundo vía `useEffect` y devuelve `{ expired, text, color, warning, hours, minutes, seconds }`.
4. **Funciones de filtrado del inventario** (línea ~705-725):
   - `getInventoryItems()` — ítems no expirados.
   - `getActiveItems()` — ítems equipados.
   - `getExpiredItems()` — ítems vencidos.
5. **Lógica de equipar/desequipar:** `toggleEquipItem(purchaseId)` (línea ~726) — valida que no esté expirado, dispara animación, actualiza `equipped`/`isActive`, y genera notificación.
6. **Indicador de header:** `getActiveItemsCount()` y `getActiveItemsIcons()` (línea ~766-772) — muestra hasta 3 iconos + "+X", clickeable para ir directo al inventario.
7. **Animaciones CSS nuevas** (línea ~155-174): `equipPulse`, `unequipFade`, `countdownWarning`, inyectadas vía `<style>` dinámico como el resto de la app.
8. **Sistema de notificaciones automáticas:** tipos `item_equipped`, `item_unequipped`, `item_expired` — este último se dispara solo mediante un watcher que detecta expiración y desequipa automáticamente (evita duplicados con un check de `notifications`).
9. **Nuevos iconos importados de lucide-react:** `Package`, `Shield`, `Zap`.
10. **UI de estados vacíos/expirados:** mensaje + CTA a la Tienda cuando no hay ítems; sección separada en escala de grises para ítems vencidos.

Diff contra el archivo base: **562 líneas agregadas, ~713 líneas modificadas/reestructuradas** (principalmente por la inserción de la sección de Inventario dentro del render de Héroe).

---

## 5️⃣ Errores y puntos abiertos

**No se registraron bugs reportados por Alim durante esta sesión.** Verificación de sanidad del código (llaves y paréntesis balanceados) pasó correctamente sobre el archivo final.

Puntos que sí quedan abiertos y vale la pena que el próximo agente confirme con Alim:

- ⚠️ **Decisión de producto pendiente — "lock" vs. "toggle libre":** en un chat anterior ("Héroe/Perfil") se había definido que un ítem equipado debía quedar **bloqueado** (no cambiable) hasta que expirara su vigencia — ej. un arco de 12h no se puede reemplazar antes de esas 12h. La implementación de **esta** sesión permite equipar/desequipar libremente en cualquier momento, sin bloqueo. Hay que decidir cuál comportamiento es el definitivo antes de pasar esto a producción.
- 🔌 **Sin conexión a backend:** todo corre sobre `useState` con datos mock. Falta migrar `userPurchases` a la API real (el backend NestJS con los endpoints de `shop`/`inventory` ya está en el roadmap general del proyecto, pero no se tocó en este chat).
- 🔔 Las notificaciones de expiración (`item_expired`) son solo in-app (estado local `notifications`); no hay push notifications reales todavía (están en el roadmap de Fase 3 del proyecto general).
- 🧪 Los 3 ítems de prueba (`w2` Espada de Fuego, `a2` Casco del Sabio, `p1` Poción de Energía) son data hardcodeada solo para QA visual — hay que limpiarla o parametrizarla al conectar con backend real.

---

## 6️⃣ Siguientes pasos sugeridos

**Corto plazo (este chat / frontend):**
- [ ] Confirmar con Alim la regla de negocio: ¿bloqueo hasta expiración o toggle libre?
- [ ] Agregar categorías dentro del inventario (Armas / Armaduras / Pociones) para cuando haya muchos ítems.
- [ ] Historial de compras (no solo ítems activos/vigentes).
- [ ] Efectos visuales en la vista de Misiones cuando hay un ítem activo con bonus (ej. +25% XP), para que el beneficio se sienta reflejado fuera del inventario.

**Mediano plazo (integración):**
- [ ] Conectar `userPurchases` al backend real (endpoints de `shop`/`inventory` ya definidos en la arquitectura de 32 endpoints).
- [ ] Reemplazar el timer local por sincronización con `expiresAt` del servidor (evitar desfases de reloj cliente/servidor).
- [ ] Migrar notificación de expiración a WebSockets/push real (Fase 3 del roadmap general).

**General del proyecto (fuera de este chat):**
- [ ] Migración completa de localStorage → PostgreSQL vía NestJS/TypeORM.
- [ ] JWT auth real.
- [ ] Seguir el plan de 14 días de outreach a beta customers (Base1, Agencia Salvaje) en paralelo al desarrollo técnico.

---

## 📎 Credenciales de prueba (mock login)
```
Usuario: prueba
Contraseña: 123456789
```
