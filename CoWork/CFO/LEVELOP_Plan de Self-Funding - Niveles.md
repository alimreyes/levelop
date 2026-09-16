# PLAN DE SELF-FUNDING — MARKETING, DESARROLLO Y OUTBOUND
**Dueño:** CFO Agent · v1.0 · 07 Ago 2026
**Para:** Alim (decide el nivel) · CEO, CMO, CTO, GS (ejecutan dentro del nivel elegido)
**Principio:** Levelop es y seguirá siendo 100% autofinanciado. No hay ni va a haber por ahora
fondos externos, aceleradoras ni inversión. Todo sale de la caja de Alim o de ingresos reales que
todavía no existen. Ningún nivel es un compromiso de 12 meses — se sube o se baja con evidencia.

---

## Cómo leer este documento

Aplico a mi propio presupuesto la misma regla que le exijo al modelo de ROI de cliente: toda cifra
trae su origen.

- **DATO** — cifra ya aprobada o confirmada (ej. el desembolso A-3).
- **DATO DERIVADO** — calculada a partir de una cifra confirmada.
- **⚠️ ESTIMADO DE MERCADO** — precio de lista público del proveedor típico para este stack. No es
  cotización formal. Sirve para dimensionar el nivel, no para comprometer el gasto.
- **REQUIERE COTIZACIÓN** — no existe cifra real y no la invento.

**Lo más importante que no está en ningún total de este documento:** el costo de inferencia de IA
por usuario/mes (`LVL-022`, del CTO) sigue en 0%. No se puede presupuestar lo que no se puede
medir. Donde la IA toca un nivel, lo marco explícitamente y lo dejo fuera del total hasta que
aterrice.

## Restricciones heredadas (no las decide este plan, las hereda)

- **No contratar este trimestre** (decisión firme del CEO, Mesa Redonda 06/08). Todo gasto de este
  plan es herramientas/infraestructura, no headcount.
- Cobro manual, sin billing automatizado, sin Cashea, sin app móvil este trimestre.
- El pool de recompensas (~$20/empleado) es dinero **del cliente**, no de Levelop — no aparece
  aquí, es parte del modelo de ROI del cliente, no de nuestra propia operación.
- El desembolso **A-3** (~$400–900: abogado laboral venezolano LOTTT + backups probados + gestor
  de secretos) ya fue aprobado por Alim por separado el 07/08. Es real, es de este trimestre, y lo
  cuento en el total — pero es compliance/DR, no marketing/dev/outbound, así que va aparte de los
  4 niveles.

---

## Los 4 niveles — resumen para decidir

| Nivel | Mensual recurrente | Qué compra | Cuándo activarlo |
| :--- | :--- | :--- | :--- |
| **0 — Bootstrap puro** | $0–35 | Solo lo gratuito. Todo manual. | Piso absoluto si la caja es cero |
| **1 — Operación mínima viable** | $120–180 | Infra estable + higiene de due diligence + presencia mínima | **✅ CONFIRMADO por Alim — 07 Ago 2026** |
| **2 — Tracción inicial** | $350–500 | Primer presupuesto de ads + CRM real + prospección con herramientas | Solo con evidencia (gate abajo) |
| **3 — Acelerado / reinversión** | Variable (% de MRR) | Escala con ingresos reales, no con la caja de Alim | Solo tras clientes pagando |

---

## NIVEL 0 — Bootstrap puro

| Categoría | Incluye | Costo | Origen |
| :--- | :--- | :--- | :--- |
| Desarrollo | Hosting frontend en tier gratuito (Vercel/Netlify free) · DB en free tier (Neon/Supabase free) o localStorage como hoy | $0 | ⚠️ ESTIMADO DE MERCADO |
| Marketing | Contenido orgánico en LinkedIn personal, cero diseño pagado (Canva free), cero ads | $0 | — |
| Outbound | 100% manual: WhatsApp personal + LinkedIn personal + Google Sheet como CRM | $0 | — |
| Dominio | Ya registrado (costo hundido, no es gasto nuevo) | $0–3/mes prorrateado | DATO si ya está pagado |

**Total: $0–35/mes.**

**El riesgo real de este nivel:** sin backups probados, sin monitoreo de errores, sin gestor de
secretos, seguimos exactamente en el escenario que el CTO marcó como el que **mata deals en due
diligence** — bus factor = 1 y cero DR. Este nivel es aceptable como piso, no como destino. Deja
de tener sentido en cuanto A-3 se ejecute.

---

## NIVEL 1 — Operación mínima viable (recomendación del CFO para empezar hoy)

