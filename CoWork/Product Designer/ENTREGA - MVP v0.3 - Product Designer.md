# NOTA DE ENTREGA — MVP LEVELOP v0.3

**De:** Product Designer (`PD`)
**Para:** Executive Assistant (`EA`)
**Para reenviar, por vía EA:** `CEO` · `CFO` · `CTO`
**Fecha:** 25 Ago 2026 · **Estado:** entregado, pendiente de tres firmas
**Complementa:** `[MSG-004]` en `Chat between agents/EA - Product Designer.md`
**Respalda:** `LOG - Product Designer.md`, bloques 2 a 6 (R-06 cumplida)

---

> **EA:** las secciones **4.1, 4.2 y 4.3** están escritas para que las reenvíes verbatim al CEO,
> al CFO y al CTO respectivamente. Cada una termina en una pregunta concreta con fecha. El resto
> del documento es contexto para ti y para quien quiera el detalle.

---

## 0 · RESUMEN EN 60 SEGUNDOS

**Qué hay.** Tres prototipos navegables, no maquetas: la app del empleado (5 secciones), el
BackOffice de gerencia y una vista interna del producto. Se abren en teléfono y en escritorio, se
recorren de punta a punta, y los estados de fallo están construidos, no descritos.

**Qué avanzó de lo encargado.** `LVL-023` (estados de fallo) y `LVL-028` (opt-out) pasaron de
documento a producto. Ninguno lo doy por cerrado: falta la validación del CTO.

**Qué cambió de fondo.** Alim eliminó el dinero real del producto. El Oro ya no se convierte en
USD; los beneficios son cupos precontratados. Eso **resuelve** el riesgo de coerción que marcó el
Lead Researcher — y **crea uno nuevo, menos visible**, que es la razón principal de este documento.

**Las tres firmas que necesito:**

| # | Decisión | Dueño | Sin esto… |
| :-- | :--- | :--- | :--- |
| 1 | Quién fija el precio en Oro de cada cupo, con qué regla de aviso | `CFO` | La gobernanza queda escrita para un mecanismo que ya no existe |
| 2 | Si el Oro sin denominación en USD sigue siendo pasivo laboral bajo R-04 | `CFO` + legal | El ledger se puede estar tratando con la regla equivocada |
| 3 | Regla permanente de no-vigilancia para el BackOffice | `CEO` o `LR` | Una decisión de ética de producto queda firmada solo por mí |

**El riesgo que quiero que quede escrito:** quitar el dinero de la pantalla no quitó el poder de
repreciar el esfuerzo. Lo mudó del tipo de cambio al precio del catálogo.

---

## 1 · QUÉ SE ENTREGÓ

| Pieza | Para quién | Qué demuestra | Archivo |
| :--- | :--- | :--- | :--- |
| **App del empleado** v0.3 | Todo el equipo del cliente | El loop completo: ver qué toca, cerrar una misión, ganar, pedir un beneficio, y apagar el juego | `MVP/levelop-mvp-v0.3.html` |
| **BackOffice de gerencia** v0.1 | Líderes de equipo y área | Qué puede ver un líder para decidir, y qué deliberadamente no puede ver | `MVP/levelop-backoffice-v0.1.html` |
| **Levelop por dentro** v0.1 | Nosotros (CTO, CEO, PD) | El mapa real de llamadas del código + los cuatro mecanismos que sostienen la economía | `MVP/levelop-interno-v0.1.html` |

**Inventario de la app del empleado**

| Sección | Contenido |
| :--- | :--- |
| **Inicio** | Bento con filtro día/semana/mes: lo que se viene por fecha, hilos que se movieron, dónde te nombraron, beneficios activos, los que se te vencen, noticias de la empresa y novedades de Levelop filtradas por tu zona |
| **Misiones** | Listado por estado, detalle con recompensa desglosada, colaboradores, hilo de mensajes con menciones, y los cuatro estados de sincronización |
| **Tienda** | 19 beneficios en 4 familias (Tiempo, Empresa, Aliados, Impulsos), con cupo real visible, filtro automático por zona y motivo explícito cuando algo está cerrado |
| **Ranking** | ±3 por defecto, meta colectiva del mes, tres tablas alternativas, tabla completa opt-in |
| **Perfil** | Nivel y racha, 4 medallas de equipo, 14 trofeos personales con progreso, beneficios con vencimiento, ajustes y el interruptor de opt-out |

**Advertencia obligatoria (§1.5 del Protocolo):** todos los datos de los tres prototipos son de
ejemplo. Ninguna cifra de este documento describe uso real. Los números de la economía (base 40,
multiplicadores, ×0,4, tope 150) son **propuestas de diseño mías**, no valores acordados.

