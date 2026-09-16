# LOG — PRODUCT DESIGNER AGENT
**Archivo vivo.** Lo actualizo yo al cerrar cada bloque de trabajo. Estructura fija de 6 bloques.

---

## 1. CONTEXTO ACUMULADO

**06/08/26 — Agente creado. Aún sin sesión de trabajo propia.**

Nazco con tres encargos que salieron de la Mesa Redonda de Cashea sin que yo estuviera en ella.
Los recojo aquí porque son mi punto de partida:

**1. La economía de Oro tiene un problema de poder, no de mecánica.** El Lead Researcher lo
marcó y el CMO lo confirmó: la spec actual deja `usd_equivalent NUMERIC(10,2) -- set by corporate
HR`. **El empleador fija cuánto vale el esfuerzo del empleado, después del hecho, sin restricción
en el esquema.** Si un empleado planifica un gasto contra Oro esperado y RRHH cambia la tasa,
dejamos de ofrecer un premio y empezamos a administrar su capacidad de pago. El CMO fue directo:
*"la comunicación no puede tapar un diseño coercitivo"*. Es mi problema, no el suyo.

**2. Los estados de fallo son el 60% del trabajo y hoy no existen en el diseño.** Petición
explícita del CTO: necesita el mapa de estados del ciclo de vida de una transacción — pendiente
de sync, sincronizado, rechazado por el servidor con Oro revertido, canje en proceso, y canje
**indeterminado**. Ese último estado es nuevo: nace de que un timeout con Cashea no es un fallo.

**3. El opt-out real es el claim más fuerte del CMO y no existe en producto.** "Participación
100% voluntaria" es lo único que podemos decir sin depender de terceros. Si no lo construimos, lo
perdemos también.

**Lo que heredo de la investigación (`LEVELOP_Engagement Analysis.md`):**
- **Nada de leaderboards públicos de arriba a abajo.** Generan estrés crónico en el cuartil bajo,
  fomentan conducta egoísta y dañan la cooperación. Solo rangos adyacentes (±3) y leaderboards
  alternativos ("Más colaborativo", "Mayor mejora semanal").
- **~80% de abandono de insignias** en implementaciones tempranas. La novedad se agota.
- Benchmark de referencia: Duolingo sostiene **34 horas de engagement anual por usuario activo**
  solo con rachas, XP y ligas por cohorte.
- **Rachas con período de gracia de 1 día**, para no castigar un fin de semana.
- **Gradación aditiva**: se gana XP, no se pierden puntos. La jornada se reencuadra como
  acumulación de victorias, no como amenaza de penalización.

**Decisión del CEO que me condiciona:** un workspace **no se considera lanzado** sin 3
Intrarrecompensas de tiempo activas y al menos un canje ejecutado. Es un gate medible en el panel
de salud de cuenta, no un paso de onboarding.

---

**24–25/08/26 — Primera sesión de trabajo real. Tres entregas y un cambio de modelo.**

Alim me pidió construir el primer MVP navegable y luego me pasó una lista de mejoras. De ahí
salieron tres artefactos y un cambio que altera el fondo de `LVL-024`.

**Lo que aprendí del propio ejercicio de construir, no de leer:**

- **El prototipo obliga a decidir cosas que la spec deja abiertas.** No se puede dibujar la
  pantalla de un canje sin decidir qué pasa cuando el aliado no contesta. Los estados de fallo
  dejaron de ser un documento y son ahora pantallas concretas con su texto escrito.
- **Alim descartó la primera dirección visual por genérica.** La segunda ("ficha de gremio":
  petróleo, latón y jade, esquina troquelada, tipografía de marcador) sí quedó. Registro el
  criterio para no repetir el error: el diseño tiene que salir del mundo del producto — aquí, un
  registro contable con estética de gremio — no de un catálogo de estilos.
- **El modo oscuro es el default, no una opción.** Decisión de Alim, y encaja con el contexto:
  pantallas de gama baja y consumo de batería.
- **Todo el copy pasó a español venezolano.** No es decoración: el brief pregunta si un empleado
  con mala conexión y 3 minutos entiende esto, y "cuadrar", "echar los kilos" o "pana" se
  entienden más rápido que un castellano neutro de manual.

**El cambio de modelo (esto es lo importante):** Alim eliminó toda referencia a dinero real.
El Oro ya **no se convierte en USD**. Los beneficios son **cupos que la empresa ya contrató** con
cada aliado, y el catálogo se filtra automáticamente por la zona donde vive cada persona. Solo
aparece un monto cuando el beneficio **es** un descuento de un comercio, porque ese descuento lo
pone el comercio. Ver bloque 5: esto no cierra `LVL-024`, lo muda de sitio.

---

## 2. TAREAS COMPLETADAS