| Categoría | Incluye | Costo | Origen |
| :--- | :--- | :--- | :--- |
| Desarrollo | Postgres gestionado tier bajo (Neon Launch / Supabase Pro) | $25/mes | ⚠️ ESTIMADO DE MERCADO |
| Desarrollo | Monitoreo de errores básico (Sentry Developer/Team) | $0–26/mes | ⚠️ ESTIMADO DE MERCADO |
| Desarrollo | Gestor de secretos (Doppler free tier o variables cifradas) | $0 | ⚠️ ESTIMADO DE MERCADO |
| Desarrollo | Hosting frontend tier pago bajo si el free tier no aguanta demos con clientes reales | $7–20/mes | ⚠️ ESTIMADO DE MERCADO |
| Marketing | Email profesional (Google Workspace/Zoho) | $6/mes | ⚠️ ESTIMADO DE MERCADO |
| Marketing | Canva Pro para material comercial | $13/mes | ⚠️ ESTIMADO DE MERCADO |
| Outbound | WhatsApp Business Cloud API — gratis hasta 1.000 conversaciones/mes | $0 | ⚠️ ESTIMADO DE MERCADO |
| Outbound | CRM ligero gratuito (HubSpot Free / Airtable Free) para las 40 PyMEs objetivo y las 20 entrevistas | $0 | ⚠️ ESTIMADO DE MERCADO |

**Total recurrente: $120–180/mes.**
**Más el A-3 ya aprobado (~$400–900, one-time, compliance/DR — no recurrente).**

**Por qué este es mi piso recomendado, no el 0:** el LR y el CTO ya señalaron el mismo riesgo desde
ángulos distintos — sin backups probados ni monitoreo, no somos defendibles ante el primer
comprador serio que pregunte en due diligence. Este nivel es el costo de dejar de ser
indefendibles, no el costo de crecer. Cabe sin tocar el presupuesto de marketing/ads.

---

## NIVEL 2 — Tracción inicial (gateado por evidencia, no por fecha)

| Categoría | Incluye | Costo | Origen |
| :--- | :--- | :--- | :--- |
| Desarrollo | Sube el tier de Postgres/hosting para soportar Fundadores reales | $50–80/mes | ⚠️ ESTIMADO DE MERCADO |
| Marketing | Primer test de ads Meta/Google geolocalizado Caracas/Valencia | $100–150/mes | ⚠️ SUPUESTO — presupuesto de prueba, no dato de performance |
| Marketing | Apoyo freelance puntual de diseño/contenido | $50–100/mes | ⚠️ ESTIMADO DE MERCADO |
| Outbound | LinkedIn Sales Navigator Core, para prospección de GS | $99/mes | ⚠️ ESTIMADO DE MERCADO |
| Outbound | CRM pago si Airtable/HubSpot free se queda corto | $20–40/mes | ⚠️ ESTIMADO DE MERCADO |

**Total: $350–500/mes.**

**Gate de entrada — condición, no calendario:** subo a este nivel solo cuando pase una de dos
cosas: **(a)** al menos un Fundador firmado con contrato de línea base (`D-5`/`LVL-018`), o **(b)**
≥12 de las 20 entrevistas de descubrimiento confirman que existe presupuesto real de beneficios en
el ICP. Gastar en ads antes de esa señal es exactamente la apuesta que ya vetamos en el precio: *"un
precio que solo cierra en el escenario optimista no es un precio, es una apuesta"* — lo mismo
aplica a un presupuesto de marketing que se gasta antes de saber si hay comprador.

---

## NIVEL 3 — Acelerado / reinversión (financiado por ingresos, no por la caja de Alim)

Este nivel **no es autofinanciamiento de Alim** — es reinversión de ingresos reales, que sigue
siendo self-funding en el sentido de "sin capital externo", pero con una fuente distinta.

- **Regla propuesta:** reinvertir 20–30% del MRR mensual en marketing + outbound hasta alcanzar
  ≥5 clientes pagando; revisar la regla en ese punto.
- Incluye, cuando exista: el costo real de inferencia de IA por usuario/mes (`LVL-022`) — hoy
  **REQUIERE COTIZACIÓN**, no es presupuestable todavía.
- Incluye la posibilidad de un contratista puntual (no headcount fijo) para outbound o soporte —
  esto **cambia la regla vigente de "no contratar"** y requeriría sign-off explícito del CEO, no
  solo mío.

No pongo un techo mensual a este nivel porque no debería estar acotado por mi caja: debería estar
acotado por cuánto ingreso real estamos dispuestos a reinvertir versus retirar.

---

## Recomendación del CFO

**Empezar en Nivel 1 hoy.** Cubre exactamente lo que el CTO y el LR ya identificaron como el
riesgo que mata deals — sin tocar el presupuesto de marketing o ads. **No saltar a Nivel 2** hasta
tener la señal de las 20 entrevistas (`D-5`, vence 15 oct) o el primer Fundador firmado. Gastar en
adquisición antes de validar que hay comprador dispuesto a pagar sería repetir, con caja real, el
mismo error que casi cometemos con el precio de $8/usuario.