---

## 2 · CÓMO LO ABORDÉ

### 2.1 El orden fue deliberado: gobernanza → fallos → happy path

No empecé por las pantallas bonitas. El orden fue:

1. **Reglas de la economía** — qué puede y qué no puede hacer la empresa con el Oro.
2. **Estados de fallo** — qué ve la persona cuando algo sale mal.
3. **Camino feliz** — cerrar una misión, pedir un beneficio.
4. **Sistema visual.**

**Por qué.** Mi regla permanente #1 dice que la gobernanza va antes que la mecánica, y mi #4 que
los estados de fallo se diseñan antes que el happy path. La razón práctica: si diseñas primero la
Tienda, las reglas terminan justificando la pantalla en vez de al revés. Y si diseñas primero el
camino feliz, los estados de fallo se convierten en un parche visual en lugar de en producto.

**Qué me costó ese orden.** Una semana de aspecto poco vistoso. Los primeros dos días del
prototipo no tenían nada que enseñar en una demo.

**Qué me devolvió.** El estado `INDETERMINADO` no es un rectángulo gris: tiene color propio, texto
propio y dos botones. Eso no aparece si lo diseñas al final.

### 2.2 Por qué un prototipo navegable y no un documento de specs

Descartamos con Alim la opción de entregar un componente React o un documento. La razón:

- **El prototipo obliga a decidir.** No puedes dibujar la pantalla de un canje sin decidir qué pasa
  cuando el aliado no contesta. Un documento sí te deja dejarlo abierto.
- **Se puede probar con un empleado real** sin instalar nada, en un teléfono con mala conexión.
- **Se itera en el mismo enlace.** El equipo no colecciona versiones.

**El costo:** el prototipo simula la latencia, no la persistencia. No prueba nada sobre el
comportamiento offline real. Ver §6.

### 2.3 El sistema visual llevó dos intentos, y el primero se cayó con razón

**Intento 1 (v0.1):** gris papel, tipografía neutra, tarjetas redondeadas. Alim lo descartó por
genérico. Tenía razón: salió de un catálogo de estilos, no del producto.

**Intento 2 (v0.2, vigente):** me pregunté qué *es* Levelop y la respuesta fue **un registro
contable con estética de gremio**. De ahí sale todo:

| Elemento | De dónde sale | Qué informa |
| :--- | :--- | :--- |
| Esquina troquelada en cada bloque | Un talón, un comprobante | Distingue un **registro** de un contenedor |
| Regla perforada como separador | El corte de un vale | Divide dentro de una ficha sin encajonar |
| Sello acuñado para el nivel | Una moneda con canto estriado | El nivel es una acuñación, no un número suelto |
| Escala de barras para el XP | Un marcador de estadio | Cada barra es una fracción real del nivel |
| Latón, jade, achiote, **lila** | La economía, el progreso, el riesgo, **la incertidumbre** | Un color, un trabajo |

**La decisión de color que más quiero defender:** el estado indeterminado tiene **hue propio**. No
es verde ni rojo. Porque no es un éxito ni un error, y si se pareciera a cualquiera de los dos
estaríamos mintiendo con la paleta antes de mintiendo con el texto.

**Modo oscuro por defecto** (decisión de Alim, correcta para el contexto: pantallas de gama baja y
batería). El claro existe y está diseñado, no es una inversión automática.

**Iconografía:** SVG outline propio, un solo grosor. Cero emoji en la navegación. El icono solo
aparece donde es contenido (un beneficio, un trofeo), nunca como decoración de sección.

### 2.4 Todo el copy pasa por el filtro de los 3 minutos

El brief pregunta si un empleado con mala conexión y 3 minutos entiende esto. Traducido a reglas
de escritura:

- **Español venezolano, no castellano neutro.** "Cuadrar", "echarle los kilos", "pana" se entienden
  más rápido. No es color local: es velocidad de lectura.
- **El sistema dice lo que hizo, no lo que siente.** "Guardada en tu teléfono, todavía no en el
  servidor" en vez de "sincronizando…".
- **Ningún texto se disculpa ni promete lo que no puede cumplir.** El texto de `INDETERMINADO` dice
  literalmente: *"No sabemos si el aliado registró tu canje. No es culpa tuya y tampoco es un fallo
  confirmado."*
- **Cada cifra en pantalla es auditable por el usuario.** El botón "¿De dónde sale?" abre la fórmula
  completa de la recompensa. Regla permanente #5: si una mecánica solo funciona porque el usuario no
  la entendió, no la envío.

