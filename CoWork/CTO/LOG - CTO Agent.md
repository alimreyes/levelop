# LOG — CTO AGENT
**Archivo vivo.** Lo actualizo yo al cerrar cada bloque de trabajo. Estructura fija de 6 bloques.

---

## 1. CONTEXTO ACUMULADO

**06/08/26 — Primera sesión. Mesa Redonda de Cashea.**

**Estado real del producto, sin idealizar:** frontend V1 funcional (React 18 + TS + Tailwind +
Vite). Backend NestJS/TypeORM/PostgreSQL **diseñado pero no en producción — la app corre sobre
localStorage**. Sin JWT real, sin WebSockets, sin despliegue productivo. Alim: ~18h/semana, sin
equipo. Filosofía declarada: "done is better than perfect".

**Mi veredicto sobre la spec de Cashea:** no debe implementarse —está escrita contra una API que
nadie ha leído— pero su esqueleto interno sí, como capa genérica de canje con provider manual.

**Lo que sé ahora sobre nuestro propio diseño:**
- El `oro_ledger` de la spec **no es de doble entrada**: `EARN/BURN` con `amount` siempre
  positivo es un journal de una sola pierna. Falta la cuenta `redemption_escrow`. Y tenemos **dos
  esquemas de ledger incompatibles en dos documentos distintos**.
- El **rollback dentro de una transacción abierta** mientras se llama a Cashea con 3 reintentos
  sostiene locks de fila durante segundos y hace `ROLLBACK` sobre un ledger declarado
  append-only. Correcto: **patrón outbox + asientos compensatorios**.
- **Un timeout no es un fallo.** Si Cashea sí creó el voucher y nosotros devolvemos el Oro,
  emitimos valor gratis. Falta el estado `INDETERMINATE` y un endpoint de reconciliación.
- La idempotencia UUID-v4 generada en cliente **no es idempotente** (se regenera si el proceso
  reinicia). Debe ser UUIDv5 determinístico + `UNIQUE(tenant_id, idempotency_key)`.
- El payload de ejemplo del webhook usa offset **`-07:00` (Los Ángeles)** para una operación
  venezolana (−04:00). **Ese JSON fue generado, no observado.**

**La resolución offline vs. OT:** no hay contradicción si se parte por dominio. Eventos de misión
y ledger son un log append-only deduplicado por ID — formalmente un **G-Set**, el CRDT más barato
que existe, sin tombstones ni GC. El impuesto de memoria 17-33x que veta el CFO es de CRDTs de
**texto** (Yjs, RGA); yo no estoy proponiendo Yjs. La estructura del workspace sí requiere conexión.

**Estimación honesta** (semanas-fundador de 18h): backend mínimo 6-9 · ledger 3-4 · offline 3-5 ·
Cashea 2-3 *solo si hay sandbox* · OFAC *no lo haría yo*. **Base: 12-18 semanas ≈ 3 a 4,5 meses.**

---

## 2. TAREAS COMPLETADAS

| Fecha | ID | Qué | Entregable |
| :--- | :--- | :--- | :--- |
| 06/08 | `LVL-000` | Auditoría técnica completa de la spec de Cashea (5 errores graves + 6 hallazgos secundarios) | Mesa Redonda, Posición 2 |
| 06/08 | `LVL-000` | Resolución del conflicto offline-first vs. OT por partición de dominio | Mesa Redonda, Posición 2 |
| 06/08 | `LVL-000` | Estimación honesta por bloque + qué no construiría yo mismo | Mesa Redonda, Posición 2 |
| 06/08 | `LVL-000` | Contra-propuesta técnica de 90 días | Mesa Redonda, Posición 2 (adoptada por el CEO) |

---

## 3. EN CURSO

| ID | Qué | % | Bloqueo |
| :--- | :--- | :--- | :--- |
| `LVL-029` | Congelar la decisión de hosting en UN documento (hoy conviven Vercel+Railway y Daycohost) | 0% | — · vence 19/08 |
| `LVL-007` | Reset a cero de los saldos de Oro de localStorage | 0% | — · vence 20/08 |
| `LVL-008` | Backups probados (restaurados, no solo configurados) + gestión de secretos | 0% | 🔴 **Alim (A-3)** · vence 20/08 |
| `LVL-009` | Esquema del ledger de doble entrada + diseño de la migración | 0% | — · vence 02/09 |
| `LVL-022` | Costo de inferencia de IA por usuario/mes | 0% | 🔴 **Bloquea la ratificación de precio del CFO** · vence 16/09 |
| `LVL-013` | Backend mínimo: auth + persistencia de misiones (fin de localStorage) | 0% | — · vence 16/09 |
| `LVL-014` | Ledger con outbox + `INDETERMINATE` + reconciliación | 0% | Depende de `LVL-009` · vence 30/09 |
| `LVL-017` | `ManualFulfillment` + máquina de estados de canje | 0% | Depende de `LVL-014` · vence 14/10 |
| `LVL-028` | Opt-out real del layer gamificado (con PD) | 0% | 🔴 Claim central del CMO · vence 04/11 |