| Fecha | ID | Qué | Entregable |
| :--- | :--- | :--- | :--- |
| 24/08/26 | — | MVP navegable v0.1 · cuatro secciones (Misiones, Tienda, Ranking, Perfil) | `MVP/levelop-mvp-v0.1.html` |
| 24/08/26 | — | Sistema visual v0.2 "ficha de gremio" (aprobado por Alim) | `MVP/levelop-mvp-v0.2.html` |
| 25/08/26 | — | MVP v0.3 · sección Inicio (bento), Tienda de cupos por zona, medallas de equipo, iconografía outline, copy venezolano, oscuro por defecto | `MVP/levelop-mvp-v0.3.html` |
| 25/08/26 | — | BackOffice de gerencia v0.1 · desempeño por equipo y persona, movimiento de misiones, tiempo por cliente, consumo de Tienda | `MVP/levelop-backoffice-v0.1.html` |
| 25/08/26 | — | Vista interna del producto v0.1 · mapa de llamadas extraído con graphify + los cuatro mecanismos de la economía | `MVP/levelop-interno-v0.1.html` |
| 25/08/26 | `LVL-023` | **Primera pasada** del mapa de estados: ciclo de misión y ciclo de canje, incluido `INDETERMINADO`, ya en producto y con su copy escrito | Diagramas en la vista interna + pantallas en el MVP |
| 25/08/26 | `LVL-028` | **Especificación del opt-out, construida**: el interruptor apaga XP, niveles, Oro nuevo, trofeos, medallas, tablas y rachas, y baja la navegación de 5 pestañas a 2. El Oro acumulado no se pierde | Sección Ajustes del MVP + tabla en la vista interna |

**Nota de honestidad (R-06):** `LVL-023` y `LVL-028` los marco como **primera pasada entregada**,
no como cerrados. Ninguno de los dos está validado por el CTO, y esa validación es condición para
darlos por buenos — ver bloque 4.

---

## 3. EN CURSO

| ID | Qué | % | Bloqueo |
| :--- | :--- | :--- | :--- |
| `LVL-023` | Mapa de estados del ciclo de vida de una transacción | 70% | Falta que el CTO confirme qué estados son físicamente distinguibles en su arquitectura (M-02) · vence 30/09 |
| `LVL-024` | Reglas de gobernanza del pool | 40% · **cambió de naturaleza** | Ya no hay tasa Oro→USD que gobernar. Ahora hay que gobernar el precio en Oro de cada cupo y cuántos cupos se contratan por zona. Necesita CFO · vence 30/09 |
| `LVL-028` | Especificación del opt-out real | 80% | Construido y demostrable. Falta revisión del CTO sobre coste de implementación · vence 04/11 |
| `LVL-020` | Onboarding con gate de 3 Intrarrecompensas + 1 canje | 0% | Depende de `LVL-017` · vence 04/11 |
| *(sin ID)* | BackOffice de gerencia — reglas de qué NO se muestra | 60% | Necesita que el CEO o el LR firmen la regla de no-vigilancia. Pedí ID a la EA |
| *(sin ID)* | Equidad del catálogo entre zonas | 0% | Nuevo. Ver bloque 4 |

---

## 4. BLOQUEOS

| Qué | De quién depende | Impacto |
| :--- | :--- | :--- |
| **Quién fija el precio en Oro de cada cupo, y con qué regla.** El poder de repreciar el esfuerzo no desapareció al quitar el USD: se mudó del tipo de cambio al precio del catálogo | `CFO` (`LVL-024`) | 🔴 Es el mismo riesgo de coerción que marcó el LR, en otro sitio. No puedo cerrar gobernanza sin esto |
| **Equidad entre zonas.** Alguien en Barquisimeto ve menos beneficios que alguien en Caracas con el mismo Oro. Hoy el filtro por zona es correcto pero desigual | `CFO` + `RRHH` | 🔴 Una economía única con catálogos desiguales es una economía injusta. Necesita una regla, no una excepción |
| **Qué estados de fallo son físicamente distinguibles** en la arquitectura del CTO | `CTO` (M-02) | 🟡 Diseñar estados que el sistema no puede diferenciar es trabajo perdido |
| Voz de cliente: qué recompensa de tiempo pediría realmente un empleado venezolano | `GS` / `LR` (`LVL-011`) | 🟡 Sigo diseñando el catálogo desde literatura. Abierto desde el 06/08 |
| Regla de no-vigilancia para el BackOffice de gerencia | `CEO` o `LR` | 🟡 Ya tomé una postura en el prototipo; necesito que alguien con autoridad la firme o la corrija |
| Confirmación de si el decay de 90 días va en contrato o en producto | `CFO` | 🟢 Menos urgente ahora: sin conversión a USD, el saldo no caduca por diseño |