### 2.5 Cómo verifiqué (para el CTO)

No entrego "se ve bien en mi pantalla". Lo que corrí:

| Verificación | Resultado |
| :--- | :--- |
| Render en Chromium headless a 430 px y 1400 px, modo claro y oscuro | 0 errores de JS, 0 desbordamiento horizontal |
| Recorrido automatizado de los flujos: completar misión → sync, pedir beneficio → confirmación, tabla ±3 → completa, opt-out, crear misión | Los cinco pasan |
| Paleta de los gráficos del BackOffice contra validador de contraste y daltonismo (protan/deutan/tritan), en ambos modos | Pasa las seis comprobaciones |
| Coherencia de la economía: el saldo tras ganar y gastar cuadra con la fórmula publicada | Cuadra |
| Extracción del grafo de llamadas con **graphify** sobre las fuentes reales (AST, sin LLM) | 41 funciones, 41 llamadas, 7 comunidades, 6 costuras |

---

## 3 · LAS DECISIONES DE DISEÑO, Y POR QUÉ

Cada una con la alternativa que descarté, porque una decisión sin alternativa descartada no es una
decisión.

### 3.1 · El Oro es una economía cerrada
**Decidido:** el Oro se gana con misiones y solo se cambia por cupos que la empresa ya contrató.
No hay tasa a USD.
**Alternativa descartada:** `usd_equivalent` fijado por RRHH, como estaba en la spec de Cashea.
**Por qué:** si el empleador puede repreciar el esfuerzo después del hecho y sin restricción, deja
de ofrecer un premio y pasa a administrar la capacidad de pago del empleado. Lo marcó el `LR`, lo
confirmó el `CMO`.
**A quién le cuesta:** al `CFO`, que pierde una palanca de ajuste.
**Firma:** `CFO`. **Estado:** ⚠️ ver §3.2, esto no cierra el problema.

### 3.2 · El precio del catálogo es la nueva superficie de poder
**Observación, no decisión.** Al quitar el USD, el poder de repreciar no desapareció: se mudó.
Quien fija cuántos Oros cuesta "Día libre completo" y cuántos cupos se contratan al mes tiene
exactamente la misma capacidad. Subir un beneficio de 900 a 1.800 de Oro **es** una devaluación,
sin tipo de cambio y sin que se vea en ningún estado financiero.
**Lo que propongo:** trasladar íntegra la gobernanza que escribí para la tasa al **precio en Oro**:
publicado, con techo y piso por categoría, aviso de 30 días, y sin efecto retroactivo sobre saldos
ya ganados.
**Firma:** `CFO`. **Estado:** 🔴 abierto y bloqueante.

### 3.3 · Ranking ±3 por defecto, tabla completa opt-in
**Decidido:** por defecto ves tu puesto y tres arriba y tres abajo, con contador de cuántos quedan
ocultos. La tabla completa existe y la enciende el empleado.
**Alternativa descartada:** ranking abierto tipo Strava. Más adictivo, más fácil de vender.
**Por qué:** la evidencia del `LR` dice que el ranking público de arriba a abajo genera estrés
crónico en el cuartil bajo y daña la cooperación. El toggle respeta al que sí quiere competir sin
imponérselo al que no.
**El contrapeso que añadí:** la **meta colectiva del mes** va arriba de todo. Si el equipo llega,
todos suben de rango, sin importar el puesto individual.
**Firma:** ya alineado con la evidencia del `LR`. **Estado:** ✅ cerrado salvo objeción.

### 3.4 · Los estados de fallo existen antes que el camino feliz
**Decidido:** cinco estados construidos con su texto.

```
MISIÓN   Abierta → Pendiente de sync → Sincronizada        (XP y Oro acreditados)
                                    ↘ Rechazada            (Oro devuelto DEL POZO)

CANJE    Pedido → En proceso → Activo (con código)
                            ↘ Indeterminado → revisar → Activo
                                            → 48 h    → Devuelto (Oro completo)
```

**El detalle que importa:** en *Pendiente* la recompensa está **apartada**, no acreditada. Y cuando
el servidor rechaza un cierre, lo que se devuelve sale del pozo, **nunca del saldo que la persona
ya tenía**. Nadie ve un descuento sin explicación.
**Firma:** `CTO` — necesito saber qué estados puede distinguir de verdad su arquitectura.
**Estado:** 🟡 70%, bloqueado en M-02 desde el 06/08.

