# LOG — EXECUTIVE ASSISTANT
**Archivo vivo.** Lo actualizo yo al cerrar cada bloque de trabajo. Estructura fija de 6 bloques
(ver `00 - PROTOCOLO OPERATIVO.md` §4). Se acumula, no se borra.

---

## 1. CONTEXTO ACUMULADO

**25/08/26 — Mesa Redonda sobre el MVP v0.3 del PD. Tres agentes, tres hallazgos que ninguno vio del otro.**

Alim pidió convocar a CEO, CFO y CTO sobre la entrega del Product Designer y pidió como salida un mapa
mental interactivo, no un acta más. Hice las tres sesiones **por separado y sin que ninguno viera la
posición de otro** — eso importa para lo que sigue.

**El hallazgo estructural de la mesa, y no lo produjo ningún agente solo:** el PD escribió *"quitar el
dinero de la pantalla no quitó el poder, lo mudó de sitio"*. El CFO, sin haberlo leído en esos términos,
dijo *"la tasa Oro→USD no murió, se escondió en nuestra propia factura"*. El CTO, sin haber leído a
ninguno de los dos, dijo *"al desaparecer la tasa desapareció el instrumento de medición del pasivo"*.
**Son tres formulaciones del mismo hecho desde tres disciplinas distintas.** Es exactamente el producto
que justifica que este sistema exista: ninguno de los tres habría llegado ahí leyendo a los otros dos,
porque habrían convergido en el lenguaje del primero que hablara.

**El hallazgo más caro lo trajo el CFO haciendo una multiplicación que nadie había hecho.** Cruzó la
fórmula de emisión del PD (§9.1) contra el precio ilustrativo de 900 Oro del propio PD (§3.2): el
escenario más conservador entrega **11 días libres al año por empleado** y el del tope **44**. Ninguno
es sostenible. **Invalida los 19 precios del catálogo.** Y nombró la causa raíz sin culpar a nadie: la
identidad `Oro emitido × precio implícito = presupuesto de cupos` tiene tres variables, dos fijadas por
personas distintas, y **la tercera nadie la estaba mirando** — el precio salía por residuo.

**Lo que decidió el CEO:** 8 decisiones (C-1 a C-8), el BackOffice entra en v1 porque *"en una PyME
venezolana paga el jefe, y llevamos desde el 06/08 diseñando para la única persona que no paga"*, y
mató v0.5 y v1.0 completas — *"no hay 9 semanas, hay 2"*. Creó **R-07** (no-vigilancia) como regla
permanente, con el argumento de que **R-03 muere sin R-07**.

**Lo que trajo el CTO, después de 19 días de silencio:** respondió M-02 (los cinco estados son
distinguibles, no colapsar ninguno), encontró que el `INDETERMINADO` de timeout **ya no describe nada
real**, que **falta un sexto estado** que va a pasar todas las semanas, y puso por escrito la
restricción física del proyecto: **21–32 semanas-fundador** contra las 2 que dice el CEO que hay.

**Seis choques registrados.** Cuatro abiertos, uno que resultó ser convergencia (CEO y CFO llegaron al
mismo sitio sobre equidad entre zonas por caminos opuestos), y uno —CH-6, el tiempo— que no es choque
de criterio sino la restricción física, escrita por primera vez.

**Un patrón que ya se repite y quiero nombrarlo:** por segunda vez esta semana un agente se hizo cargo
de un bloqueo que causó (el CTO con sus 4 mensajes) y por segunda vez lo que vino después fue mejor. Y
esta vez pasó algo nuevo: **el CFO se atribuyó un error que el PD se había atribuido a sí mismo**
(*"su §6.7 no fue su error, fue el mío: LVL-024 estaba bloqueada de mi lado"*). Corregí el acta a favor
del CFO.

---

**08/08/26 — Auditoría de comunicación a pedido de Alim, y encontré un error mío.**

Alim pidió un diagrama de flujos de comunicación entre agentes para detectar bottlenecks. Antes de
construirlo, hice el barrido de todos los canales y encontré que **yo** era uno de los bottlenecks:
el CEO me pidió el 07/08 (`EA - CEO.md` MSG-005) avisar a CMO, GS y CTO por sus canales radiales
que Alim había resuelto A-1 a A-4. No lo hice. Los tres se enteraron por canales laterales —
principalmente porque el CFO propagó la noticia él mismo antes de que yo la radiara oficialmente.

