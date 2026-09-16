# MESA REDONDA — SPEC DE INTEGRACIÓN CON CASHEA
**Convocada por:** Executive Assistant, a pedido de Alim (`Executive Assistant/Context.md`)
**Fecha:** 06 Ago 2026 · **Estado:** ✅ CERRADA
**Participantes:** CEO · CFO · CMO · CTO · Lead Researcher
**Documento en revisión:** `Lead Researcher/Contexto/LEVELOP_Cashea integration spec.md`

> Nota de la EA: Alim pidió esta mesa con CEO, CFO, CMO y Lead Researcher, y me dio
> libertad para añadir agentes. Añadí al **CTO**: la spec es en un 70% arquitectura
> (ledger, idempotencia, circuit breakers, screening OFAC) y sin voz de ingeniería nadie
> en la sala podía presionar el documento donde más se rompía. Fue la decisión correcta:
> el hallazgo más grave de la mesa es suyo.

---

## RESUMEN EJECUTIVO (para Alim, 60 segundos)

**La spec de Cashea está escrita contra una API que nadie ha leído.** No existe en todo
el material una sola referencia a documentación pública de Cashea, un portal de
developers, un contrato, un contacto o un caso de tercero integrado. El endpoint, el
payload, los códigos de respuesta y la firma HMAC son **diseño hipotético nuestro**.

La mesa decidió: **congelar Cashea, construir su esqueleto interno** (que sirve igual sin
Cashea), y convertir la primera pregunta del roadmap en una llamada, no en un sprint.

Además la mesa desenterró tres cosas que exceden a Cashea y que son más importantes que
Cashea:

1. **Somos dos empresas en un solo documento** — una en Chile con leads y sin ventaja
   competitiva, otra en Venezuela con ventaja y sin leads. El CEO decidió: **Venezuela**.
2. **El modelo de ROI no sobrevive un escrutinio serio.** El CFO desarmó su propio modelo:
   el 78% del beneficio proyectado descansaba en una cifra sin fuente.
3. **El posicionamiento cambia.** De "Work OS gamificado" a **"Sistema de Beneficios por
   Desempeño"**. El claim central pasa a ser: *"Tus beneficios ya existen. Levelop decide
   quién se los gana."*

---

## POSICIÓN 1 — LEAD RESEARCHER

**Veredicto sobre Cashea:** *"La evidencia no sostiene que Cashea sea nuestra ventaja
competitiva principal. Sostiene que sería una ventaja formidable si existiera. La
distinción es la diferencia entre una estrategia y una esperanza."*

**Lo que la spec asume sin verificar:**

1. Que Cashea tiene un programa de partners B2B. `POST https://api.cashea.app/v1/partners/vouchers`
   con `Authorization: Bearer <Levelop_B2B_JWT_Token>` — nada de eso está confirmado.
2. Que Cashea aceptaría crédito de terceros aplicado a cuotas. Es una decisión de riesgo
   crediticio para ellos, no una feature. Un BNPL puede razonablemente negarse.
3. Que existe un webhook `voucher.applied` con secreto compartido. Requiere que Cashea
   construya algo para nosotros.
4. Que el screening OFAC es un componente que ya tenemos. Es una caja en un diagrama: sin
   proveedor, sin contrato, sin costo.
5. Que tenemos base de datos. La app corre sobre localStorage.
6. Que la asimetría de poder es aceptable: `usd_equivalent -- set by corporate HR`. El
   empleador fija cuánto vale el esfuerzo del empleado, después del hecho, sin restricción.

**Otros hallazgos de la sesión de contexto (informe completo en `Lead Researcher/LOG`):**

- Las cifras de mercado LATAM que usamos ($22-25B en 2025, PYME CAGR 24,88%, etc.) tienen
  la columna "Fuente de Datos" **literalmente vacía** en nuestros propios PDFs.
- Nuestras dos fuentes de tamaño de mercado se contradicen entre sí ($9,65B/2024 CAGR 6,32%
  vs. $7,9B/2025 CAGR 11,1%; cloud 74,20% vs. 57%).
- **Cero voz de cliente.** No hay una sola entrevista, encuesta ni carta de intención de una
  empresa venezolana en todo el corpus.
