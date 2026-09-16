# LOG — CFO AGENT
**Archivo vivo.** Lo actualizo yo al cerrar cada bloque de trabajo. Estructura fija de 6 bloques.

---

## 1. CONTEXTO ACUMULADO

**07/08/26 — Segunda sesión. A-2 resuelto, Contexto auditado, y primer Plan de Self-Funding.**

Alim me buscó directamente (no por el canal EA) para tres cosas: cerrar el punto de pricing que
había quedado con el CEO, procesar formalmente la carpeta `CFO/Contexto`, y construir un plan de
autofinanciamiento por niveles para Marketing, Desarrollo y Outbound — Levelop no está ni va a
estar por ahora en ningún programa de financiamiento externo, y no lo va a estar mientras la tesis
de Venezuela no esté probada con evidencia de las 20 entrevistas.

**Sobre A-2:** vi la resolución de Alim en `EA - CEO.md` (MSG-005) antes de que llegara por mi
propio canal radial con la EA. Confirmado: **$79/mes, 15 asientos + $4/asiento adicional** es el
precio de trabajo desde hoy — exactamente lo que propuse. Sigue sin ser precio **ratificado**: esa
distinción es mía y la sostengo hasta que `LVL-022` (costo de inferencia de IA/usuario/mes, del
CTO) aterrice. Lo dejé escrito en `CEO - CFO.md` MSG-004.

**Sobre el Contexto:** el `TCO for CFO` no contradice ninguna posición vigente — de hecho es la
fuente original del ledger de doble entrada, el decay de 90 días y el veto a CRDT de texto que ya
estaban en mis posiciones. Lo nuevo que extraje: sus cifras de ahorro de infraestructura (40-60%,
arquitectura columnar) son de **escala enterprise** (Asana/Monday/Trello con cientos de miles de
boards) y no aplican a nuestra etapa — se lo marqué al CTO explícitamente para que nadie las use
como excusa para sobre-construir. El `ROI Pricing Model` original (xlsx + 2 CSV) quedó marcado
formalmente como **superado** con una nota nueva en la propia carpeta — no lo borré, es evidencia
de cómo se encontró y corrigió el error.

**Sobre el Plan de Self-Funding** (`CFO/LEVELOP_Plan de Self-Funding - Niveles.md`): 4 niveles, de
$0 a variable-por-MRR, con origen marcado en cada línea. Mi propia regla de "toda cifra lleva su
origen" aplicada a mi propio presupuesto, no solo al del cliente — y la mayoría de mis cifras de
infraestructura terminaron marcadas `⚠️ ESTIMADO DE MERCADO`, porque el CTO todavía no me ha dado
cotización real. Recomendación: Nivel 1 ($120-180/mes) desde hoy; Nivel 2 solo con evidencia de
`D-5`, no por calendario. Incluye un apéndice de investigación sobre financiamiento externo futuro
(aceleradoras y fondos regionales de LatAm, revenue-based financing) — no es acción de esta ronda,
es la puerta documentada para cuando el timing sea mejor.

**Un gap que encontré revisando mi propia autoridad:** mi BRIEF exige sign-off de **Alim** para
cualquier arquitectura de custodia de dinero. La arquitectura B del pool la cerró el CEO como
decisión interna, y no apareció como punto explícito en el paquete A-1 a A-5 que se escaló. Un
acuerdo del CEO no es automáticamente la firma que mi rol específicamente requiere de Alim. Se lo
señalé a la EA para que decida si esto necesita su propia línea de escalamiento.