**Total estimado del resto del trimestre (ago–4 nov, ~3 meses) en Nivel 1:**
$360–540 recurrente + $400–900 de A-3 (ya aprobado) = **~$760–1.440 en total hasta el cierre del
trimestre.**

**Esto se revisa en dos momentos:** cuando `LVL-022` aterrice (cambia Desarrollo y potencialmente
Marketing en los niveles 2–3), y en la Sprint Review de cierre de trimestre del 4 de noviembre.

---

## Apéndice — Financiamiento externo futuro (investigación, no acción de esta ronda)

Alim pidió, aparte de este plan, tener a mano investigación e ideas sobre financiamiento externo
para cuando aplique — aunque hoy no estemos buscándolo activamente. Esto es investigación propia
del CFO vía búsqueda web el 07/08/26, **no pasó por el Lead Researcher** — si se usa en cualquier
material externo, necesita su firma primero (regla R-01).

### Lo que existe y es relevante a nuestra geografía

| Vía | Qué es | Nota relevante para Levelop |
| :--- | :--- | :--- |
| **Founder Institute Venezuela/Caracas** | Programa pre-seed, cuota de entrada baja (~$175–199), no invierte capital directo: cada egresado aporta 2,5% de equity en warrants a un Equity Collective a 15 años | Es red y mentoría, no cheque. Barrera de entrada baja. |
| **Wayra Venezuela** (Telefónica/Movistar) | Aceleradora corporativa activa en el país | Encaja si buscamos distribución vía telco, no solo capital |
| **Endeavor Catalyst** | Respalda startups venezolanas — pero en etapa de **scale-up**, con tracción ya demostrada | No aplica hoy; posible a 12–18 meses si hay tracción real |
| **Venezuela Tech Week** | Evento anual que conecta founders venezolanos con capital global (700+ participantes, 50 países en 2026) | Es networking/pipeline, no financiamiento en sí — útil para mapear inversionistas antes de necesitarlos |

### Fondos regionales seed/pre-seed (verificar elegibilidad geográfica antes de aplicar)

| Fondo | Cheque típico | Nota |
| :--- | :--- | :--- |
| **Platanus Ventures** (Chile) | ~$200K por 7% equity | Lanzó club de inversionistas en 2026; histórico enfoque LatAm hispanohablante |
| **Magma Partners** | Variable | +125 startups, +$80M desplegados en etapa temprana LatAm |
| **500 Global LatAm Seed Fund IV** | ~$300K por startup | Geografía listada (Costa Rica, Rep. Dominicana, Ecuador, Guatemala, Perú, Uruguay) **no incluye Venezuela explícitamente** — confirmar antes de asumir elegibilidad |
| **Kaszek Ventures** | El fondo de referencia LatAm | Ha frenado el ritmo de inversión y suele entrar en etapas más maduras que la nuestra |
| **Y Combinator** | Variable | El batch LatAm se redujo de 33 (W22) a 1 (W24) — muy competitivo, y su modelo asume mudanza/exposición internacional que choca con la tesis "Venezuela-only" vigente |

### No dilutivo, pero solo cuando haya ingresos

**Revenue-Based Financing (RBF):** financiamiento contra un % de MRR futuro, sin ceder equity.
Requiere típicamente MRR mínimo de referencia (~$10K/mes) para ser elegible — es decir, es una
opción real recién en el **Nivel 3** de este mismo plan, no antes. Proveedores con presencia LatAm
incluyen actores como Vitt.

### Lo que falta investigar (no lo inventé, lo dejo abierto)

Redes de ángeles de la diáspora venezolana — se mencionan en la investigación pero no identifiqué
un fondo o red formal específica. Si el CEO decide que vale la pena perseguir esta vía, es una
tarea natural para el Lead Researcher, no algo que yo deba estimar.

### Mi recomendación de secuencia, no de rechazo

Ninguna de estas vías es una acción de esta ronda. La tesis actual del CEO —Venezuela, validación
con 20 entrevistas, Programa Fundadores— es exactamente el material que cualquier aceleradora o
inversionista va a pedir primero. Mi recomendación: usar el trimestre actual (hasta el 4 de
noviembre) para producir esa evidencia con self-funding puro, y traer la conversación de
financiamiento externo a la Retro de cierre de trimestre — no antes, para no diluir foco ni equity
sobre una tesis que todavía no está probada. La puerta queda documentada y abierta, no cerrada.

---
*Última actualización: 07 Ago 2026 · CFO Agent*
