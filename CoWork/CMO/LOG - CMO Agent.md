# LOG — CMO AGENT
**Archivo vivo.** Lo actualizo yo al cerrar cada bloque de trabajo. Estructura fija de 6 bloques.

---

## 1. CONTEXTO ACUMULADO

**06/08/26 — Mesa Redonda de Cashea.**

Entré a defender el mensaje y salí habiéndolo reescrito entero.

**Lo que me quitaron, con razón:** "integración con Cashea", "completar misiones paga tu cuota",
"offline-first total", "Daycohost Tier III", las métricas +85%/+40%/−60%, las cifras de mercado
LATAM y "primer Work OS gamificado tangible del mundo". Siete claims, y ninguno se sostenía.

**Lo que descubrí que tenía y no estaba usando:** la participación 100% voluntaria con opt-out
real es nuestro claim más fuerte y el menos explotado. Y "se paga en USDT y Pago Móvil" convierte
mejor que cualquier cosa que yo hubiera escrito, y no depende del permiso de nadie.

**El reposicionamiento.** Dejamos de vender un Work OS gamificado. Vendemos un
**Sistema de Beneficios por Desempeño**:

> ***"Tus beneficios ya existen. Levelop decide quién se los gana."***

El dolor es documentado y no depende de nadie: en Venezuela la compensación real ya se paga en
bonos y beneficios flexibles, y las empresas los reparten igual al que empuja y al que no.
Nuestro propio análisis lo dice: el ingeniero que trabaja de más recibe exactamente los mismos
beneficios que el que no. **Eso es un problema de asignación, y nosotros somos la infraestructura
de asignación.** Cashea, cuando exista, entra como capítulo cuatro.

**Tres compradores distintos, tres miedos distintos:**

| Audiencia | Mensaje | Miedo que desactivo |
| :--- | :--- | :--- |
| Dueño/CEO PyME | "Tu mejor gente se va a un remoto internacional. Esto hace que quedarse valga algo, sin subir la nómina." | "Otro gasto en dólares que no puedo justificar" |
| Gerente de RRHH | "Dejas de repartir beneficios a ciegas: por primera vez sabes quién se ganó qué, con registro." | "Me pedirán métricas de un programa que no puedo medir" |
| Empleado | "Tu esfuerzo compra tiempo tuyo. Y si no quieres jugar, apagas el juego y sigue siendo tu gestor de tareas." | "Esto es una cámara nueva para vigilarme mejor" |

---

## 2. TAREAS COMPLETADAS

| Fecha | ID | Qué | Entregable |
| :--- | :--- | :--- | :--- |
| 06/08 | `LVL-000` | Auditoría de 10 claims con redacción permitida para cada uno | Mesa Redonda, Posición 4 |
| 06/08 | `LVL-000` | Reposicionamiento a "Sistema de Beneficios por Desempeño" + claim central + 3 mensajes de soporte | Mesa Redonda, Posición 4 (aprobado por el CEO) |
| 06/08 | `LVL-000` | Arquitectura de mensaje por audiencia (3 compradores) | Mesa Redonda, Posición 4 |
| 06/08 | `LVL-000` | Seis reglas éticas de comunicación, vinculantes | Mesa Redonda, Posición 4 |

---

## 3. EN CURSO

| ID | Qué | % | Bloqueo |
| :--- | :--- | :--- | :--- |
| `LVL-004` | Inventario de dónde están publicados los claims falsos (web, deck, PDFs, LinkedIn) | 10% | — · vence 13/08 |
| `LVL-005` | Purga de claims + nuevo posicionamiento publicado | 0% | Depende de `LVL-004` · vence 03/09 |
| `LVL-012` | Nueva web y deck maestro único | 0% | 🟡 **Alim (A-2)** — el precio va en el deck · vence 16/09 |
| `LVL-019` | "Levelop usa Levelop": diario público de uso propio | 0% | — · vence 14/10 |

---

## 4. BLOQUEOS

| Qué | De quién depende | Impacto |
| :--- | :--- | :--- |
| Calculadora de ROI pública y editable | `CFO` (`LVL-021`) | 🟡 Sin ella, 73,8% es un número que no puedo usar sin quemar credibilidad |
| Fecha comprometida del opt-out real del layer gamificado | `CTO` + `PD` (`LVL-028`) | 🔴 Es mi claim más fuerte y el único que no depende de terceros. Si no existe en producto, lo pierdo también |
| Costo de rotación local | `LR` (`LVL-025`) | 🟡 Sin él no tengo el número que le duele al dueño y me quedo vendiendo sentimiento |
| Precio publicable | Alim (A-2) | 🟡 Bloquea el deck |

---

## 5. APRENDIZAJES

- **Estábamos apostando la única categoría defendible que tenemos a un socio que no nos ha dicho
  que sí.** Todo el eje del posicionamiento colgaba de Cashea. Ninguna arquitectura de mensaje
  debería tener un único punto de falla externo.
- **Publicar `api.cashea.app` y una firma HMAC inventada no es optimismo comercial, es exposición
  legal.** El CTO tiene razón: invita a que Cashea nos lea como suplantación.
- **Le discutí al Lead Researcher que "ser cobrables" fuera un foso** —es una condición de acceso,
  la copia cualquiera en dos semanas— y el CEO nos corrigió a los dos: tampoco lo es "nadie con
  capital construye aquí", que es una ventana y las ventanas se cierran. **El único foso
  acumulable es el dato propietario: qué beneficio mueve qué comportamiento, por rol y por
  empresa, medido en el tiempo.** Eso cambia lo que debo instrumentar desde el día uno.
- **"Aburrido y real" no es sinónimo de "sin posicionamiento", y por poco lo acepto como si lo
  fuera.** Un mensaje honesto todavía necesita una capa de significado encima, o vendemos un
  Trello con Pago Móvil.
- **La comunicación no puede tapar un diseño coercitivo.** Si RRHH puede cambiar la tasa Oro→USD
  unilateralmente, el problema no es de redacción. Le pasé el diseño al PD en vez de intentar
  escribirlo bonito.
- **El plan de cuatro trimestres que tenía en mi briefing (anti-CRDT, OpenBadges, AI-velocity,
  Spotify Wrapped) era para un producto que no tenemos.** Lo maté entero.

---

## 6. MEJORAS PROPUESTAS

| # | A quién | Propuesta |
| :-- | :--- | :--- |
| M-01 | A mí mismo | **Todo claim publicado tiene dueño con nombre y fecha de revalidación.** Un claim es deuda de ingeniería con fecha impuesta desde fuera de ingeniería. |
| M-02 | Al protocolo | Ningún claim técnico sale sin firma del CTO. Lo concedí voluntariamente en la mesa; propongo que sea regla permanente para todos. |
| M-03 | Al CFO | Discuto su default de pool en $0: si arranca en cero, el 80% lo dejará en cero y vendimos un gestor de tareas con puntos. Acepté su formato de precio a cambio del gate de onboarding — **el gate no es negociable para mí.** |
| M-04 | A la EA | Necesito un **registro de claims vivos** como artefacto propio del sistema, no como sección de un doc. Quiero saber en cualquier momento qué estamos afirmando públicamente y quién lo firmó. |
| M-05 | Al GS | Los guiones de las 20 entrevistas los reviso yo antes de que salgan. Si preguntamos mal, tendremos anécdotas en vez de posicionamiento. |

---
*Última actualización: 06 Ago 2026*
