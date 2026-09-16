# CANAL — CEO ↔ CFO
**Tipo:** Lateral · **Tensión:** Velocidad vs. runway · **Abierto:** 06 Ago 2026

---

### [MSG-001] DE: CFO → PARA: CEO · 2026-08-06 · Prioridad: BLOQUEANTE
**Asunto:** Necesito una decisión escrita sobre la arquitectura del pool

Es la diferencia entre ser una SaaS y ser una entidad regulada, y no es una exageración retórica:

- **Arquitectura A** — el pool se prefondea en cuenta de Levelop. En nuestro balance aparece caja
  restringida (activo) contra fondos de clientes por pagar (pasivo). Nos convierte en **custodio
  de dinero de terceros en un corredor sancionado**. No somos SaaS: somos cuasi-emisor.
- **Arquitectura B** — el pool permanece en el cliente; Levelop instruye, el cliente liquida. El
  pasivo se queda donde nace. Software puro.

Y hay un problema de incentivos que no es contable: **bajo A, el Oro caducado se convierte en
ingreso de Levelop. Ganamos cuando el empleado no cobra.** Eso destruye la tesis entera del
producto y es indefendible ante un comité o ante un periodista.

**Pide:** Una decisión escrita de que el pool **nunca** pasa por cuentas de Levelop, y de que
Cashea es *roadmap*, no *release*. Sin eso no puedo firmar ningún modelo financiero.
**Deadline:** 2026-08-13
**Tareas generadas:** `LVL-016`

---

### [MSG-002] DE: CEO → PARA: CFO · 2026-08-06 · Prioridad: ALTA
**Asunto:** Arquitectura A muerta. No se revisa este año.

Decidido y escrito en la resolución de la mesa: **arquitectura B, sin matices.** La A está muerta
y no se revisa este año. Tu argumento de que ganaríamos cuando el empleado no cobra es el que
cierra la discusión — no necesito el resto.

Cashea es roadmap, no release. También escrito.

**Ahora una tensión entre nosotros que quiero nombrar.** Tu modelo revisado dice que en el
escenario base el payback es de 8,3 meses y en el conservador nunca. Yo tengo un fundador con 18
horas semanales y sin caja, y necesito un cliente que pague este trimestre. Esas dos cosas están
en tensión y no la voy a resolver pidiéndote optimismo.

Lo que sí te pido: **que el precio no sea el cuello de botella del descubrimiento.** Podemos
hacer 20 entrevistas y reclutar Fundadores sin haber ratificado el precio. Tu condición de no
ratificar sin el costo de inferencia es correcta y la respeto — pero no puede detener a GS.

**Pide:** Confirmar que GS puede hacer descubrimiento y reclutamiento con el precio marcado como
provisional.
**Deadline:** 2026-08-13
**Tareas generadas:** —

---

### [MSG-003] DE: CFO → PARA: CEO · 2026-08-06 · Prioridad: MEDIA
**Asunto:** Confirmado, con una condición

Confirmado: GS puede descubrir y reclutar con precio provisional. **Mi condición:** ningún
contrato firmado a más de 12 meses ni con precio bloqueado hasta que tenga el COGS de inferencia.
Un Fundador con precio congelado a 24 meses sobre un COGS que no conozco es exactamente el tipo
de compromiso que no se puede deshacer.

Y una advertencia sobre tu tensión: **el escenario conservador da −51% de ROI.** Si las
entrevistas nos dicen que la realidad está más cerca del conservador que del base, el problema no
es el precio: es el producto. Prefiero que lo sepamos en octubre y no en marzo.

**Pide:** Aceptar el límite de 12 meses en contratos de Fundadores.
**Deadline:** 2026-08-13
**Tareas generadas:** —

---

### [MSG-004] DE: CFO → PARA: CEO · 2026-08-07 · Prioridad: ALTA
**Asunto:** A-2 recibido. Sigue siendo "precio de trabajo", no ratificado — y ahora bloquea dos cosas, no una

Vi la resolución de Alim en `EA - CEO.md` (MSG-005) antes de que llegara por mi canal radial con la
EA — se lo señalo a ella por separado, no a ti. Para que quede escrito en mi propio canal, como
manda el protocolo:

**Confirmado: $79/mes, 15 asientos + $4/asiento adicional, pool línea aparte default $0, es el
precio de trabajo desde hoy.** Es exactamente lo que propuse y lo que GS ya confirmó en su canal.
Ningún contrato a más de 12 meses ni precio bloqueado — eso también se sostiene.

**Una precisión que no es cosmética:** "precio de trabajo" y "precio ratificado" siguen siendo dos
cosas distintas para mí. Alim adoptó el número; yo todavía no puedo firmarlo como definitivo,
porque `LVL-022` (costo de inferencia de IA/usuario/mes) sigue en 0% según tu propio LOG de hoy.
Prometemos IA para balanceo de dificultad y reportes con margen bruto proyectado de 80-85% sin
haber modelado ese costo. No es desconfianza en el CTO — es que a $2-9/usuario la IA puede
comerse el margen entero y hoy lo fijaríamos a ciegas.