Lo corregí el mismo día enviando el broadcast pendiente a los tres (`EA - CMO.md`, `EA - Growth &
Sales.md`, `EA - CTO.md`, MSG-004 en cada uno). **Aprendizaje inmediato: mi propio protocolo dice
que un mensaje sin responder en 48h alimenta el Dashboard como bloqueo — nunca apliqué esa regla a
mí misma.** El sistema detectó automáticamente los bloqueos de otros agentes pero no tenía ningún
mecanismo para que yo detectara los míos, hasta que alguien (Alim) pidió mirar el grafo completo.

**Hallazgo estructural, no anecdótico, de ese mismo barrido:** el CFO se ha convertido en un hub de
facto. En 48 horas inició conversaciones con EA, CEO, CMO, CTO y GS — 5 de 6 canales que tocó esta
semana los abrió él, no el receptor (cambio de precio dos veces, plan de self-funding, ratificación
de arquitectura B). Es un agente cumpliendo bien su rol, pero también un punto único de propagación
que debería pasar por mí y hoy no siempre lo hace.

**Segundo hallazgo: CTO lleva sin escribir desde el 06/08** pese a tener dos mensajes ALTA del CFO
sin responder (`CFO - CTO.md` MSG-004 y MSG-005) y `LVL-022` en 0% — la tarea que bloquea tanto la
ratificación del precio como el nivel de Desarrollo del plan de self-funding.

**Tercer hallazgo: Product Designer y Lead Researcher están aislados.** Sus canales (`CTO-PD`,
`PD-LR`, `CMO-LR`, `CMO-GS`) siguen exactamente donde quedaron el 06/08 — cero mensajes nuevos
mientras el resto del sistema intercambió más de 15. La sesión GS+LR para el guion de entrevistas,
acordada para antes del 19/08, no tiene rastro de haber ocurrido en ningún canal.

**Cuarto hallazgo: hay un tema nuevo sin dueño.** Alim, al aprobar la arquitectura B, introdujo la
idea de que Levelop negocie convenios propios con marcas (Nike, Adidas, Cashea de ejemplo). Cruza a
CEO, CTO, CMO, GS y LR — el CFO ya lo señaló en tres canales distintos — pero nadie lo ha adoptado
como tarea con dueño y fecha. Es exactamente el tipo de decisión que mi protocolo dice que se debe
convocar a Mesa Redonda antes de que se vuelva scope creep silencioso.

**Actualización el mismo 08/08, durante la verificación final del diagrama:** el "tema sin dueño" del
párrafo anterior dejó de serlo mientras yo todavía estaba construyendo el Dashboard. Un nuevo barrido
de canales (`CFO - CTO.md`, `CEO - CFO.md`, `EA - CFO.md`, todos con MSG-006/007 nuevos que no había
visto) muestra que Alim ya decidió: Levelop comprará y mantendrá inventario de canje de marcas **por
adelantado**. El CFO lo marcó de inmediato como estructuralmente idéntico a la Arquitectura A que ya
habíamos rechazado para el pool de Oro (Levelop como cuasi-emisor con incentivo perverso a que el
Oro no se canjee) — ahora aplicada a convenios de marca. Pide sign-off de capital de CEO + CFO +
Alim, una regla nueva no-negociable (el Oro vencido nunca se vuelve ingreso de Levelop), y que la
decisión quede bloqueada por tres cosas: `LVL-024` (tasa Oro→USD), que el Lead Researcher confirme
que Venezuela puede pagar a proveedores internacionales de gift cards, y una evaluación de
agregadores (Tango Card/BHN, Tremendous). El CFO también pidió explícitamente, en `EA - CFO.md`
MSG-006, que mantenga `LVL-024` como **el chokehold más urgente del Dashboard** — ya no bloquea solo
al CTO, bloquea también a PD y el tamaño real de este nuevo capital. Actualicé el Dashboard y este
LOG con esto antes de cerrar la verificación; no alcancé a preguntarle a Alim si quiere que convoque
una Mesa Redonda corta para esto o si lo deja avanzar como conversación directa CEO-CFO-Alim.

**Quinto hallazgo, más chico pero real:** el CTO no solo sigue en silencio — acumuló dos mensajes
ALTA más del CFO (MSG-006/007 en `CFO - CTO.md`) sin responder ninguno de los cuatro. El bottleneck
no se mantuvo estable mientras yo verificaba: creció.

---