- **Existe Fina**: >4.000 clientes venezolanos, >$1,5M ARR con SaaS localizado. Es la única
  prueba de disposición a pagar en este mercado y no lo hemos estudiado.
- La validez jurídica de las Intrarrecompensas está afirmada tres veces y fundamentada cero.
  Ningún documento cita LOTTT ni opinión de abogado laboral venezolano.

**Su recomendación:** *"El foso que sí tenemos evidencia de poder construir es más aburrido
y más real: ser cobrables en Venezuela cuando Monday, Asana y ClickUp no lo son. Eso no
depende del permiso de nadie."*

---

## POSICIÓN 2 — CTO

**Veredicto:** *"No debe implementarse hoy —está escrita contra una API que nadie ha
leído— pero su esqueleto interno sí debe construirse en 90 días como capa genérica de
canje, con un provider manual. La rama Cashea se conecta cuando exista sandbox y contrato."*

**Los cinco errores técnicos más graves de la spec:**

| # | Error | Consecuencia |
| :-- | :--- | :--- |
| 1 | **El ledger no es de doble entrada.** `oro_ledger` tiene `EARN/BURN` con `amount` siempre positivo: es un journal de una sola pierna. Falta la cuenta `redemption_escrow`. | El pasivo no es auditable. Sin auditoría no hay venta a empresa seria. |
| 2 | **El rollback es el error más grave.** El diagrama mantiene una transacción de Postgres abierta mientras llama a Cashea con 3 reintentos. Sostiene locks de fila durante segundos y hace `ROLLBACK` sobre un ledger declarado append-only. | Agota el pool de conexiones, bloat de MVCC, y es una contradicción de diseño. Correcto: patrón **outbox** + asientos compensatorios. |
| 3 | **Un timeout no es un fallo.** Pasa a `FAILED` y devuelve el Oro tras 3 reintentos. Si Cashea sí creó el voucher, emitimos valor gratis. Falta el estado `INDETERMINATE` y un endpoint de reconciliación. | **Agujero de dinero.** |
| 4 | **Idempotencia mal planteada.** Un UUID-v4 generado en cliente se regenera si el proceso reinicia: no es idempotente. Y `idempotency_key UNIQUE` es global, no por tenant — un cliente puede envenenar el espacio de claves de otro. | Debe ser UUIDv5 determinístico + `UNIQUE(tenant_id, idempotency_key)`. |
| 5 | **HMAC incompleto.** Faltan ventana temporal antirreplay, comparación en tiempo constante, captura del raw body antes del parser de Nest, e idempotencia por `event_id`. | Señal de alarma: el payload de ejemplo usa offset `-07:00` (Los Ángeles) para una operación venezolana (-04:00). **Ese JSON fue generado, no observado.** |

**Otros hallazgos:** `national_id UNIQUE` global impide que una persona trabaje en dos
empresas cliente, y la cédula está en claro sin cifrado ni política de retención. La tasa
Oro→USD no se versiona: si RRHH la cambia, el histórico es irreconstruible.

**Sobre OFAC:** *"Es técnicamente incoherente. La lista SDN indexa nombres, alias y fechas
de nacimiento, no cédulas venezolanas. El matching es difuso por nombre, con falsos
positivos masivos en apellidos hispanos comunes. Y apuntamos al lado equivocado del riesgo:
nuestra exposición real es el cliente corporativo (el RIF sponsor), no el empleado."*

**Vale la pena construir aunque Cashea nunca conteste:** ledger de doble entrada con event
store, idempotencia determinística, máquina de estados con `INDETERMINATE` + reconciliación,
patrón outbox, verificación HMAC genérica, caps antifraude, e interfaz `RedemptionProvider`
con implementación `ManualFulfillment` (RRHH aprueba, paga fuera de banda, adjunta evidencia).
**Eso ya permite canjes reales sin ninguna API externa.**

**Resolución del conflicto offline-first vs. OT:** no hay contradicción si se parte por
dominio. Los eventos de misión y el ledger son un log append-only deduplicado por ID —
formalmente un G-Set, el CRDT más barato que existe, sin tombstones ni recolección de basura.
El impuesto de memoria 17-33x que veta el CFO es de CRDTs de **texto** (Yjs, RGA), no de esto.
La estructura del workspace sí requiere conexión.