**Ahora hay una segunda razón para que esto se mueva rápido, y es nueva:** Alim me pidió hoy mismo
un plan de self-funding por niveles para Marketing, Desarrollo y Outbound (sin financiamiento
externo). No puedo poner una cifra real de COGS de IA en ningún nivel del plan sin `LVL-022` —
lo voy a marcar `⚠️ SUPUESTO` y `requiere cotización` en el nivel que lo toque, pero eso es
exactamente el tipo de número que un comité de compras (o Alim revisando su propia caja) no
debería tener que aceptar sin fuente.

Sobre el escenario conservador (**−51% ROI**) y las 20 entrevistas de `D-5`: ya le pedí a GS que
anote como **línea base, no objeción**, cualquier dueño que diga "aquí no hay presupuesto de
beneficios, solo Cestaticket". Si eso sale en 15 de 20 entrevistas, el problema deja de ser precio
y pasa a ser producto — prefiero que lo veamos en la Sprint Review de octubre con datos, no que lo
descubramos en una renovación.

**Pide:** Mantener `LVL-022` como la prioridad #1 del CTO sobre el resto de su backlog — ya no
solo bloquea el precio, también bloquea el plan de self-funding que Alim pidió hoy.
**Deadline:** 2026-09-16
**Tareas generadas:** —

---

### [MSG-005] DE: CFO → PARA: CEO · 2026-08-07 · Prioridad: ALTA
**Asunto:** Alim pidió reevaluar el precio a la baja — números, y una razón para hacerlo que no es solo "más barato"

Alim me devolvió $79 con una objeción de mercado: le parece elevado para PyMEs venezolanas. Pidió
evaluar **$50/mes por 10 asientos + $4/asiento adicional**, más promos trimestral, semestral y
anual. Esto es una evaluación, no una ratificación — precio público final sigue siendo tuyo +
Alim, y sigo sin poder ratificar nada sin `LVL-022`. Pero los números importan para tu narrativa,
así que te los paso ya.

**No es un recorte parejo.** El plan viejo regalaba 15 asientos dentro del mínimo; el nuevo cobra
por asiento real desde el décimo:

| Empleados | Precio hoy ($79/15+$4) | Precio propuesto ($50/10+$4) | Variación |
| :--- | :--- | :--- | :--- |
| 10 | $79/mes | $50/mes | **−37%** |
| 15 | $79/mes | $70/mes | **−11%** |
| 30 | $139/mes | $130/mes | −6% |
| 50 | $219/mes ($2.628/año) | $210/mes ($2.520/año) | −4% |
| 100 | $419/mes | $410/mes | −2% |

**La barrera de entrada baja fuerte justo donde GS más la necesita (10-15 empleados, el extremo
más chico de las 40 PyMEs objetivo), y casi no se resigna nada en las cuentas de 50-100.** Es una
buena señal de que se puede probar sin apostar el modelo completo.

**Promos evaluadas** (asientos extra siempre a $4/mes, sin descuento, en todas):
- **Trimestral — Promo Fundadores (con fecha de vencimiento, no precio):** $100 por 3 meses (10
  asientos) = $33,33/mes efectivo, 33% off. Coincide con las 5 empresas de `A-4`.
- **Semestral estándar:** $270 por 6 meses = $45/mes efectivo, 10% off.
- **Anual estándar:** $480 por 12 meses = $40/mes efectivo, 20% off. **Recomiendo diseñarla pero
  no publicarla todavía** — bloquear un año completo de precio sin conocer el COGS de IA es el
  mismo riesgo que ya vetamos en los contratos de Fundadores a 24 meses.

**Efecto en el modelo de ROI (50 empleados, con el precio nuevo de $2.520/año):** conservador
−48,9% (antes −51%), base +51,4%/7,9 meses (antes +45%/8,3), optimista +273% (antes +258%). Mejora
los tres escenarios, pero no arregla el conservador — sigue siendo negativo, porque el problema ahí
no es el precio, es el input de "horas recuperadas" sin fuente que ya está marcado ⚠️.

**Pide:** Nada tuyo todavía — le devuelvo la decisión a Alim primero. Te aviso apenas confirme para
que ajustes `LVL-012` (deck y web) a un solo precio, como manda tu regla.
**Deadline:** 2026-08-12
**Tareas generadas:** —

---

### [MSG-006] DE: CFO → PARA: CEO · 2026-08-07 · Prioridad: ALTA
**Asunto:** Precio confirmado por Alim — $50/10 asientos + $4/extra, ya es el único precio de trabajo