**Mismo día, respuesta de Alim:** confirmó **Nivel 1** del self-funding. Y devolvió el precio con
una objeción de mercado, no de números: **$79 le parece elevado para PyMEs venezolanas**, pidió
evaluar **$50/mes por 10 asientos + $4/asiento extra**, más promos trimestral ($100/3 meses),
semestral y anual. Reevalué la tabla completa — el resultado, importante: **el recorte no le pega
igual a todos los tamaños.** A 10-15 empleados (el extremo del ICP donde GS más necesita bajar la
barrera) el precio cae 21-37%. A 50-100 empleados cae apenas 2-4%, porque el modelo anterior
regalaba 15 asientos en el mínimo y el nuevo cobra por asiento real desde el décimo. Es decir: se
puede bajar la barrera de entrada sin resignar casi nada en las cuentas grandes. Se lo mandé al CEO
para su sign-off (precio público final es de Alim + CEO) y avisé a CMO y GS que no publiquen ni
$79 ni $50 como definitivo todavía.

**Corrección crítica, mismo día:** le dije a CTO/EA/CEO que asumía que los "Beneficios de Levelop"
(Nike, Adidas, Cashea) eran descuentos gated sin costo real. Alim corrigió: **el Oro ganado en la
app SÍ se usa para comprar esos beneficios** — es el mecanismo de Cashea, generalizado a N marcas.
Y al preguntarle quién financia el canje (pregunté vía `AskUserQuestion`, con mi recomendación de
que pagara el pool del empleador para no reabrir la discusión de custodia), **eligió lo contrario:
Levelop compra/mantiene inventario de canje por adelantado.** Es, en estructura financiera, la
misma arquitectura A que ya rechazamos para el pool — ahora con su sign-off explícito, no como
default oculto. Retracté mi supuesto en los tres canales donde lo había dejado escrito antes de que
nadie construyera sobre él.

**Lo que esto activa:** (1) mi propia tarea pendiente `LVL-024` (tasa Oro→USD) pasa de "chokehold
técnico" a "bloquea el tamaño real del capital que Alim tiene que comprometer" — se lo escalé al
CEO como decisión de capital, no de secuencia; (2) un requisito de diseño no negociable para el
CTO: inventario de marca no canjeado (Oro caducado) nunca se reconoce como ingreso de Levelop,
mismo principio que ya aplicamos al pool; (3) le sugerí al CEO evaluar un agregador de recompensas
(tipo Tango Card/BHN Rewards, Tremendous) en vez de negociar marca por marca, para no convertir
"mes a mes conseguir convenios" en un trabajo de BD imposible para un fundador solo — con la
salvedad de que no verifiqué si estos servicios operan con entidades venezolanas, se lo dejé como
pregunta al LR.

**También aclaré una confusión de Alim:** preguntó si el self-funding significa que los fondos
"serán mes a mes brindados por él, no prefondeados ni pensando en fondear con empresas externas."
Sí, eso es exacto para el **self-funding de la operación de Levelop** (Nivel 1: su propia caja,
mes a mes, sin inversión externa). Pero es un tema distinto de la **arquitectura B del pool de
Oro**, que es sobre el dinero del **cliente** (el empleador paga sus propias recompensas, Levelop
nunca lo custodia) — ninguna de las dos cosas involucra prefondeo de Levelop ni capital externo,
pero son dos cajas distintas y no quiero que se mezclen en ningún documento.

---

**06/08/26 — Mesa Redonda de Cashea.**

Mi material de partida era el `ROI Pricing Model` (xlsx + 2 CSV) y el `TCO for CFO`. Después de
la mesa, lo que sé:

**El Oro no es un feature: es un pasivo.** Mientras solo compra Intrarrecompensas (tiempo), es
una obligación en especie del cliente empleador y Levelop no tiene nada en su balance. En el
segundo en que se canjea por valor en USD, pasa a ser **valor almacenado con contrapartida en
efectivo**, y la pregunta deja de ser de producto y pasa a ser: **¿quién custodia el efectivo?**

- **Arquitectura A** (pool prefondeado en cuenta de Levelop): nos convierte en custodio de dinero
  de terceros en un corredor sancionado. No somos SaaS, somos cuasi-emisor. **Rechazada.**
- **Arquitectura B** (el pool se queda en el cliente; Levelop instruye, el cliente liquida): el
  pasivo se queda donde nace. Software puro. **Recomendada sin matices, ratificada por el CEO.**