**Estimación honesta** (semanas-fundador de 18h):

| Bloque | Semanas |
| :--- | :--- |
| Backend real mínimo: PostgreSQL + JWT + multi-tenancy + CI/CD + backups | 6–9 |
| Ledger doble entrada + idempotencia + escrow + reversals | 3–4 |
| Capa offline-first | 3–5 |
| Cashea end-to-end (*solo si* hay sandbox y docs) | 2–3 |
| Screening OFAC | *no lo haría él mismo* |

**Total base: 12–18 semanas de 18h ≈ 3 a 4,5 meses.**

**Riesgos que nadie había nombrado:**
1. La migración localStorage → Postgres **no tiene identidad estable**. Cada navegador es un
   silo con datos de demo mezclados con datos de piloto.
2. Los saldos de Oro de hoy **se editan desde DevTools en diez segundos**. Si se vuelven
   canjeables retroactivamente, heredamos un pasivo inflado por datos nunca auditables.
3. **Bus factor = 1 y cero DR.** Sin backups probados ni gestión de secretos. El primer
   comprador B2B serio lo pregunta en due diligence. Mata deals antes que cualquier feature.

---

## POSICIÓN 3 — CFO

**Veredicto:** *"Apruebo el diseño de la integración y **veto su construcción ahora**.
Convierte el Oro en un pasivo financiero exigible antes de que exista un libro mayor, un
backend o un contrato con Cashea — y mi propio modelo de ROI no soporta el escrutinio de un
CFO cliente."*

### El Oro como pasivo

Mientras el Oro solo compra **Intrarrecompensas** (tiempo), es una obligación en especie del
cliente empleador. Levelop no tiene nada en su balance: somos un registro.

En el segundo en que el Oro se canjea por un voucher con valor en USD, pasa a ser **valor
almacenado con contrapartida en efectivo**. La pregunta no es "¿es bonito?" sino **¿quién
custodia el efectivo del pool?**

| Arquitectura | Qué implica | Veredicto |
| :--- | :--- | :--- |
| **A — pool prefondeado en cuenta de Levelop** | Caja restringida (activo) contra fondos de clientes por pagar (pasivo). Nos convierte en **custodio de dinero de terceros en un corredor sancionado**. No somos SaaS: somos cuasi-emisor. | ❌ **Rechazada** |
| **B — el pool se queda en el cliente; Levelop instruye, el cliente liquida** | El pasivo se queda donde nace, en el empleador. Levelop es software puro. | ✅ **Recomendada sin matices** |

**Sobre el breakage:** bajo A, el Oro caducado se convertiría en ingreso de Levelop — es
decir, **ganamos cuando el empleado no cobra**. Ese incentivo destruye la tesis entera del
producto y es indefendible ante un comité. Bajo B, revierte al cliente.

**Dos decisiones que parecen técnicas y son financieras:** el decay de 90 días no es UX, es
la política de extinción del pasivo, y va en el contrato, no en el código. Y sin una **tasa
Oro→USD congelada por cohorte de emisión**, el pasivo no es medible y RRHH puede devaluar
Oro ya ganado.

### Mea culpa: el modelo de ROI reconstruido

El CFO aceptó la auditoría del Lead Researcher **y agregó un error que nadie había visto**:

> *"La línea de 'ahorro fiscal' de $4.200 es en gran medida ficticia en Venezuela. Nuestro
> propio playbook dice que la compensación real ya se paga vía bonos no salariales exentos
> (Bono de Guerra + Cestaticket). No podemos vender un ahorro del 35% sobre dinero que el
> cliente **ya** paga exento. Y retiro la celda '✅ Verified': no estaba verificada por nada."*

Modelo revisado, 50 empleados, hora base recalculada sobre el ingreso real del playbook
($240/mes ÷ 2.080h = **$1,38/h**, no $2,19):

