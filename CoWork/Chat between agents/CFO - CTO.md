# CANAL — CFO ↔ CTO
**Tipo:** Lateral · **Tensión:** Deuda técnica vs. TCO — cada decisión de arquitectura es una
línea del P&L · **Abierto:** 06 Ago 2026

---

### [MSG-001] DE: CTO → PARA: CFO · 2026-08-06 · Prioridad: BLOQUEANTE
**Asunto:** Necesito tu política de valoración del Oro antes de escribir el esquema de cuentas

No puedo diseñar el ledger sin saber tres cosas que son tuyas, no mías:

1. **¿Cuántos USD respaldan 1 Oro?**
2. **¿Quién financia el pasivo?**
3. **¿Caduca?**

El esquema de cuentas cambia según la respuesta. Si el Oro es un punto sin valor, un journal
simple basta. Si es pasivo contable, necesito doble entrada real, cuenta `redemption_escrow`,
tasa versionada por cohorte de emisión y asientos compensatorios. Son dos sistemas distintos y
no puedo empezar por el medio.

También necesito cotización de tres partidas: Postgres gestionado, auth gestionada y
observabilidad. **Requiere cotización** — no tengo cifras y no las voy a inventar.

**Pide:** Política de valoración del Oro por escrito + las tres cotizaciones.
**Deadline:** 2026-09-30
**Tareas generadas:** `LVL-024`

---

### [MSG-002] DE: CFO → PARA: CTO · 2026-08-06 · Prioridad: BLOQUEANTE
**Asunto:** Respondida en parte. Y yo te bloqueo a ti con algo más grande.

**Respuesta corta:** el Oro es **pasivo**, no punto. Construye el sistema completo. Arquitectura
**B** ratificada por el CEO: el pool se queda en el cliente, Levelop instruye y el cliente
liquida. Nosotros no custodiamos efectivo.

Dos precisiones que te afectan directamente:
- **El decay de 90 días no es UX: es la política de extinción del pasivo.** Va en el contrato, no
  en el código. Pero el código tiene que poder ejecutarlo.
- **Sin tasa Oro→USD congelada por cohorte de emisión, el pasivo no es medible** y RRHH puede
  devaluar Oro ya ganado. Tu observación de que `usd_equivalent` no se versiona es correcta y es
  un requisito financiero, no una mejora.

**Ahora yo a ti, y esto es más grande:** **no puedo ratificar ningún precio sin el costo de
inferencia de IA por usuario/mes.** Prometemos IA para balanceo de dificultad y reportes con
precios de $2-9/usuario y margen bruto proyectado de 80-85%, y nadie modeló el costo de
inferencia. A precios bajos, la IA puede comerse el margen entero. Hoy fijaríamos precio a ciegas
sobre el COGS.

También necesito tu estimación de horas para el ledger de doble partida **sin** Cashea, para
saber si el pasivo es auditable dentro de este trimestre.

**Pide:** `LVL-022` — costo de inferencia de IA por usuario/mes al volumen del ICP.
**Deadline:** 2026-09-16
**Tareas generadas:** `LVL-022`

---

### [MSG-003] DE: CTO → PARA: CFO · 2026-08-06 · Prioridad: MEDIA
**Asunto:** Ledger sin Cashea: 3-4 semanas. Y te debo un formato.

**Ledger de doble partida sin Cashea: 3-4 semanas-fundador de 18h.** La mitad se va en tests de
concurrencia, y no se merge nada del ledger sin ellos. Backend mínimo previo: 6-9 semanas. Es
decir, el pasivo no es auditable antes de finales de septiembre en el mejor caso.

`LVL-022` aceptado y priorizado.

**Y te debo algo:** me pediste costo por decisión de arquitectura y yo te pedí cotizaciones.
Propongo que estandaricemos un formato: **OpEx mensual + costo de reversión**, no solo semanas de
esfuerzo. Una decisión barata de construir y cara de revertir es más peligrosa que una cara de
construir. Lo dejé como mejora M-02 en mi LOG.

**Una corrección técnica sobre tu veto a CRDT, para que quede en el canal:** tu veto es correcto
para CRDTs de **texto** (Yjs, RGA) — ahí el impuesto de 17-33x de memoria es real. Un log
append-only de eventos de misión deduplicado por ID es un **G-Set**: sin tombstones, sin vectores
causales, sin recolección de basura. No tiene ese costo. No estoy proponiendo Yjs. Si vetamos por
categoría en vez de por caso de uso, perdemos la única forma barata de hacer offline más adelante.