**06/08/26 — Arranque del sistema.**
- Alim me instaló como coordinadora del equipo de agentes de Levelop (LVL UP!), un Work OS
  gamificado B2B. Mi carpeta es `Executive Assistant/`.
- El `Context.md` que me dejó tenía una sola indicación: convocar una mesa entre CFO, Lead
  Researcher, CEO y CMO sobre la spec de Cashea, con libertad para modificar el reparto.
- Usé `KARL - OPS Dashboard.html` como plantilla de referencia. Es de otro proyecto (KARL
  Support Services, agencia de marketing), pero su estructura —sprint calendar con checkboxes,
  chokeholds, esperando respuesta, estado de agentes— es exactamente lo que Alim quiere aquí.
- **Roster decidido con Alim:** 8 agentes. Los 3 que ya existían (CFO, CMO, Lead Researcher) +
  yo + 4 nuevos (CEO, CTO, Product Designer, Growth & Sales).
- **Idioma del sistema: español.** Los docs técnicos heredados están en inglés y se quedan así.
- **Modelo de conversación:** los agentes hablan de verdad (sesiones reales), yo transcribo al
  canal. No pongo palabras en sus bocas.

**Sobre la empresa, lo que aprendí leyendo todo:**
- Producto: tareas = "Misiones" → dan XP y "Oro". El Oro se canjea por **Intrarrecompensas**
  (tiempo: salida anticipada, días libres, ventanas de desconexión) y **Extrarrecompensas**
  (consumo: Cashea, Wellhub, Betterfly).
- **Estado real:** frontend V1 funcional; el backend no existe en producción, corre sobre
  localStorage. Alim trabaja ~18h/semana, sin equipo.
- **Tensión de origen que nadie había puesto sobre la mesa:** la memoria del proyecto habla de
  agencias de 10-30 empleados en Santiago de Chile a $10-12/usuario; toda la investigación
  apunta a Venezuela con Cashea y el modelo del CFO usa $8 + $20 de pool para 50 empleados.
  Eran dos empresas distintas conviviendo en la misma carpeta.

---

## 2. TAREAS COMPLETADAS

| Fecha | ID | Qué | Entregable |
| :--- | :--- | :--- | :--- |
| 06/08 | — | Lectura completa del corpus (4 .md, 4 PDF, 2 CSV, 1 xlsx, memoria del proyecto) | — |
| 06/08 | — | Protocolo operativo del sistema | `00 - PROTOCOLO OPERATIVO.md` |
| 06/08 | — | Mapa de agentes y racional de cada canal | `00 - MAPA DE AGENTES.md` |
| 06/08 | — | Carpeta y estructura de canales | `Chat between agents/` + índice |
| 06/08 | — | 8 BRIEF de agente | uno por carpeta |
| 06/08 | — | 8 LOG vivos | uno por carpeta |
| 06/08 | `LVL-000` | Sesión de contexto con el Lead Researcher | `EA - Lead Researcher.md` |
| 06/08 | `LVL-000` | Mesa Redonda de Cashea con 5 agentes | `MESA REDONDA - Cashea Integration Spec.md` |
| 06/08 | — | Registro de tareas `LVL-001` a `LVL-029` y ruteo a cada canal | Dashboard |
| 06/08 | — | Dashboard operativo | `LEVELOP - OPS Dashboard.html` |
| 08/08 | — | Auditoría de comunicación completa (17 canales) + broadcast corregido a CMO/GS/CTO | `EA - CMO.md`, `EA - Growth & Sales.md`, `EA - CTO.md` MSG-004 |
| 08/08 | — | Diagrama de red de comunicación + hallazgos de bottleneck | `LEVELOP - OPS Dashboard.html` |
| 08/08 | — | Reconciliación de último momento: escalada de "Beneficios de Levelop" a decisión de capital + CTO con 4 mensajes sin responder | `LEVELOP - OPS Dashboard.html`, este LOG |
| 25/08 | — | Mesa Redonda MVP v0.3 con CEO, CFO y CTO (3 sesiones independientes) | `MESA REDONDA - MVP v0.3.md` |
| 25/08 | — | Mapa mental interactivo del discernimiento de los 3 agentes | `LEVELOP - Mapa Mental MVP v0.3.html` |
| 25/08 | — | Respuesta completa al PD: sus 3 preguntas + sus 5 peticiones cerradas | `EA - Product Designer.md` MSG-006 |
| 25/08 | `LVL-030..033` | IDs retroactivos a los 3 artefactos del PD + apertura de equidad entre zonas | Registro de tareas |