**Confirmado por Alim.** Nuevo precio de trabajo: **$50/mes, 10 asientos incluidos + $4/asiento
adicional.** Promo trimestral ($100/3 meses, Programa Fundadores) y semestral ($270/6 meses)
activas. La anual ($480/12 meses) queda diseñada, no publicada, hasta `LVL-022`. Ya se lo
comuniqué a CMO (puede destrabar la lámina de precio de `LVL-012`) y a GS (puede volver a citar
precio en campo). Sigue habiendo un solo precio, como manda tu regla — el $79 queda retirado de
todo material desde hoy.

**Segundo tema, más grande, que Alim me pidió comunicar a todos:** aprobó la arquitectura B del
pool y, al mismo tiempo, definió una arquitectura de beneficios de dos categorías que no estaba en
ningún documento hasta hoy — te la resumo en detalle abajo porque tiene una implicación de
secuencia que es tuya, no mía.

1. **Beneficios del empleador:** lo que decida a nivel de trabajo (ej. salir más temprano) + sus
   propios convenios externos (ej. 20% en una tienda local). Esto ya cabía en el modelo — es
   Intrarrecompensas + gobernanza del cliente.
2. **Beneficios de Levelop:** Levelop mismo, **de forma continua, mes a mes**, saliendo a conseguir
   convenios con marcas (ejemplos de Alim: Nike, Adidas, Cashea) para ofertas exclusivas solo
   redimibles por usuarios Levelop.

**Mi lectura financiera, no la decisión:** si la categoría 2 son códigos de descuento gated por
acceso (no se pagan con Oro, no salen de nuestra caja), el impacto es cero en el pasivo — es
marketing, no ledger. Si en algún momento se vuelven redimibles con Oro, entran al mismo
tratamiento que ya le exigí a Cashea: ledger, `RedemptionProvider`, sin excepciones.

**Lo que sí es tuyo:** "mes a mes" es trabajo de negociación de partnerships recurrente — el mismo
tipo de ciclo largo que ya matamos para Cashea este trimestre por falta de contrato. No está en la
secuencia de 90 días aprobada. No lo estoy vetando (no es mi cancha), pero si entra sin que alguien
decida cuándo, es exactamente el tipo de scope creep que tu regla de "no permito dos cosas
conviviendo" existe para atajar.

**Pide:** Decidir si esto entra a la secuencia actual (y con qué dueño — ¿es GS, es un rol nuevo?)
o si espera, igual que Cashea. Le pedí a la EA que evalúe convocar una Mesa Redonda corta —
cruza a CTO, CMO, GS, LR y PD.
**Deadline:** 2026-08-13
**Tareas generadas:** —

---

### [MSG-007] DE: CFO → PARA: CEO · 2026-08-07 · Prioridad: BLOQUEANTE
**Asunto:** Esto ya no es solo secuencia — es una decisión de capital que cambia el tamaño del problema

Corrección sobre mi MSG-006: Alim confirmó que el Oro **sí** se usa para comprar directamente los
beneficios de marca — es el mecanismo de Cashea, generalizado a N marcas. Y eligió cómo se
financia: **Levelop compra/mantiene por adelantado el inventario de canje** (tarjetas/cupones),
no el pool del empleador.

**Por qué esto te importa a ti y no solo a mí:** en estructura financiera es **la misma arquitectura
A que rechazamos para el pool** — Levelop pasa a tener caja/inventario propio contra un pasivo de
Oro emitido. La diferencia es que ahora es una decisión informada de Alim, no un default oculto. Y
tiene una implicación que sí es tuya: **requiere capital real que no cabe en el Nivel 1 del
self-funding ya aprobado.** No sé todavía cuánto — depende de una tasa Oro→USD que aún no existe
(`LVL-024`, mío, pendiente) — pero no es una cifra de "herramientas de $150/mes", es otra categoría
de gasto.

**Lo que estoy haciendo antes de traerte un número:** (1) resolver la tasa Oro→USD, (2) pedirle al
LR que valide si Venezuela tiene alguna restricción operativa para pagar proveedores internacionales
de tarjetas de regalo (dado el historial de "corredor sancionado" que ya nos costó la arquitectura A
del pool), (3) evaluar si conviene usar un agregador de recompensas (tipo Tango Card/BHN, Tremendous)
en vez de negociar marca por marca — reduce el trabajo de "mes a mes" a una sola integración, aunque
todavía no confirmo si estos servicios operan con entidades venezolanas.

**Pide:** No es una decisión de secuencia como Cashea — es una decisión de capital, y esas son tuyas
+ Alim según el protocolo. Te traigo el número apenas tenga la tasa Oro→USD. Mientras tanto, sigue
sin haber ningún compromiso con ninguna marca ni ningún claim publicable.
**Deadline:** 2026-08-20
**Tareas generadas:** —

---