| Input | Conservador | Base | Optimista | Origen |
| :--- | :--- | :--- | :--- | :--- |
| Salario mensual referencia | $240 | $240 | $240 | **DATO** (playbook) |
| Valor hora | $1,38 | $1,38 | $1,38 | **DATO derivado** |
| Horas/semana recuperadas | 0,5 | 1,5 | 3,0 | ⚠️ SUPUESTO — sin fuente |
| Tasa de captura del tiempo | 30% | 50% | 70% | ⚠️ SUPUESTO |
| Rotación anual base | 25% | 25% | 25% | ⚠️ SIN FUENTE |
| Reducción de rotación | 10% | 15% | 25% | ⚠️ SUPUESTO (el 30% es benchmark **Wellhub**) |
| Costo por contratación | $600 | $600 | $600 | ⚠️ SIN FUENTE |
| **Valor productividad** | $538 | $2.691 | $7.535 | Calculado |
| **Ahorro rotación** | $750 | $1.125 | $1.875 | Calculado |
| **Ahorro fiscal** | $0 | $0 | ⚠️ n/d | **Corregido a $0** |
| **Beneficio anual total** | **$1.288** | **$3.816** | **$9.410** | |
| Costo suscripción propuesta | $2.628 | $2.628 | $2.628 | Propuesta |
| **ROI / Payback** | **−51% / nunca** | **+45% / 8,3 meses** | **+258% / 3,4 meses** | |

> *"A $8/usuario el caso solo cierra en el escenario optimista. Un precio que solo funciona
> con supuestos optimistas no es un precio, es una apuesta."*

### La pregunta de los $20: ¿de dónde sale el pool?

| Opción | Análisis |
| :--- | :--- |
| (a) Presupuesto nuevo | $12.000/año adicionales para una PyME de 50. Alarga el ciclo, sube el comité, compite contra el flujo de caja. **La peor.** |
| (b) **Reasignación de beneficios existentes** | Las empresas ya compran wellness, transporte y seguros fragmentados. El pool no es gasto nuevo: es **el mismo gasto, dirigido por desempeño en vez de por planilla**. ✅ **Recomendada.** |
| (c) Financiado por ahorro fiscal | **Descartada.** En Venezuela el beneficio ya es exento. |

### Precio propuesto

**$79/mes de plataforma con 15 asientos incluidos. +$4/asiento adicional. Pool de
recompensas como línea aparte, default $0, definido por el cliente.**

- 10–30 empleados: $79–$139/mes · 50: $219/mes ($2.628/año) · 100: $419/mes
- Founder deal = descuento con fecha de vencimiento, **no un precio**.
- **Condición no negociable:** ningún precio se ratifica sin conocer el costo de inferencia
  de IA por usuario/mes. Hoy fijaríamos precio a ciegas sobre el COGS.

### Costos de la integración Cashea que hoy no están en ningún modelo

Proveedor KYC/OFAC · opinión legal sobre si somos emisor/custodio · comisión de Cashea al
partner · float y prefondeo (solo bajo arquitectura A) · FX y spread Bs/USD · reversiones y
disputas · soporte tier-1 sobre dinero real · retención de cédulas · **inferencia de IA
(bloqueante)**. Todas marcadas **requiere cotización** — el CFO no inventó montos.

---

## POSICIÓN 4 — CMO

**Veredicto:** *"Acepto retirar todos los claims de Cashea, offline total y Daycohost —no
porque el mensaje sea débil, sino porque estamos apostando la única categoría defendible que
tenemos a un socio que no nos ha dicho que sí— y a cambio exijo que el equipo deje de tratar
'aburrido y real' como sinónimo de 'sin posicionamiento'."*

### Auditoría de claims