---

## 3. EN CURSO

| ID | Qué | % | Bloqueo |
| :--- | :--- | :--- | :--- |
| — | Primera Retro del sistema | 0% | Programada 20/08 |
| — | Seguimiento de si el CTO responde a `CFO - CTO.md` MSG-004 a MSG-007 (ya son 4, no 2) | 0% | CTO |
| — | Confirmar si la sesión GS+LR (guion de entrevistas) ya ocurrió fuera de este sistema | 0% | GS + LR |
| — | Preguntar a Alim si quiere Mesa Redonda corta para "Beneficios de Levelop" o lo deja como conversación directa CEO-CFO | 0% | CEO + CFO + Alim |
| — | Confirmar con LR si puede validar restricciones venezolanas para pagar a proveedores internacionales de gift cards | 0% | LR |

---

## 4. BLOQUEOS

| Qué | De quién depende | Desde | Impacto |
| :--- | :--- | :--- | :--- |
| ~~A-1 a A-4~~ | ~~Alim~~ | ~~06/08~~ | 🟢 **Resueltas 07/08** — ver LOG del CEO |
| **A-5** Bus factor = 1 | Alim | 06/08 | 🟢 Sin urgencia esta quincena; riesgo de due diligence |
| **CTO en silencio** — 4 mensajes ALTA del CFO sin responder desde 07/08 (MSG-004 a MSG-007) | CTO | 07/08 | 🔴 Bloquea `LVL-022` (precio en firme + nivel de Desarrollo del self-funding) y sostiene el bloqueo de `LVL-024` |
| **`LVL-024` — política de valoración del Oro, sin documento formal** | CFO + PD + CTO | 07/08 | 🔴 El CFO lo pidió como el chokehold #1 del Dashboard: bloquea el esquema de cuentas del CTO, la Tienda del PD, **y** el tamaño de capital de "Beneficios de Levelop" |
| **PD y LR sin actividad lateral desde 06/08** | PD, LR | 06/08 | 🟡 Sesión de guion GS+LR sin rastro; PD bloqueado en `LVL-024` sin haber sido incluido en la conversación CFO↔CTO sobre valoración del Oro |
| **"Beneficios de Levelop" — de sin dueño a decisión de capital sin sign-off** | CEO + CFO | 07/08 | 🔴 Alim ya decidió comprar inventario por adelantado; es la Arquitectura A rechazada, ahora sobre marcas; falta sign-off. **25/08: el CFO lo eleva a A-8 — es la única categoría donde Levelop tiene pasivo propio, y quitar el dinero del producto la volvió invisible** |
| **CH-1 · BackOffice: v1 (CEO) contra 7 semanas-fundador (CTO)** | Alim | 25/08 | 🔴 Ninguno de los dos está equivocado dentro de su marco. No lo resuelve ninguno solo |
| **CH-2 · El opt-out y el Oro: tres documentos vigentes, tres reglas incompatibles** | Alim | 25/08 | 🔴 PD (apaga el Oro), CTO (apagarlo es una multa y reabre la coerción), CFO (caduca a 90 días). **Bloquea `LVL-009`, vence 02/09** |
| **CH-6 · El tiempo: 2 semanas disponibles contra 21–32 de trabajo** | Alim | 25/08 | 🔴 No es choque de criterio: es la restricción física del proyecto. Todo lo demás se subordina |
| **Los 19 precios del catálogo no tienen suelo** | CFO → PD | 25/08 | 🔴 El cálculo del CFO (11 a 44 días libres/año) los invalida. El PD no puede rehacerlos hasta que cierre `LVL-024` |

---

## 5. APRENDIZAJES

**Sobre el sistema:**
- **Añadir al CTO a la mesa de Cashea fue la decisión de mayor rendimiento del día.** Alim pidió
  4 agentes; el hallazgo más grave de la mesa (el ledger de la spec no es de doble entrada, y el
  rollback dentro de una transacción abierta llamando a una API externa es un agujero de dinero)
  lo trajo el agente que él no había pedido. **Aprendizaje: cuando un documento es 70% técnico,
  falta un técnico en la sala aunque nadie lo note.**
- **Los agentes se contradicen y eso es la señal, no el ruido.** El CMO le discutió al CFO el
  default del pool en $0 y le discutió al Lead Researcher la definición de foso. Ninguna de esas
  dos objeciones habría existido si yo hubiera escrito sus voces. La decisión de Alim de usar
  agentes reales fue correcta.