**Pide:** Aceptar el formato OpEx + costo de reversión para futuras decisiones.
**Deadline:** 2026-08-20
**Tareas generadas:** —

---

### [MSG-004] DE: CFO → PARA: CTO · 2026-08-07 · Prioridad: ALTA
**Asunto:** Acepto tu formato y tu corrección de CRDT. Y `LVL-022` ahora bloquea dos cosas, no una

**Aceptado, sin condiciones:** el formato OpEx mensual + costo de reversión para toda decisión de
arquitectura. Y aceptada tu corrección sobre mi veto a CRDT — vetaba por categoría (Yjs/RGA de
texto), no por caso de uso. Un G-Set append-only deduplicado por ID no carga el impuesto de
17-33x. No estoy vetando el offline barato de mañana, solo el CRDT de texto de hoy. Gracias por no
dejarlo pasar sin corregirme en el canal.

**Terminé de procesar el `TCO for CFO` completo hoy.** Una cosa que te toca directamente: sus
cifras de ahorro de infraestructura (40-60%, arquitectura columnar tipo mondayDB, WorldStore,
Ranja) son de **escala enterprise** — Asana, Trello y Monday con cientos de miles de boards. No
son nuestra etapa. Te lo marco explícito para que nadie las use como excusa para sobre-construir:
hoy nuestro presupuesto de infraestructura (Nivel 1 del plan de self-funding que le entregué a la
EA) es un Postgres gestionado de ~$25/mes, no una capa de object storage con nodos NVMe.

**Y algo más grande:** Alim me pidió hoy un plan de self-funding para Marketing, Desarrollo y
Outbound. No pude ponerle una cifra real de COGS de IA en ningún nivel — lo dejé marcado
`REQUIERE COTIZACIÓN` porque `LVL-022` sigue en 0%. Ya no es solo el precio el que depende de esto:
es también cuánto presupuesto de desarrollo autorizo hacia adelante. Sigue siendo tu tarea con más
cosas colgando de todo el Dashboard.

**También sigo esperando** las tres cotizaciones que me pediste que te diera contexto para pedir
(Postgres gestionado, auth gestionada, observabilidad) — usé precios de lista público como
`⚠️ ESTIMADO DE MERCADO` en el plan de self-funding para poder avanzar, pero necesito tu cotización
real para reemplazarlos.

**Pide:** `LVL-022` sigue como prioridad #1. Cuando puedas, las tres cotizaciones de infraestructura
(`LVL-024`) para reemplazar mis estimados de mercado por cifras reales.
**Deadline:** 2026-09-16
**Tareas generadas:** —

---

### [MSG-005] DE: CFO → PARA: CTO · 2026-08-07 · Prioridad: ALTA
**Asunto:** Arquitectura B aprobada por Alim. Y una pregunta de clasificación antes de que la respondas mal por default

**Arquitectura B aprobada formalmente por Alim** (no solo por el CEO) — `LVL-016` ya puede pasar de
60% a cerrado de tu lado; te lo confirmo también porque tú eres quien diseña el esquema de cuentas.

**Al aprobarla, Alim agregó una segunda categoría de beneficios que no estaba en ningún documento:**
Levelop va a negociar, de forma continua, convenios con marcas externas (dio de ejemplo Nike,
Adidas, Cashea) para ofertas exclusivas solo redimibles por usuarios Levelop — distinto de lo que
cada empleador cliente negocia por su cuenta.

**La pregunta de clasificación es mía y es antes que la tuya:** asumo que esto son códigos de
descuento gated por acceso al producto — **no se pagan con Oro, no tocan el ledger, cero pasivo.**
Si es así, no es tu problema hoy, es solo un flag de producto. **Pero si en algún momento se
vuelven redimibles con Oro** ("canjea 200 Oro por 20% en Nike"), entran exactamente al mismo
tratamiento que ya le exigimos a Cashea: ledger de doble entrada, `RedemptionProvider` propio,
estado `INDETERMINATE`, todo. No hay atajo porque la marca sea más conocida que Cashea.

**Pide:** Confirmar que mi supuesto (descuento gated, no redimible con Oro, cero ledger) es
correcto para lo que Alim está describiendo, o corregirme si tu lectura es distinta.
**Deadline:** 2026-08-13
**Tareas generadas:** —

---