**Sobre el breakage:** bajo A, el Oro caducado se convertiría en ingreso de Levelop — **ganamos
cuando el empleado no cobra**. Ese incentivo destruye la tesis del producto.

**Dos decisiones que parecían técnicas y son mías:** el decay de 90 días es la política de
extinción del pasivo (va en el contrato, no en el código); y sin **tasa Oro→USD congelada por
cohorte de emisión**, el pasivo no es medible y RRHH puede devaluar Oro ya ganado.

---

## 2. TAREAS COMPLETADAS

| Fecha | ID | Qué | Entregable |
| :--- | :--- | :--- | :--- |
| 06/08 | `LVL-000` | Modelo de ROI reconstruido en 3 escenarios con origen de cada input | Mesa Redonda, Posición 3 |
| 06/08 | `LVL-000` | Doctrina del Oro como pasivo + arquitecturas A/B del pool | Mesa Redonda, Posición 3 |
| 06/08 | `LVL-000` | Propuesta de precio único ($79/15 asientos + $4/asiento) | Mesa Redonda, Posición 3 |
| 06/08 | `LVL-000` | Inventario de líneas de costo ausentes de todo modelo | Mesa Redonda, Posición 3 |
| 07/08 | — | Respuesta formal a A-2 en el canal CEO-CFO, condiciones reiteradas | `CEO - CFO.md` MSG-004 |
| 07/08 | — | Auditoría de `CFO/Contexto`, nota de estado sobre el modelo de ROI original | `CFO/Contexto/LEVELOP_ROI Pricing Model - ESTADO ACTUALIZADO.md` |
| 07/08 | — | Plan de Self-Funding por niveles (Marketing, Desarrollo, Outbound) + apéndice de financiamiento externo futuro | `CFO/LEVELOP_Plan de Self-Funding - Niveles.md` |
| 07/08 | — | Reporte a EA + avisos a CTO, CMO y GS sobre implicaciones del plan | `EA - CFO.md`, `CFO - CTO.md`, `CFO - CMO.md`, `Growth & Sales - CFO.md` MSG-004 |

**El modelo revisado (50 empleados, hora base $1,38):**

| | Conservador | Base | Optimista |
| :--- | :--- | :--- | :--- |
| Beneficio anual total | $1.288 | $3.816 | $9.410 |
| Costo suscripción | $2.628 | $2.628 | $2.628 |
| **ROI / Payback** | **−51% / nunca** | **+45% / 8,3 meses** | **+258% / 3,4 meses** |

---

## 3. EN CURSO

| ID | Qué | % | Bloqueo |
| :--- | :--- | :--- | :--- |
| `LVL-021` | Calculadora de ROI pública y editable con supuestos visibles | 20% | — · vence 16/09 |
| `LVL-016` | Ratificación por escrito de la arquitectura B del pool | 60% | 🟡 El CEO la cerró como decisión interna; falta la firma explícita de **Alim** que mi propia autoridad exige para custodia de dinero — no apareció como línea propia en A-1..A-5 · vence 30/09 |
| `LVL-015` | Dictamen de abogado laboral venezolano (LOTTT / Intrarrecompensas) | 0% | 🟢 Desbloqueado — A-3 **aprobado completo** por Alim el 07/08. Pendiente ejecutar (contratar al abogado) · vence 30/09 |
| `LVL-024` | Reglas de gobernanza del pool, con PD | 0% | — · vence 30/09 |
| — | Plan de Self-Funding — Nivel 1 confirmado por Alim (07/08) | 100% | — |
| — | Precio $50/10+$4 + promos trimestral/semestral confirmado por Alim (07/08) | 100% | — |
| — | Arquitectura B aprobada formalmente por Alim; `LVL-016` listo para cerrar del lado del CTO | 100% de mi parte | Esperando que el CTO lo marque cerrado en su LOG |
| — | Comunicación de "Beneficios del empleador vs. Beneficios de Levelop" a EA/CEO/CTO/CMO/GS | 100% comunicado | Esperando decisión de secuencia del CEO |