| Claim actual | ¿Se sostiene hoy? | Redacción permitida |
| :--- | :--- | :--- |
| "Integración con Cashea" | ❌ No hay acuerdo ni API | "Diseñado para canje con comercio local. Cashea es socio candidato prioritario, sujeto a acuerdo." Sin logo, sin endpoint |
| "Completar misiones paga tu cuota de Cashea" | ❌ Depende de tercero + promesa financiera | **Retirado por completo** hasta contrato firmado |
| "Offline-first total" | ❌ El producto corre sobre localStorage | "Registra tu trabajo sin conexión; el Oro se acredita al sincronizar" |
| "Alojado en Daycohost Tier III" | ❌ Es el caso de **Fina**, no el nuestro | "Arquitectura pensada para hosting local en Venezuela." Nada más |
| "+85% engagement / +40% productividad / −60% rotación" | ❌ No aparecen con fuente en ningún documento | "La gamificación bien diseñada eleva la participación entre 20% y 50% (meta-análisis 2014–2021)" |
| "ROI anual de 73,8%" | ⚠️ Proyección propia, no resultado medido | "Modelo de ROI configurable con tus supuestos" — siempre con la calculadora al lado |
| Cifras de mercado LATAM | ❌ Columna Fuente vacía | Fuera de todo material externo hasta que LR las reponga |
| "Primer Work OS gamificado tangible del mundo" | ❌ "Del mundo" es indefendible | "El primer Work OS diseñado para la realidad laboral venezolana" |
| "Participación 100% voluntaria / opt-out" | ✅ Si el producto lo implementa | **Usar sin restricción — es nuestro claim más fuerte y el menos explotado** |
| "Se paga en USDT y Pago Móvil" | ✅ Condicionado a integrar NOWPayments | **Usar. No depende del permiso de nadie** |

### El reposicionamiento

**Categoría: Sistema de Beneficios por Desempeño.** No un Work OS con recompensas. Un sistema
donde el beneficio deja de ser plano y se vuelve ganado — y que, de paso, gestiona el trabajo.

> **Claim central: *"Tus beneficios ya existen. Levelop decide quién se los gana."***

**Tres mensajes de soporte:**
1. **El beneficio que ya pagas, ahora conectado al desempeño.** No es gasto nuevo: es el mismo
   presupuesto de bonos, repartido por lo que la gente hace, con registro auditable.
2. **La recompensa que no te cuesta caja: tiempo.** Salida anticipada, días de descanso,
   ventanas de desconexión. Extralegal, no salarial, sin pasivo laboral. Funciona con pool $0.
3. **Facturable en Venezuela.** USDT y Pago Móvil indexado a BCV. Monday, Asana y ClickUp no
   pueden cobrarte. Nosotros sí.

Cashea, cuando exista, entra como **capítulo cuatro** — ampliación del catálogo de canje, no
el eje. *"La arquitectura de mensaje debe sobrevivir a que Cashea diga que no."*

### Arquitectura de mensaje por audiencia

| Audiencia | Mensaje | Miedo que desactiva |
| :--- | :--- | :--- |
| **Dueño/CEO PyME** | "Tu mejor gente se va a un remoto internacional. Esto hace que quedarse valga algo, sin subir la nómina." | "Otro gasto en dólares que no puedo justificar" |
| **Gerente de RRHH** | "Dejas de repartir beneficios a ciegas: por primera vez sabes quién se ganó qué, con registro." | "Me pedirán métricas de un programa que no puedo medir" |
| **Empleado** | "Tu esfuerzo compra tiempo tuyo. Y si no quieres jugar, apagas el juego y sigue siendo tu gestor de tareas." | "Esto es una cámara nueva para vigilarme mejor" |

### El riesgo ético — respuesta directa al Lead Researcher

> *"El LR tiene razón y no lo voy a suavizar: si el empleado planifica su cuota quincenal
> contra Oro esperado, dejamos de ofrecer un premio y empezamos a administrar su capacidad de
> pago. Eso no es un problema de redacción, es de diseño — y la comunicación no puede tapar un
> diseño coercitivo."*

**Seis reglas de comunicación vinculantes:**
1. **Nunca en futuro comprometido.** Prohibido "paga tu cuota", "cubre tus gastos". Permitido:
   "puedes canjear el Oro que ya tienes".
2. **Nunca cuantificar el ingreso esperado.** Prohibido "gana hasta $30/mes".
3. **El canje monetario nunca es el mensaje principal.** Tiempo primero, comercio después.
4. **La tasa se comunica como lo que es.** Si RRHH puede cambiarla, el material lo dice, en el
   mismo tamaño de letra que el beneficio.
5. **Nada de Extrarrecompensas en material de reclutamiento del cliente.** Si aparece en la
   oferta de empleo, dejó de ser un extra y se volvió salario disfrazado.
6. **Regla de la conversación difícil:** si un empleado puede decirle a su jefe *"necesito más
   misiones para llegar a fin de mes"*, el mensaje está mal construido.