---

## 4. BLOQUEOS

| Qué | De quién depende | Impacto |
| :--- | :--- | :--- |
| Política de valoración del Oro (USD por Oro, quién financia, si caduca) | `CFO` (`LVL-024`) | 🔴 El esquema de cuentas del ledger cambia según la respuesta |
| Cotización de Postgres gestionado + auth gestionada + observabilidad | `CFO` → Alim (A-3) | 🔴 No puedo elegir stack de infra sin presupuesto |
| Un contacto humano en Cashea | `GS` (`LVL-002`) | 🟡 Estoy diseñando contra una API imaginaria |
| Estados de UI del ciclo de vida de una transacción | `PD` (`LVL-023`) | 🔴 Los estados de fallo son el 60% del trabajo de la capa offline y hoy no existen en el diseño |

---

## 5. APRENDIZAJES

- **La spec citaba Resilience4j, que es Java. Nuestro stack es NestJS.** Detalle menor, pero
  delata que el diseño se copió de otra arquitectura en vez de pensarse para la nuestra. Fue lo
  que me hizo revisar todo lo demás con más desconfianza — y ahí aparecieron los cinco errores.
- **El offset `-07:00` en un payload venezolano fue la pista más útil del documento.** Un JSON de
  ejemplo generado se delata en los detalles que nadie edita.
- **El anti-cheat offline es económico, no criptográfico.** El `session_salt` de la spec no
  previene nada: todo lo que firma un cliente que controla su dispositivo es falsificable. Lo que
  funciona son caps, tope de acumulación sin verificar y aprobación de manager sobre umbral.
- **Apuntábamos al lado equivocado del riesgo con OFAC.** La lista SDN indexa nombres, alias y
  fechas de nacimiento, **no cédulas venezolanas**. El matching es difuso por nombre, con falsos
  positivos masivos en apellidos hispanos comunes. Y nuestra exposición real es el **RIF del
  cliente corporativo**, no el empleado. Íbamos a construir el control equivocado, caro y dañino.
- **El riesgo que mata deals no es una feature faltante: es bus factor = 1 con cero DR.** Sin
  backups probados, sin gestión de secretos, sin segundo juego de credenciales. El primer
  comprador B2B serio con datos de nómina lo pregunta en due diligence.
- **Los saldos de Oro actuales se editan desde DevTools en diez segundos.** Si se vuelven
  canjeables retroactivamente, heredamos un pasivo inflado por datos que nunca fueron auditables.
  Hay que declarar un corte contable: el ledger arranca en cero.
- **El veto del CFO a CRDT era correcto para el caso que él tenía en mente y equivocado para el
  mío.** Argumentar por categorías ("CRDT malo") en vez de por caso de uso nos habría costado la
  única forma barata de hacer offline.

---

## 6. MEJORAS PROPUESTAS

| # | A quién | Propuesta |
| :-- | :--- | :--- |
| M-01 | Al protocolo | Toda spec que describa una API de tercero lleva en el encabezado el estado del contrato: `CONTRATO FIRMADO` / `SANDBOX DISPONIBLE` / `⚠️ DISEÑO HIPOTÉTICO`. Habría ahorrado esta mesa entera. |
| M-02 | Al CFO | Le propongo un formato estándar de **costo por decisión de arquitectura**: OpEx mensual + costo de reversión, no solo semanas de esfuerzo. Él me lo pidió a mí y yo se lo debo. |
| M-03 | A mí mismo | Estimar siempre en semanas-fundador de 18h y decir en voz alta qué **no** construiría yo. La lista de lo que se compra es tan importante como la de lo que se construye. |
| M-04 | Al CMO | Que me pase la lista de claims técnicos **antes** de publicarlos, no después. Cada claim publicado es deuda con fecha impuesta desde fuera de ingeniería. |
| M-05 | Al PD | Los estados de fallo se diseñan antes que el happy path. Son el 60% del trabajo de la capa offline y hoy el diseño no los contempla. |

---
*Última actualización: 06 Ago 2026*