---

## 4. BLOQUEOS

| Qué | De quién depende | Impacto |
| :--- | :--- | :--- |
| **No puedo ratificar ningún precio sin el costo de inferencia de IA por usuario/mes** | `CTO` (`LVL-022`) | 🔴 Hoy fijaríamos precio a ciegas sobre el COGS — y ahora también bloquea el nivel de Desarrollo del Plan de Self-Funding |
| ~~Firma explícita de Alim sobre la arquitectura B del pool~~ | — | 🟢 **Resuelto 07/08** — Alim la aprobó directamente en este chat. `LVL-016` puede cerrarse. |
| **Tasa Oro→USD (`LVL-024`)** | Yo mismo, sin fecha fija | 🔴 Subió de prioridad: ahora también determina el capital real que Levelop debe comprometer para prefinanciar inventario de marcas. No lo puedo estimar sin inventar un monto. |
| Tamaño del capital para prefinanciar inventario de marcas | Yo (depende de `LVL-024`) → Alim (decide si lo aporta) | 🔴 Decisión de capital, no de secuencia. No cabe en el Nivel 1 de self-funding aprobado. |
| ¿Restricciones operativas de Venezuela para pagar proveedores internacionales de gift cards? | `LR` | 🟡 Mismo tipo de riesgo que ya encareció la arquitectura A del pool — sin confirmar todavía |
| Tres cotizaciones reales de infraestructura (Postgres, auth, observabilidad) | `CTO` (`LVL-024`) | 🟡 Uso `⚠️ ESTIMADO DE MERCADO` en el Plan de Self-Funding hasta tenerlas |
| Rotación real y costo por contratación en PyMEs venezolanas | `LR` (`LVL-025`) | 🟡 Tres inputs del modelo siguen marcados ⚠️ y no puedo llevar supuestos a un comité de compras |

---

## 5. APRENDIZAJES

- **Encontré un error propio que el Lead Researcher no vio, y era el peor.** La línea de "ahorro
  fiscal" de $4.200 es en gran medida **ficticia en Venezuela**: nuestro propio playbook dice que
  la compensación real ya se paga vía bonos no salariales exentos (Bono de Guerra + Cestaticket).
  Estábamos por vender un ahorro del 35% sobre dinero que el cliente ya paga exento. Retiré la
  celda "Grounded in Rigorous LatAm Case Studies ✅ Verified": no estaba verificada por nada.
- **Un precio que solo cierra en el escenario optimista no es un precio, es una apuesta.** A
  $8/usuario, el caso solo funcionaba con los supuestos más generosos de los tres escenarios.
- **Usé $2,19/hora cuando nuestro propio playbook dice $240/mes de ingreso integrado.** El valor
  hora real es $1,38. Un 59% de sobreestimación en el input que multiplica el 78% del beneficio.
- **El costo real por empleado no es $8: es $28.** ($8 licencia + $20 de pool.) El pool es 2,5x
  la suscripción y es dinero real del cliente. Vender $8 y descubrir el pool en la mesa de cierre
  mata deals — y me habría obligado a descontar la suscripción para salvarlos.
- **Vetar la construcción de algo que apruebo en diseño es una posición legítima**, y me costó
  llegar a ella. La spec de Cashea está bien pensada y es prematura. Las dos cosas son ciertas.
- **Una decisión que el CEO cierra internamente no siempre cubre el sign-off que mi propio rol
  exige de Alim.** Encontré el gap yo mismo revisando mi propia tabla de autoridad, no porque
  alguien me lo señalara. Si no la hubiera cruzado, habría dado la arquitectura B por firmada sin
  estarlo — el tipo de error que un CFO cliente escéptico sí encontraría.
- **Le exijo "requiere cotización" al modelo de un cliente y me costó aceptarlo en el mío propio.**
  Construir el Plan de Self-Funding me obligó a marcar mis propias cifras de infraestructura como
  `⚠️ ESTIMADO DE MERCADO` en vez de tratarlas como definitivas — la misma disciplina que le exijo
  al modelo de ROI, aplicada hacia adentro por primera vez.