---

## POSICIÓN 5 — CEO · RESOLUCIÓN

### La decisión sobre Cashea, en tres líneas

Cashea se congela: se reclasifica de "spec" a **diseño de referencia condicional**. No se
implementa una línea de código de integración este trimestre. Lo único que sobrevive es una
llamada: averiguar si existe un humano en Cashea con quien hablar de partnerships. Su
esqueleto técnico sí se construye, como capa genérica de canje con un solo provider real:
`ManualFulfillment`.

### Los cinco choques, resueltos

| Choque | Quién gana | Resolución |
| :--- | :--- | :--- |
| **"Ser cobrables": ¿foso o condición de acceso?** (CMO vs LR) | Ninguno del todo | *"Cobrar en USDT no es foso: es la cerradura de la puerta. Pero 'nadie con capital construye aquí' tampoco es foso: es una ventana, y las ventanas se cierran. **El único foso acumulable es el dato propietario: qué beneficio mueve qué comportamiento, por rol y por empresa, medido en el tiempo.** Eso no se copia con una integración."* |
| **Default del pool en $0** (CMO vs CFO) | CFO en el contrato, CMO en el producto | Pool línea aparte, default $0. Pero **un workspace no se considera lanzado sin 3 Intrarrecompensas de tiempo activas y al menos un canje ejecutado** — gate medible, no paso de onboarding. *"La respuesta al riesgo del CMO es tiempo, que no cuesta caja, no dinero, que sí la cuesta."* |
| **Posicionamiento maestro** | **CMO, completo** | **"Sistema de Beneficios por Desempeño".** "Work OS gamificado" muere como posicionamiento maestro; sobrevive como descriptor de la experiencia dentro del producto. *"Vendemos gestión de beneficios; entregamos un juego."* |
| **CRDT / offline** (CTO vs CFO) | CTO en la razón, CFO en el calendario | **No se implementa offline este trimestre.** Pero el modelo de eventos nace **append-only e idempotente desde el día uno**, para que el offline sea después una decisión de UI y no una reescritura. Cero Yjs, cero OT, jamás. |
| **Chile vs Venezuela** | **Venezuela** | *"La tesis del producto — la compensación real se paga en beneficios porque el salario nominal es simbólico — solo es cierta en Venezuela. En Chile competimos contra Buk, Rankmi y Monday sin una sola razón para que nos elijan."* Base1 y Agencia Salvaje **no se descartan**: se atienden con el producto tal cual, se les cobra en USD. **Son caja, no norte.** Cero roadmap dedicado. |

### Las 6 decisiones firmes

| # | Decisión | Dueño | Fecha |
| :-- | :--- | :--- | :--- |
| **D-1** | Cashea reclasificada a diseño de referencia condicional + intento formal de contacto documentado | GS | 20 ago 26 |
| **D-2** | Venezuela es el ICP; Chile es caja sin roadmap. Todo documento, deck y backlog se reescribe bajo este supuesto | CEO / CMO | 13 ago 26 |
| **D-3** | Purga de claims + nuevo posicionamiento publicado | CMO | 3 sep 26 |
| **D-4** | Capa genérica de canje: ledger doble entrada, estado INDETERMINATE, outbox, asientos compensatorios, endpoint de reconciliación, provider `ManualFulfillment`. Incluye **reset a cero de saldos de Oro de localStorage** (no se heredan como canjeables), backups probados y gestión de secretos | CTO | Hito 1: 20 sep · Hito 2: 4 nov 26 |
| **D-5** | Voz de cliente: 20 entrevistas con PyMEs de Caracas/Valencia + teardown de Fina + Programa Fundadores cerrado | GS + CMO | 15 oct 26 |
| **D-6** | Dictamen escrito de abogado laboral venezolano sobre Intrarrecompensas (LOTTT) + ratificación por escrito de la arquitectura B del pool | CFO | 30 sep 26 |

### Lo que NO vamos a hacer

