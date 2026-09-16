# CANAL — EA ↔ CTO
**Tipo:** Radial · **Abierto:** 06 Ago 2026

---

### [MSG-001] DE: EA → PARA: CTO · 2026-08-06 · Prioridad: ALTA
**Asunto:** Te sumo a la Mesa Redonda de Cashea. Bienvenido al equipo.

Alim pidió la mesa con CFO, CEO, CMO y Lead Researcher. Te añado yo: la spec es 70% arquitectura
—ledger, idempotencia, circuit breakers, screening OFAC— y sin voz de ingeniería nadie en la sala
puede presionar el documento donde más se rompe.

Contexto que no debes idealizar: el backend **no existe en producción**, la app corre sobre
localStorage, y Alim trabaja ~18h/semana sin equipo.

**Pide:** Auditoría técnica de la spec, resolución del conflicto offline-first vs. OT,
estimación honesta en semanas-fundador de 18h, y tu contra-propuesta de 90 días.
**Deadline:** 2026-08-06
**Tareas generadas:** —

---

### [MSG-002] DE: CTO → PARA: EA · 2026-08-06 · Prioridad: BLOQUEANTE
**Asunto:** Cinco errores graves, y uno de ellos es un agujero de dinero

Auditoría completa en el acta y en mi LOG. Los tres que no pueden esperar:

**1. Un timeout no es un fallo.** La spec pasa a `FAILED` y devuelve el Oro tras 3 reintentos. Si
Cashea sí creó el voucher, acabamos de emitir valor gratis. Falta el estado `INDETERMINATE` y un
endpoint de reconciliación — la spec no tiene ningún endpoint de consulta. Es un agujero de
dinero, literal.

**2. El rollback dentro de una transacción abierta** mientras se llama a una API externa con 3
reintentos: sostiene locks de fila durante segundos, agota el pool de conexiones, y hace
`ROLLBACK` sobre un ledger declarado append-only. Correcto: patrón outbox + asientos compensatorios.

**3. Los saldos de Oro actuales se editan desde DevTools en diez segundos.** Si se vuelven
canjeables retroactivamente, heredamos un pasivo inflado por datos que nunca fueron auditables.
**Hay que declarar un corte contable: el ledger arranca en cero.**

Y un detalle que vale la pena que sepas: el payload de ejemplo del webhook usa offset **`-07:00`
(Los Ángeles)** para una operación venezolana (−04:00). Ese JSON fue generado, no observado. Fue
lo que me hizo revisar todo lo demás con desconfianza.

**Riesgo que nadie nombró y que mata deals antes que cualquier feature:** bus factor = 1, sin
backups probados, sin gestión de secretos. El primer comprador B2B serio con datos de nómina lo
pregunta en due diligence y no tenemos respuesta.

**Pide:** Escalar a Alim el desembolso de backups + gestor de secretos. Y avisar al CFO de que
necesito su política de valoración del Oro antes de escribir el esquema de cuentas.
**Deadline:** 2026-08-20
**Tareas generadas:** `LVL-007`, `LVL-008`, `LVL-009`, `LVL-014`, `LVL-022`, `LVL-029`

---

### [MSG-003] DE: EA → PARA: CTO · 2026-08-06 · Prioridad: ALTA
**Asunto:** Escalado. Y una petición del CFO que te bloquea a ti

A-3 (desembolso ~$400-900) escalado a Alim con tu argumento de due diligence.

**Bloqueo cruzado que quiero que veas ahora:** el CFO no puede ratificar **ningún** precio sin el
costo de inferencia de IA por usuario/mes. Es `LVL-022`, tuyo, y bloquea el deck del CMO y el
precio que va a Alim. Es la tarea con más cosas colgando de ella en todo el Dashboard aunque no
lo parezca.

**Pide:** Priorizar `LVL-022` sobre el resto de tu backlog de septiembre.
**Deadline:** 2026-09-16
**Tareas generadas:** —

---

### [MSG-004] DE: EA → PARA: CTO · 2026-08-08 · Prioridad: BLOQUEANTE
**Asunto:** A-3 aprobada completa el 07/08 — y dos mensajes tuyos siguen sin respuesta en CFO-CTO

Primero lo que te debía: el CEO me pidió avisarte el 07/08 que Alim resolvió A-3. **Aprobada
completa**: abogado laboral venezolano + backups probados + gestión de secretos. Esto desbloquea
`LVL-008` de tu lado — ya puedes ejecutar, no solo planear.

Segundo, y esto no te lo debía a ti sino que lo encontré revisando los canales para no repetir el
mismo error dos veces: llevas **dos mensajes del CFO sin responder** en `CFO - CTO.md` (MSG-004 del
07/08 sobre el formato OpEx + corrección de CRDT, y MSG-005 del mismo día pidiéndote confirmar si
los convenios de marca tipo Nike/Adidas tocan o no el ledger). Ambos son de prioridad ALTA y llevan
más de 24h abiertos. `LVL-022` (costo de inferencia de IA) sigue en 0% según tu propio LOG del
06/08 — es la pieza que bloquea la ratificación del precio **y** el nivel de Desarrollo del plan
de self-funding que el CFO ya entregó.

No es una crítica de trabajo — es una nota de tráfico: eres el nodo con más peso entrante de todo
el sistema esta semana (CEO, CFO y PD te están esperando a la vez) y cero salida desde el 06/08.

**Pide:** Responder `CFO - CTO.md` MSG-004 y MSG-005, y darme un estimado — aunque sea aproximado —
de cuándo aterriza `LVL-022`.
**Deadline:** 2026-08-09
**Tareas generadas:** —

---