- **Un documento de contexto puede mezclar lo que aplica hoy con lo que aplica a otra escala.** El
  TCO doc tiene recomendaciones correctas para nuestra etapa (ledger, decay, CRDT) mezcladas con
  benchmarks de escala enterprise (Asana, Monday) que, sin marcarlos, habrían empujado al CTO a
  sobre-construir infraestructura para una empresa con cero clientes.
- **Preguntar antes de asumir me salvó de construir sobre un supuesto falso — pero el supuesto ya
  había salido por tres canales antes de que Alim lo corrigiera.** Usé la pregunta estructurada en
  vez de declarar "esto es así" cuando la arquitectura de "Beneficios de Levelop" era ambigua, y
  eso evitó que el CTO empezara a diseñar sobre una premisa incorrecta. Pero mi primer mensaje
  (con el supuesto equivocado, aunque marcado como supuesto) ya estaba en tres chats. Aprendizaje:
  cuando un supuesto mío es financieramente material, esperar la confirmación antes de escribirlo
  en ningún canal — no solo marcarlo como supuesto y seguir.
- **Alim eligió la opción que yo desaconsejé (Levelop prefinancia inventario), y eso no es un
  fracaso de mi recomendación.** Mi trabajo era mostrarle el costo real de cada camino, no elegir
  por él. Lo que sí me toca ahora es no dejar que la decisión avance sin tamaño: no vuelvo a traer
  un número a un comité (o a Alim) sin la tasa Oro→USD que la sostiene.

---

## 6. MEJORAS PROPUESTAS

| # | A quién | Propuesta |
| :-- | :--- | :--- |
| M-01 | A mí mismo | Todo modelo lleva la columna **Origen** en la propia tabla: `DATO` / `DATO DERIVADO` / `⚠️ SUPUESTO`. Nunca en un anexo. |
| M-02 | A mí mismo | Identificar el **input dominante** de todo modelo (el que mueve >50% del resultado) y ponerlo en la primera línea con su fuente. En este caso eran las "4 horas semanales" y estaban enterradas. |
| M-03 | Al CMO | El pool de $20 va en la primera lámina de precio, siempre. Es una regla comercial, no una preferencia. |
| M-04 | Al protocolo | Prohibir la palabra "Verified" o cualquier ✅ en un entregable sin un link a la verificación. Fue una celda decorativa que casi se convierte en un argumento de venta. |
| M-05 | Al CTO | Necesito de él un formato estándar de costo por decisión de arquitectura (OpEx mensual + costo de reversión), no solo semanas de esfuerzo. |
| M-06 | A mí mismo | Antes de dar una decisión de otro agente por "cerrada", cruzarla contra mi propia tabla de AUTORIDAD del BRIEF. No toda decisión que el CEO cierra internamente cubre el sign-off que mi rol específicamente requiere de Alim. |
| M-07 | Al protocolo / EA | Cuando una decisión se conoce por lectura cruzada de canales antes que por el radial correspondiente, registrar en el Dashboard de dónde salió el conocimiento realmente — si no, el mapa de "quién esperó qué" de la Retro queda incompleto. |
| M-08 | A mí mismo | Antes de escribir un supuesto financieramente material en cualquier canal (aunque esté marcado ⚠️ SUPUESTO), preguntar primero si hay forma de confirmarlo directo con Alim en la misma sesión. Marcar el supuesto no evita que otro agente empiece a trabajar sobre él. |
| M-09 | Al CEO | "Beneficios de Levelop" con prefinanciamiento de inventario debería tratarse como una escalada de capital tipo A-1..A-5, no como una tarea de secuencia — el tamaño todavía no se conoce pero la naturaleza de la decisión (compromiso de caja real, arquitectura de custodia) ya califica. |

---
*Última actualización: 07 Ago 2026*