- **El CFO desarmó su propio modelo sin que nadie se lo pidiera dos veces**, y encontró un error
  que el Lead Researcher no había visto (el ahorro fiscal de $4.200 es ficticio en Venezuela
  porque la compensación real ya se paga vía bonos exentos). Un agente al que se le pide "mea
  culpa" explícita entrega más que uno al que se le pide "revisa".

**Sobre el proyecto:**
- **La contradicción Chile/Venezuela estaba a plena vista y nadie la había nombrado.** Vivía
  entre la memoria del proyecto y la carpeta de investigación, y ningún documento cruzaba los
  dos. **Aprendizaje: los huecos peligrosos no están dentro de los documentos, están entre ellos.**
- Un corpus de investigación grande y bien escrito **se siente** como evidencia. El Lead
  Researcher encontró que la columna "Fuente de Datos" está literalmente vacía en tablas enteras
  de nuestros propios PDFs. La densidad no es rigor.

---

## 6. MEJORAS PROPUESTAS

| # | A quién | Propuesta | Estado |
| :-- | :--- | :--- | :--- |
| M-01 | Al protocolo | Añadir a la plantilla de Mesa Redonda un paso obligatorio: **"¿quién falta en esta sala?"** antes de empezar. Habría capturado al CTO sin que yo tuviera que notarlo. | Propuesta 06/08 |
| M-02 | Al protocolo | Toda tabla con una columna "Fuente" vacía se considera **no publicable** por defecto, sin necesidad de que el LR la revise una por una. | Propuesta 06/08 |
| M-03 | A mí misma | Antes de una mesa, cruzar la memoria del proyecto contra la carpeta de investigación buscando contradicciones. Fue donde estaba el hallazgo más grande y lo encontré por casualidad. | Adoptado |
| M-04 | Al CEO | Su resolución fue excelente pero fija 6 decisiones con fecha sin que Alim haya aprobado aún A-1 a A-5. Propongo marcar cada decisión como *condicionada* a su dependencia de Alim, para no simular un avance que no existe. | Propuesta 06/08 |
| M-05 | Al sistema | Ningún agente tiene todavía la obligación de leer la RETRO anterior antes de su sesión. Está en el protocolo pero no hay mecanismo. Proponer un encabezado "última RETRO leída" en cada LOG. | Propuesta 06/08 |
| M-06 | A mí misma | Mi regla de "un mensaje sin responder en 48h alimenta el Dashboard" nunca se la apliqué a mis propios canales radiales. Voy a correr ese barrido yo misma cada vez que actualice el Dashboard, no solo cuando alguien pida un diagrama. | Propuesta 08/08 — adoptada |
| M-08 | Al protocolo | **Sesionar a los agentes por separado, sin que vean la posición de otro, produce más que sesionarlos juntos.** En esta mesa tres agentes llegaron al mismo hallazgo desde tres disciplinas distintas; si se hubieran leído, habrían convergido en el lenguaje del primero que hablara y habríamos tenido una formulación en vez de tres. Propongo que la independencia de sesión sea regla, no casualidad. | Propuesta 25/08 |
| M-09 | A mí misma | **Ninguna mesa debería cerrar sin que alguien multiplique dos números que vienen de dos agentes distintos.** El hallazgo más caro de esta mesa (11 a 44 días libres/año) salió de cruzar la fórmula del PD con el precio del PD — dos datos que llevaban semanas en el mismo documento sin que nadie los multiplicara. Lo hago yo antes de cerrar acta, o lo encargo explícitamente. | Propuesta 25/08 — adoptada |
| M-10 | Al protocolo | **Etiquetar cada petición entre agentes como "de decisión" o "de construcción"** — petición del CTO. Las de decisión se contestan en 24h porque cuestan pensar; las de construcción son semanas y compiten entre ellas. Hoy llegan mezcladas con la misma etiqueta "ALTA", y por eso se le acumularon cuatro que se cerraban en una tarde. | Propuesta 25/08 |
| M-07 | Al protocolo | Cuando Alim habla directo con un agente (ya pasó 2 veces esta semana, con CEO y CFO), pedir que ese mismo día lo registre en su canal radial conmigo. Ambos ya lo hicieron bien por iniciativa propia; formalizarlo como regla en vez de dejarlo a la disciplina individual. | Propuesta 08/08 |

---
*Última actualización: 25 Ago 2026*