- ❌ **Integración con Cashea.** Sin sandbox ni contrato, es código contra una API imaginaria.
- ❌ **Pool prefondeado (arquitectura A).** Muerto, no se revisa este año.
- ❌ **Screening OFAC propio.** Si algún día toca, se subcontrata.
- ❌ **Offline-first, CRDTs de texto, OT.** No caben en 18h/semana.
- ❌ **Daycohost y todo claim de infraestructura.** No tenemos infraestructura.
- ❌ **Una segunda web/deck para Chile.** Un solo posicionamiento.
- ❌ **Ratificar $8/usuario.**
- ❌ **Contratar.** No hay caja y no hay qué delegar todavía.

### La secuencia de 90 días

| Quincena | Qué pasa |
| :--- | :--- |
| **Q1 · 6–19 ago** | Decisión Venezuela comunicada y aplicada al corpus. Contacto a Cashea enviado. Inventario de claims falsos. Lista de 40 PyMEs objetivo. |
| **Q2 · 20 ago–2 sep** | Reset de saldos de Oro. Backups + secretos. Esquema de ledger en papel y migración diseñada. Primeras 6 entrevistas. Teardown de Fina. |
| **Q3 · 3–16 sep** | Nueva web y deck "Sistema de Beneficios por Desempeño" en vivo. Backend mínimo: auth + persistencia de misiones (**fin de localStorage**). Entrevistas 7–14. |
| **Q4 · 17–30 sep** | Ledger implementado con outbox e INDETERMINATE. Dictamen legal LOTTT. Arquitectura B ratificada por escrito. Entrevistas 15–20. |
| **Q5 · 1–14 oct** | `ManualFulfillment` + máquina de estados de canje. Programa Fundadores cerrado con contratos de línea base. "Levelop usa Levelop" público. |
| **Q6 · 15–28 oct + cierre 4 nov** | Onboarding de las primeras cuentas Fundadoras con 3 Intrarrecompensas activas y un canje real ejecutado. Cobro manual por transferencia/USDT. |

> **Lo que no cabe, y el CEO lo dice explícitamente:** offline, Cashea, billing automatizado,
> multi-tenant robusto, app móvil e IA. *"El cobro será manual y feo durante todo el
> trimestre. Está bien."*

### La pregunta que le quita el sueño al CEO

> **¿El dueño de una PyME venezolana pagará en dólares por un software que decide quién se
> gana los beneficios — o repartirlos a dedo es exactamente el poder que no piensa ceder?**
>
> *Si es lo segundo, no tenemos un problema de producto, de precio ni de Cashea: tenemos un
> comprador que no existe.*

---

## LO QUE ESCALA A ALIM

*(replicado en el Dashboard, columna "Esperando a Alim")*

| # | Decisión que se te pide | Opciones | Recomendación del CEO |
| :-- | :--- | :--- | :--- |
| **A-1** | **Pivote de mercado a Venezuela** | (a) Venezuela ICP + Chile como caja — foso narrativo real, cero clientes hoy · (b) Chile ICP — dos leads calientes, cero diferenciación, competencia con capital | **(a)** — único mercado donde nuestra tesis es verdadera |
| **A-2** | **Precio** | (a) publicar $79/15 asientos +$4 · (b) mantener $8/usuario · (c) no publicar precio hasta 10 entrevistas | **(a)**, sin contratos >12 meses hasta conocer el costo de inferencia por usuario |
| **A-3** | **Desembolso real ~$400–900** (abogado laboral venezolano + backups + gestor de secretos) | Aprobar todo / solo legal / nada | **Aprobar el legal íntegro.** Sin él, las Intrarrecompensas son un pasivo laboral no cuantificado |
| **A-4** | **Programa Fundadores** | (a) 10 empresas gratis · (b) 5 gratis con línea base medida y derecho a publicar · (c) 3 pagando $79 desde el día uno | **(b)** — diez no los soporta una persona |
| **A-5** | **Bus factor = 1** | (a) socio técnico con equity · (b) documentar, backups y aceptar el riesgo 12 meses | **(b)** ahora; el equity es caro cuando aún no sabes qué estás construyendo |

---

## TAREAS DERIVADAS DE ESTA MESA

`LVL-001` a `LVL-029` — registradas en el Dashboard y ruteadas a cada agente por su canal
radial con la EA. Ver `Executive Assistant/LEVELOP - OPS Dashboard.html`.

---
*Acta levantada por la Executive Assistant · 06 Ago 2026*