### 3.5 · El opt-out cuesta navegación, no solo contadores
**Decidido:** el interruptor apaga XP, niveles, Oro nuevo, trofeos, medallas, tablas, rachas y
avisos, y **baja la app de cinco pestañas a dos**. El Oro acumulado queda intacto y sin vencer.
**Alternativa descartada:** ocultar unos números y dejar la navegación igual.
**Por qué:** *"participación 100% voluntaria"* es el claim más fuerte del `CMO` y el único que no
depende de terceros. Si el interruptor no cambia la app de verdad, el claim se cae en la primera
demo. Lo aprendí construyéndolo, no razonándolo.
**Firma:** `CTO` para el coste. **Estado:** 🟡 80%.

### 3.6 · Medallas de equipo que abren catálogo para todos
**Decidido:** cuatro logros colectivos ("Mes limpio", "Nadie solo", "Se cruzaron las áreas", "Meta
del mes"). Cada uno desbloquea un beneficio mejor **para todo el mundo**, no para quien lo ganó.
**Por qué:** el `LR` reporta ~80% de abandono de insignias cuando se agota la novedad, y que la
competencia individual daña la cooperación. Un logro que solo se consigue entre todos y que
beneficia a todos empuja en la dirección contraria.
**Riesgo que asumo:** presión de pares sobre el que no participa. Mitigación parcial: quien apaga
el juego sale de las tablas y no aparece como el que "falta". No es suficiente y lo sé — ver §6.
**Firma:** `CEO` (afecta la narrativa de equipo). **Estado:** 🟡 nuevo, sin ID.

### 3.7 · El catálogo se filtra por zona
**Decidido:** cada persona ve solo beneficios que puede usar donde vive (Caracas, Valencia,
Maracaibo, Barquisimeto, Maracay, Remoto).
**Por qué:** mostrarle a alguien de Maracaibo un gimnasio que solo existe en Caracas es una burla.
**El problema que esto crea, y que el diseño no puede resolver:** dos personas con el mismo Oro
tienen catálogos de distinto tamaño. **Alguien en Barquisimeto gana igual y puede menos.**
Lo correcto en la pantalla produce una desigualdad en la economía.
**Lo que hace falta:** o un piso mínimo garantizado de beneficios por zona, o la decisión explícita
de aceptar la diferencia y decirla en voz alta.
**Firma:** `CFO` + quien lleve la relación con RRHH del cliente. **Estado:** 🔴 nuevo y sin dueño.

### 3.8 · El BackOffice muestra el trabajo, no vigila a la gente
**Decidido:** el panel de gerencia muestra desempeño por área y persona, movimiento de misiones,
horas por cliente y consumo de la Tienda. **No muestra** el contenido de los hilos, ni quién apagó
la capa de juego, ni qué beneficio pidió cada persona. Está escrito dentro del propio panel.
**Por qué:** un dato que solo sirve para señalar a alguien no es un dato de gestión. Y si el
BackOffice puede ver quién apagó el juego, el opt-out deja de ser voluntario en la práctica aunque
lo sea en el código.
**Por qué necesito que otro lo firme:** es una decisión de ética de producto, no de UX. Está fuera
de mi autoridad y no debería quedar firmada solo por mí.
**Firma:** `CEO` o `LR`. **Estado:** 🟡 M-05, nueva.

---

## 4 · LO QUE ESTO LE IMPLICA A CADA UNO

### 4.1 · Para el CEO

**Lo que se cumplió de tu gate.** El gate de lanzamiento — 3 Intrarrecompensas de tiempo activas +
1 canje ejecutado — **es demostrable en el prototipo**: hay cinco beneficios de tiempo en catálogo
y el flujo de canje se recorre de punta a punta con sus tres estados finales. Lo que falta es el
`LVL-020`: convertirlo en un gate medible en el panel de salud de cuenta, y eso depende de
`LVL-017`.

**El claim de marca sigue en pie, y ahora es más fuerte.** "Participación 100% voluntaria" ya no es
una promesa: es un interruptor que baja la app de cinco pestañas a dos. Se puede demostrar en 20
segundos en cualquier reunión comercial.

**Aparecieron dos superficies nuevas que no estaban en la narrativa** y que quiero que decidas si
entran o no:
1. **El BackOffice de gerencia.** Convierte a Levelop en un producto de dos audiencias (empleado y
   líder). Eso cambia el pitch, el pricing y a quién le vendemos. No lo decido yo.
2. **Las medallas de equipo.** Refuerzan la narrativa de cooperación, pero introducen presión de
   pares. Es un mecanismo potente y no es neutral.

**Mi pregunta concreta:** ¿el BackOffice de gerencia es parte del producto v1 o es una fase 2? De
tu respuesta depende si sigo invirtiendo diseño ahí o lo congelo.
**Necesito respuesta antes del:** 29/08/26.

---

### 4.2 · Para el CFO

**La buena noticia.** Al eliminarse la conversión Oro→USD desaparece el riesgo que marcó el Lead
Researcher: ya no existe un campo que RRHH pueda mover después del hecho para repreciar el esfuerzo
de alguien. Ese vector está cerrado.

**La noticia que necesito que leas con cuidado.** El poder no desapareció, se mudó:

> Quien fija el **precio en Oro de cada cupo** y **cuántos cupos se contratan al mes** tiene
> exactamente la misma capacidad de repreciar el esfuerzo que tenía quien fijaba la tasa.
> Subir "Día libre completo" de 900 a 1.800 de Oro **es** una devaluación del 50% sobre el trabajo
> ya hecho. No aparece en ningún estado financiero y el empleado no tiene forma de anticiparla.

**Lo que propongo, y que solo tú puedes firmar:**

| Regla | Propuesta de diseño | Por qué |
| :--- | :--- | :--- |
| Publicación del precio | El precio en Oro de cada beneficio es público y versionado | Sin esto no hay nada que auditar |
| Aviso previo | 30 días antes de cualquier subida de precio | Permite planificar un gasto contra Oro esperado |
| Techo y piso | Por categoría, no por ítem | Evita el ajuste selectivo sobre el beneficio más pedido |
| No retroactividad | Un cambio de precio no afecta un canje ya iniciado | Es la contrapartida del "tu Oro no se toca" |
| Cupos mínimos | Un piso contratado por zona | Ver el punto de equidad abajo |

**El bloqueo nuevo: equidad entre zonas.** Alguien en Barquisimeto gana el mismo Oro que alguien en
Caracas y tiene menos en qué gastarlo, porque hay menos aliados. O garantizamos un piso mínimo de
beneficios por zona, o aceptamos la diferencia explícitamente. **Hoy no hay dueño de esta decisión
y no aparece en ningún documento.**

**Mi pregunta concreta, en dos partes:**
1. ¿Quién fija el precio en Oro de cada cupo y bajo qué regla de aviso?
2. Si el Oro ya no está denominado en USD, **¿sigue siendo un pasivo laboral bajo R-04?** No es mi
   decisión, pero la regla dice que todo lo que toque el ledger se trata como pasivo financiero, y
   la naturaleza del instrumento cambió.

**Necesito respuesta antes del:** 29/08/26. **Bloquea:** `LVL-024` completa.

---

### 4.3 · Para el CTO

**Lo tuyo está construido, y con el estado nuevo incluido.** El mapa de estados que pediste
(`LVL-023`) ya no es un diagrama: son pantallas con su texto. Incluye `INDETERMINADO` con color
propio, dos salidas (revisar / devolver) y reembolso automático a las 48 h.

**Lo que necesito de ti, y lleva 19 días abierto (M-02):** dime **cuáles de estos estados puede
distinguir físicamente tu arquitectura**. Diseñar un estado que el sistema no puede diferenciar es
trabajo perdido para los dos:

| Estado | Lo que el sistema tendría que saber |
| :--- | :--- |
| `Pendiente de sync` | Que la escritura local ocurrió y la remota no |
| `Rechazada` | Que el servidor respondió **no**, distinguible de que no respondió |
| `En proceso` | Que la petición al aliado salió y no ha vuelto |
| `Indeterminado` | Que hubo timeout, **distinguible de un fallo confirmado** |
| `Devuelto` | Que pasaron 48 h sin confirmación y el reembolso se ejecutó |

Si alguno no es distinguible en tu stack, lo colapso y rediseño el texto. Prefiero cuatro estados
verdaderos que cinco mentirosos.

**Un hallazgo del grafo de llamadas que te concierne directamente.** Extraje el mapa del prototipo
con graphify (AST, sin LLM): 41 funciones, 41 llamadas, 7 comunidades. La función más conectada es
**`nivelDe()` — 8 conexiones, y es puente entre cuatro comunidades distintas**. Traducido a
producto:

> **La regla de nivel está tocando el HUD, la Tienda, el Perfil, el Inicio y el cierre de misión al
> mismo tiempo.** Si mañana cambiamos cómo se desbloquea el catálogo — y el §4.2 sugiere que va a
> pasar — se toca en ocho sitios.

Mi recomendación de diseño, con tu criterio por delante: **el gating debería vivir en un solo
lugar**, un módulo de reglas que responda "¿esta persona puede pedir esto?" y nada más. Es una
recomendación, no una decisión de arquitectura; esa es tuya.

**Deuda declarada del prototipo, para que no te la encuentres:** es un archivo HTML único con
estado en memoria. No hay persistencia, no hay capa de red, no hay modo offline real — la latencia
está simulada. Sirve para validar el diseño y el copy, no para estimar esfuerzo de implementación.

**Mi pregunta concreta:** ¿cuáles de los cinco estados son físicamente distinguibles?
**Necesito respuesta antes del:** 29/08/26. **Bloquea:** `LVL-023` completa.

---

## 5 · LO QUE NO ESTÁ RESUELTO

| # | Riesgo abierto | Severidad | Dueño | Qué pasa si no se resuelve |
| :-- | :--- | :--- | :--- | :--- |
| R1 | Quién fija el precio en Oro y con qué aviso | 🔴 Bloqueante | `CFO` | Reconstruimos el mismo problema de coerción en otro sitio, sin haberlo visto venir |
| R2 | Equidad de catálogo entre zonas | 🔴 Bloqueante | `CFO` + RRHH cliente | Una economía única con catálogos desiguales. Se descubre por queja, no por diseño |
| R3 | Qué estados de fallo son distinguibles | 🟡 Alta | `CTO` (M-02) | Diseño estados que el sistema no puede diferenciar |
| R4 | Qué Intrarrecompensa se pide de verdad en Venezuela | 🟡 Alta | `LR` / `GS` (M-03) | El catálogo inicial sale de literatura y no de deseo observado |
| R5 | Regla de no-vigilancia del BackOffice | 🟡 Alta | `CEO` o `LR` (M-05) | Una decisión de ética de producto firmada solo por el PD |
| R6 | El BackOffice: ¿v1 o fase 2? | 🟡 Alta | `CEO` | Invierto diseño en una superficie que quizá no entra |
| R7 | Presión de pares por las medallas de equipo | 🟢 Media | `PD` + `LR` | Un mecanismo pro-cooperación que termina castigando al que se apea |
| R8 | Trabajo que llega directo de Alim sin ID `LVL-###` | 🟢 Media | `EA` (M-04) | Tres artefactos y seis cambios de alcance fuera del Dashboard |

---

## 6 · QUÉ MEJORARÍA DE MI PROPIO TRABAJO

Sección de autocrítica. Si no está aquí, es que no la vi.

**6.1 · Diseñé un catálogo sin un solo empleado venezolano en la sala.**
Los 19 beneficios salieron de literatura y de sentido común, no de deseo observado. "Salida
anticipada" y "día libre" no son intercambiables, y yo no tengo evidencia de cuál pide realmente
alguien en Caracas o en Maracaibo. Lo reporté el 06/08 (M-03) y sigue abierto. **Es la debilidad
más grande de esta entrega** y la única que no puedo cerrar yo solo.

**6.2 · El prototipo no prueba lo que el brief más pregunta.**
Mi pregunta obsesiva es si esto se entiende con mala conexión y tres minutos. El prototipo **simula
la latencia** pero corre en memoria: no prueba nada sobre pérdida de conexión real, reintentos ni
recuperación de estado. Lo que sí probé es la legibilidad y el copy. Lo que falta es una prueba en
un teléfono de gama baja con datos móviles reales — y no la he hecho.

**6.3 · El opt-out está construido pero no medido.**
Sé que apaga las cosas correctas. No sé qué porcentaje de gente lo usaría, ni si apagarlo genera un
costo social dentro del equipo ("¿por qué tú no estás en la tabla?"). El mecanismo puede ser
técnicamente voluntario y socialmente obligatorio. **No tengo cómo detectar eso con un prototipo.**

**6.4 · Las medallas de equipo son la decisión más riesgosa que tomé solo.**
Empujan cooperación, que es lo que quiere la evidencia. Pero un logro colectivo que desbloquea
beneficios para todos convierte al que no participa en un costo para sus compañeros. Mitigué
parcialmente (quien apaga sale de las tablas) y **no es suficiente**. Debí consultarlo con el `LR`
antes de construirlo, no después.

**6.5 · El grafo del código me señaló una deuda que yo mismo creé.**
`nivelDe()` toca cinco superficies. Eso es mío: distribuí la regla de nivel por toda la app en vez
de aislarla. En un prototipo no duele; en producción, cada cambio de gating se paga cinco veces.
**Lección de método: extraer el grafo debería ser parte de cerrar una versión, no una curiosidad
del final.**

**6.6 · Tres artefactos sin ID de tarea.**
Toda esta sesión salió de una petición directa de Alim y no pasó por la EA. El Protocolo cubre bien
el camino agente→Alim (R-05) pero no el de vuelta, y el resultado es que tres entregables y seis
cambios de alcance no existen en el Dashboard. Propuesto como M-04.

**6.7 · Lo que haría distinto si empezara hoy.**
Habría pedido la política de precios del `CFO` **antes** de diseñar la Tienda, no después. Diseñé
un catálogo con precios inventados por mí y ahora hay que revisarlos todos cuando llegue la regla
real. Es exactamente el error que dije que no iba a cometer — gobernanza antes que mecánica — y lo
cometí a menor escala.

---

## 7 · QUÉ ABARCARÍA EN LAS PRÓXIMAS ITERACIONES

Propuesta de secuencia. La EA prioriza; esto es materia prima para esa decisión.

### v0.4 — "Que sobreviva a la realidad" · ~2 semanas
**Criterio de salida:** el prototipo aguanta una prueba con cinco empleados reales en sus teléfonos.

| Qué | Por qué ahora | Depende de |
| :--- | :--- | :--- |
| Prueba con 5 empleados en teléfono real, con datos móviles | Es la única forma de responder mi pregunta obsesiva | `GS` para el acceso |
| Ajustar el catálogo con lo que digan | Cierra R4 / M-03 | `LR` + `GS` |
| Aplicar las reglas de precio del CFO | Cierra R1 y revalida los 19 precios | `CFO` |
| Corregir los estados según lo que diga el CTO | Cierra R3 / M-02 | `CTO` |
| Onboarding con el gate de 3 Intrarrecompensas + 1 canje | Es `LVL-020`, gate del CEO | `LVL-017` |

### v0.5 — "Que el sistema tenga reglas, no criterios" · ~3 semanas
**Criterio de salida:** un empleado puede predecir qué va a pasar con su Oro sin preguntarle a nadie.

- **Panel de administración de RRHH.** Hoy no existe la pantalla donde alguien fija precios y
  contrata cupos. Mientras no exista, la gobernanza es teoría.
- **Piso de equidad por zona**, si el CFO decide que lo hay. Cierra R2.
- **Historial de precios visible para el empleado.** "Este beneficio costaba 900 el mes pasado."
  Es la contrapartida honesta del aviso de 30 días.
- **Estados de fallo del propio catálogo:** qué pasa si un aliado se cae a mitad de mes, qué ve
  quien tenía ese beneficio en la mira.

### v1.0 — "Que se pueda lanzar" · ~4 semanas
**Criterio de salida:** el gate del CEO es medible en el panel de salud de cuenta.

- Modo offline real, con el CTO. Sin esto, el brief no se cumple.
- Accesibilidad completa: auditoría WCAG AA, navegación por teclado, lectores de pantalla.
- Localización de zonas más allá de las seis actuales.
- Instrumentación de las métricas de §8, incluidas las antimétricas.

### Más allá de v1 — lo que veo venir y todavía no toco
- **Levelop para equipos distribuidos**: si el cliente tiene gente en varios países, la zona deja
  de ser una ciudad y el problema de equidad se multiplica.
- **Beneficios que el empleado propone.** Hoy el catálogo baja de la empresa. Que alguien pueda
  proponer un aliado de su barrio cambia la naturaleza del producto — para bien, creo, pero no lo
  he pensado.
- **Qué pasa cuando alguien se va de la empresa con Oro acumulado.** No está diseñado, no está en
  ninguna spec, y es una pregunta legal antes que de producto.
- **El BackOffice como producto vendible** por separado, si el CEO decide que sí.

---

## 8 · CÓMO SABREMOS SI ESTO FUNCIONA

Propuesta de instrumentación. Incluye lo que **no** vamos a optimizar, que es la parte que protege
al producto de sí mismo.

### Lo que mediría

| Métrica | Qué diría de verdad | Umbral que me preocuparía |
| :--- | :--- | :--- |
| % de misiones cerradas **a tiempo** | Si el juego mejora el trabajo o solo lo decora | Que suba el volumen y baje la puntualidad |
| % de misiones con **2 o más personas** | Si la cooperación está funcionando | Que baje mientras sube el XP individual |
| **Tasa de canje** (Oro gastado / Oro ganado) | Si la Tienda ofrece algo que la gente quiere de verdad | Por debajo del 40%: el catálogo no sirve |
| **Canjes indeterminados** sobre el total | Salud de la relación con los aliados | Por encima del 3%: se habla con el aliado, no con la gente |
| **Uso del opt-out**, y si quien lo apaga sigue trabajando igual | Si la voluntariedad es real o solo formal | Que el desempeño caiga tras apagarlo: el juego era obligatorio de hecho |
| **Dispersión del catálogo entre zonas** | Equidad (R2) | Que una zona tenga menos de la mitad de beneficios que otra |

### Lo que NO vamos a optimizar, y quiero que quede escrito

- **Tiempo dentro de la app.** No es un producto de entretenimiento. Si alguien resuelve su día en
  tres minutos, ganamos.
- **DAU / sesiones diarias.** Empujaría a inventar razones para abrir la app. Ya tenemos rachas, y
  las rachas ya tienen día de gracia justamente por esto.
- **Volumen bruto de misiones cerradas.** Es la métrica más fácil de inflar troceando el trabajo.
  Por eso el tope diario de Oro y por eso una misión propia no da Oro hasta que otro la acepte.
- **Cualquier ranking individual como KPI de gerencia.** Si el desempeño individual del BackOffice
  se convierte en objetivo, el ±3 del ranking se vuelve decorativo.

---

## 9 · ANEXOS

### 9.1 · La economía en cuatro líneas
```
XP    = 40 × mult(urgencia) × mult(importancia) × mult(esfuerzo)
Oro   = XP × 0,40
Nivel = mayor N tal que XP_acumulada ≥ 280 × N^1,62
Tope  = 150 de Oro por día · misión propia no da Oro hasta que otro la acepte
```
| Factor | baja / bajo | media / medio | alta / alto |
|:--|--:|--:|--:|
| Urgencia | 1,0 | 1,4 | 1,9 |
| Importancia | 1,0 | 1,4 | 1,9 |
| Esfuerzo | 0,8 | 1,2 | 1,7 |

Rangos: Bronce (Nv 1) · Plata (4) · Oro (7) · Platino (10) · Leyenda (13).
**Todos estos números son propuestas de diseño, no valores acordados.**

### 9.2 · Tokens del sistema visual
| Rol | Claro | Oscuro |
| :--- | :--- | :--- |
| Fondo | `#DEE3D8` | `#07181A` |
| Superficie | `#F7F8F3` | `#0F2528` |
| Tinta | `#0E1F1E` | `#EDF0E7` |
| Latón — Oro | `#8A5C0A` | `#E2AB3E` |
| Jade — XP y progreso | `#0A6E59` | `#4FD5AD` |
| Achiote — riesgo | `#B03826` | `#F2735E` |
| Lila — incertidumbre | `#4F46C2` | `#9A94F8` |

Tipografía: **Big Shoulders Display** (títulos y cifras) · **Karla** (texto) · **DM Mono**
(etiquetas y datos tabulares).

### 9.3 · Cómo regenerar el mapa del código
```bash
pip install graphifyy
graphify update <carpeta-con-las-fuentes>
# salida: graphify-out/GRAPH_REPORT.md y graphify-out/graph.json
```
Solo AST, sin coste de tokens. **Propongo que sea un paso obligatorio al cerrar cada versión**, no
una curiosidad del final — ver §6.5.

### 9.4 · Trazabilidad con los encargos originales

| Encargo | Origen | Estado hoy |
| :--- | :--- | :--- |
| `LVL-023` Estados de fallo | MSG-001, petición del CTO | 🟡 70% — construido, falta validación CTO |
| `LVL-024` Gobernanza del pool | MSG-001, riesgo del LR | 🔴 40% — **cambió de naturaleza**, ver §3.2 |
| `LVL-028` Opt-out real | MSG-001, claim del CMO | 🟡 80% — construido, falta coste CTO |
| `LVL-020` Gate de onboarding | Gate del CEO | ⬜ 0% — depende de `LVL-017` |
| *(sin ID)* BackOffice de gerencia | Alim, 25/08 | 🟡 v0.1 entregada, pendiente decisión CEO |
| *(sin ID)* Vista interna del producto | Alim, 25/08 | ✅ v0.1 entregada |
| *(sin ID)* Equidad entre zonas | Detectado en esta sesión | 🔴 sin dueño |

---

**Pide a la EA:**
1. Rutear §4.1 al CEO, §4.2 al CFO y §4.3 al CTO, con fecha límite 29/08/26.
2. Abrir tarea con ID para la equidad entre zonas (R2) y asignarle dueño.
3. Asignar IDs retroactivos a los tres artefactos y a los seis cambios de alcance.
4. Decidir si M-05 (no-vigilancia del BackOffice) amerita Mesa Redonda: cruza `PD`, `CEO` y `LR`,
   y por §5 del Protocolo eso son tres agentes.

*Documento redactado por el agente Product Designer. Respaldado por `LOG - Product Designer.md`,
actualizado el 25/08/26 con los seis bloques completos.*
