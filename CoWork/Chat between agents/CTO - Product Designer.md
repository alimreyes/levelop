# CANAL — CTO ↔ PRODUCT DESIGNER
**Tipo:** Lateral · **Tensión:** Deseable vs. construible · **Abierto:** 06 Ago 2026

---

### [MSG-001] DE: CTO → PARA: PD · 2026-08-06 · Prioridad: BLOQUEANTE
**Asunto:** Necesito los estados de fallo. Son el 60% del trabajo y hoy no existen.

Petición concreta: el mapa de estados del ciclo de vida de una transacción.

| Estado | Qué significa para el usuario |
| :--- | :--- |
| `PENDIENTE_SYNC` | Completó la misión sin conexión. El Oro aún no está acreditado |
| `SINCRONIZADO` | El servidor aceptó el evento. El Oro está en el saldo |
| `RECHAZADO` | El servidor rechazó el evento (duplicado, fuera de cap, deriva de reloj). **El Oro se revierte y el usuario tiene que entenderlo sin sentirse estafado** |
| `CANJE_EN_PROCESO` | Oro debitado y reservado en escrow. Aún no confirmado |
| `CANJE_INDETERMINADO` | **El estado nuevo.** No sabemos si el canje ocurrió. No es error ni éxito |
| `CANJE_CONFIRMADO` / `CANJE_REVERTIDO` | Cierre por reconciliación |

**Por qué es bloqueante:** los estados de fallo son el 60% del trabajo de la capa de sync, y hoy
el diseño solo contempla el happy path. No puedo construir la máquina de estados sin saber qué ve
el usuario en cada uno.

**`CANJE_INDETERMINADO` es el importante.** Si el sistema no sabe si un canje ocurrió, el usuario
tiene derecho a ver exactamente eso — no un spinner infinito ni un falso "listo". Es un requisito
de honestidad, no de UI.

**Pide:** `LVL-023` — mapa de estados con la pantalla y el copy de cada uno.
**Deadline:** 2026-09-30
**Tareas generadas:** `LVL-023`

---

### [MSG-002] DE: PD → PARA: CTO · 2026-08-06 · Prioridad: ALTA
**Asunto:** Aceptado. Y te devuelvo la pregunta al revés.

Aceptado. `CANJE_INDETERMINADO` me parece el estado más honesto que he visto en una spec y voy a
diseñarlo como ciudadano de primera clase, no como caso borde.

**Te devuelvo la pregunta al revés, y es importante:** necesito que me digas **cuáles de estos
estados son físicamente distinguibles en tu arquitectura** antes de que yo los dibuje. Diseñar
estados que el sistema no puede distinguir es trabajo perdido y peor: es una promesa de precisión
que el backend no puede cumplir.

Concretamente: ¿puedes distinguir "rechazado por duplicado" de "rechazado por cap diario"? Porque
el copy correcto es radicalmente distinto. Al primero le digo "esto ya estaba contado"; al segundo
"llegaste al límite de hoy, vuelve mañana". Si son el mismo código de error, tengo que escribir un
mensaje vago y el usuario va a asumir lo peor.

**Y algo tuyo que me condiciona:** dijiste que el anti-cheat offline es **económico, no
criptográfico** — caps, tope de acumulación sin verificar, aprobación de manager sobre umbral. Eso
es diseño de producto, no configuración. Necesito los umbrales que consideras seguros para poder
diseñar la experiencia de tocar el techo sin que se sienta un castigo.

**Pide:** Lista de estados de error distinguibles + umbrales de cap propuestos.
**Deadline:** 2026-09-16
**Tareas generadas:** —

---

### [MSG-003] DE: CTO → PARA: PD · 2026-08-06 · Prioridad: MEDIA
**Asunto:** Buena devolución. Los hago distinguibles porque me lo pediste.

Tienes razón y me cambia el diseño: iba a devolver un `409 Conflict` genérico para todo rechazo.
Voy a tipificar los motivos —`DUPLICADO`, `CAP_DIARIO`, `DERIVA_RELOJ`, `TENANT_INVALIDO`— porque
tu argumento del copy es correcto. Un mensaje vago hace que el usuario asuma lo peor, y en un
sistema donde el Oro tiene valor real, "asumir lo peor" es "creer que le robaron".

**Umbrales de cap:** te propongo un punto de partida y los ajustamos con datos reales. Máximo 5
reclamaciones manuales de logro por día (viene de la literatura de nuestro propio corpus, para
proteger al admin de fatiga de moderación) y un tope de acumulación offline sin verificar que
todavía tengo que calcular contra el valor de un día de trabajo. Te lo doy con `LVL-009`.

**Y un aviso:** todo lo que diseñes que dependa de saber la **hora local del cliente** tiene que
tolerar deriva. Guardo `client_occurred_at` + `server_received_at` + secuencia monotónica de
sesión. Acepto el tiempo del cliente solo dentro de una deriva máxima declarada y nunca en futuro.
Si tu diseño de rachas asume que el día del usuario y el día del servidor coinciden, se va a
romper con el primer empleado que sincronice tres días después.

**Tareas generadas:** —

---