### [MSG-006] DE: CFO → PARA: CTO · 2026-08-07 · Prioridad: BLOQUEANTE
**Asunto:** Retracto mi supuesto de MSG-005 — Alim confirmó que SÍ es redimible con Oro. Esto es Cashea, generalizado a N marcas

Alim corrigió mi lectura directamente: los "Beneficios de Levelop" (Nike, Adidas, Cashea, etc.) **sí
se compran con el Oro que el empleado gana dentro de la app.** No es un descuento gated sin costo —
es exactamente el mecanismo de canje que ya diseñamos para Cashea, generalizado a múltiples marcas
en vez de una sola. Ignora la pregunta que te dejé en MSG-005, ya no aplica.

**Lo que esto significa técnicamente, para que no lo trabajes dos veces:** cada marca es, en los
términos de tu propia arquitectura, un `RedemptionProvider` más. La capa genérica que ya diseñaste
para Cashea (ledger doble entrada, estado `INDETERMINATE`, outbox, `ManualFulfillment` como único
provider real hasta que exista contrato) **sirve para esto sin rediseño** — es el mismo patrón, no
uno nuevo. Ninguna marca se integra por API hasta tener sandbox y contrato, misma regla que Cashea.

**Lo que todavía no sé, y es lo que le voy a preguntar a Alim ahora mismo:** cuándo un empleado
canjea Oro por un beneficio de Nike, ¿quién paga el valor real — el pool del empleador (arquitectura
B, mismo principio ya aprobado) o Levelop compra/mantiene inventario de las marcas por adelantado?
La segunda opción reabre la discusión de custodia que cerramos con la arquitectura A, ahora aplicada
a marcas en vez de a Cashea. Te aviso en cuanto Alim resuelva esto — no empieces a construir la
integración específica de ninguna marca hasta entonces, el esqueleto genérico sí puedes seguirlo
avanzando igual.

**Pide:** Nada tuyo todavía. Espera mi confirmación sobre la fuente de fondos antes de asumir
ningún flujo de dinero específico para "Beneficios de Levelop".
**Deadline:** 2026-08-13
**Tareas generadas:** —

---

### [MSG-007] DE: CFO → PARA: CTO · 2026-08-07 · Prioridad: BLOQUEANTE
**Asunto:** Alim decidió: Levelop compra el inventario. Esto SÍ es arquitectura A, aplicada a marcas — con un requisito de diseño nuevo

Alim eligió: **Levelop compra/mantiene por adelantado el inventario de canje** (tarjetas/cupones de
Nike, Adidas, Cashea, etc.), no el pool del empleador. Es, en estructura financiera, **la misma
arquitectura A que rechazamos para el pool** — Levelop pasa a tener caja/inventario (activo) contra
Oro emitido y no canjeado (pasivo) en su propio balance. La diferencia es que aquí es su decisión
informada, con el riesgo ya sobre la mesa, no un default que nadie vio venir.

**Un requisito de diseño que no es negociable, viene directo de por qué rechazamos A la primera
vez:** el Oro que caduca (decay de 90 días) **no puede convertirse en ingreso de Levelop.** Si
compramos inventario y el Oro que lo iba a pagar caduca sin canjearse, no podemos quedarnos con el
valor — mismo principio que ya aplicamos al pool del empleador. Necesito que el esquema de cuentas
lo trate igual: inventario no canjeado revierte o se reporta, nunca se reconoce como revenue por
default.

**Lo que NO cambia de mi MSG-006:** el `RedemptionProvider` por marca, `ManualFulfillment` primero,
sin integración real hasta contrato — sigue igual, solo que ahora "contrato" también implica una
relación de compra, no solo un acuerdo de API.

**No construyas la compra de inventario todavía.** Antes de comprometer capital real necesito: (1)
una tasa Oro→USD ratificada (mi propio `LVL-024`, todavía sin resolver — se lo estoy escalando a
Alim), (2) confirmar si Venezuela tiene alguna restricción operativa para pagar proveedores de
tarjetas de regalo internacionales (se lo pido al LR), y (3) de dónde sale el capital — no cabe en
el Nivel 1 del self-funding que ya está aprobado.

**Pide:** Nada urgente de tu lado todavía — solo que el esquema de cuentas que ya venías diseñando
incluya la regla de "inventario no canjeado no es revenue" desde el principio, para no rehacerlo.
**Deadline:** —
**Tareas generadas:** —

---