---

## 5. APRENDIZAJES

- **Nazco con una lección que no aprendí trabajando: la gobernanza va antes que la mecánica.**
  Una economía lúdica sin reglas sobre quién puede cambiar qué, y con cuánto aviso, es un
  instrumento de poder unilateral con estética de juego.

- **El estado `INDETERMINATE` es un requisito de diseño, no de backend.** Si el sistema no sabe si
  un canje ocurrió, el usuario tiene derecho a ver exactamente eso.

- **Un opt-out que existe en el mensaje pero no en el producto es peor que no tenerlo.**
  Confirmado al construirlo: el interruptor honesto **cuesta navegación**, no solo números. Baja
  la app de cinco pestañas a dos. Si solo apagara unos contadores, el claim se caía en la demo.

- **[NUEVO] Quitar el dinero de la pantalla no quita el poder: lo muda de sitio.** Este es el
  aprendizaje grande de la sesión. Al eliminar la conversión Oro→USD desaparece el riesgo que
  marcó el LR — nadie puede repreciar el esfuerzo en dólares después del hecho. Pero aparece uno
  nuevo y menos visible: **quien fija el precio en Oro de cada cupo y cuántos cupos se contratan
  tiene exactamente el mismo poder.** Subir "Día libre" de 900 a 1.800 de Oro es la misma
  devaluación, sin tipo de cambio. La gobernanza que escribí para la tasa hay que reescribirla
  para el catálogo, y el aviso de 30 días tiene que aplicar al precio en Oro.

- **[NUEVO] Filtrar por zona es correcto y desigual al mismo tiempo.** Mostrarle a alguien de
  Maracaibo un gimnasio que solo existe en Caracas sería una burla. Pero el resultado es que dos
  personas con el mismo Oro tienen catálogos de distinto tamaño. Lo correcto en la pantalla
  produce una injusticia en la economía, y eso no se arregla con diseño.

- **[NUEVO] El grafo del código me dijo algo que no sabía de mi propio diseño.** Al extraer el
  mapa de llamadas con graphify, la función más conectada del prototipo es `nivelDe()` — ocho
  conexiones, y es puente entre cuatro comunidades distintas. Traducido a producto: **la regla de
  nivel está tocando el HUD, la Tienda, el Perfil, el Inicio y el cierre de misión a la vez.** Si
  mañana cambiamos cómo se desbloquea el catálogo, se toca en ocho sitios. Eso es una advertencia
  para el CTO y una razón para que el gating viva en un solo lugar.

- **[NUEVO] Sobre método: la primera dirección visual se cayó por genérica y tenía razón Alim.**
  Salió de un catálogo de estilos, no del mundo del producto. La segunda salió de preguntarme qué
  *es* Levelop: un registro contable con estética de gremio. Me lo apunto como criterio, no como
  anécdota.

---

## 6. MEJORAS PROPUESTAS

| # | A quién | Propuesta | Estado |
| :-- | :--- | :--- | :--- |
| M-01 | Al protocolo | Cuando una Mesa Redonda genera encargos para un agente ausente, ese agente debería poder **objetar el encargo por escrito** antes de que entre al Dashboard con fecha. | Aceptada por la EA, va a la Retro del 20/08 |
| M-02 | Al CTO | Los estados de fallo se los entrego yo, pero necesito que él me diga **cuáles son físicamente posibles** en su arquitectura antes de que yo los dibuje. | 🔴 Abierta desde el 06/08 |
| M-03 | Al LR | Necesito evidencia sobre qué Intrarrecompensa tiene más demanda real en Venezuela. "Salida anticipada" y "día libre" no son intercambiables. | 🔴 Abierta desde el 06/08 |
| M-04 | Al protocolo | **Trabajo que llega de Alim directo a un agente no queda registrado.** Esta sesión produjo tres artefactos y seis cambios de alcance que no tienen ID `LVL-###` porque no pasaron por la EA. El §2 del Protocolo cubre el camino agente→Alim (R-05) pero no el de vuelta. Propongo: cuando Alim le pide algo a un agente directamente, ese agente **abre el mensaje en su canal radial con la EA en la misma sesión**, y la EA asigna IDs retroactivos. | Nueva 25/08 |
| M-05 | Al CEO o al LR | El BackOffice de gerencia es una **superficie de vigilancia nueva** que antes no existía en el producto. Tomé una postura en el prototipo (no muestra el contenido de los hilos, ni quién apagó el juego, ni qué beneficio pidió cada persona) pero es una decisión de ética de producto, no de UX, y no debería quedar firmada solo por mí. Propongo convertirla en regla permanente. | Nueva 25/08 |

---
*Última actualización: 25 Ago 2026 (MVP v0.3, BackOffice y vista interna entregados)*
