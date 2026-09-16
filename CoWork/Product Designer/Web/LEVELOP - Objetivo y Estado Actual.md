# LEVELOP — Objetivo y Estado Actual

**Product Design · 27 Ago 2026 · corte v0.5**
**Fuentes:** `00 - LEVELOP - DOCUMENTO MAESTRO` (v1.0), acta de la Mesa Redonda MVP v0.3,
prototipos v0.4 y el LOG del Product Designer.

> **Para qué sirve este documento.** Para que cualquiera —Alim, un agente nuevo, un fundador
> invitado, un cliente en una demo— entienda en diez minutos **qué estamos construyendo y qué tan
> lejos estamos**, sin tener que leer 32.000 palabras de Maestro ni reconstruir la historia desde
> las actas. Está escrito para que duela un poco: la parte 2 no idealiza.

---
---

# PARTE 1 · EL OBJETIVO

## 1.1 · La frase

> ### "Tus beneficios ya existen. Levelop decide quién se los gana."

**Levelop (marca de producto: LVL UP!) es un Sistema de Beneficios por Desempeño para PyMEs
venezolanas de 10 a 100 empleados.**

No vendemos software de tareas. No vendemos un programa de reconocimiento. Vendemos
**infraestructura de asignación**: el sistema que conecta el trabajo que alguien hizo con el
beneficio que se ganó, de forma transparente y auditable, en empresas donde hoy eso se reparte a
dedo.

## 1.2 · El problema, y por qué existe con esta forma solo acá

En Venezuela **la compensación real ya no se paga vía salario**. El salario nominal perdió función
y la retribución efectiva se entrega en bonos, beneficios en especie y flexibilidad. De ahí salen
tres hechos encadenados, y el tercero es el negocio:

1. **Las empresas ya gastan esa plata.** No estamos pidiendo un presupuesto nuevo.
2. **La reparten igual al que empuja y al que no.** El dolor no es falta de presupuesto: es
   **falta de criterio de asignación**.
3. **Ese criterio es el producto.** Ese es el hueco, y por eso el pitch no empieza en "gamificación"
   sino en "ya estás pagando esto, repártelo con criterio".

**El foso a largo plazo no es la tecnología.** Cualquiera integra un procesador de pagos en dos
semanas, y la ventana de "nadie con capital construye acá" se cierra sola. Lo único acumulable es
**el dato propietario: qué beneficio mueve qué comportamiento, por rol y por empresa, medido en el
tiempo.** Eso hay que instrumentarlo desde el día uno, y es responsabilidad conjunta de CTO y
Product Design.

## 1.3 · Qué estamos construyendo, exactamente

Tres superficies, no una. Y se venden en este orden, no en el orden en que se usan:

| Superficie | Para quién | Qué resuelve | En la demo |
| :--- | :--- | :--- | :--- |
| **BackOffice de gerencia** | Gerencia | *"¿Dónde se atasca el trabajo y qué beneficios de verdad se usan?"* | **Va primero** |
| **BackOffice de Líder de Área** | Líderes de área | *"¿Dónde hace falta una mano, quién trabaja con quién, quién no va a estar?"* | Va segunda |
| **App del empleado** | Todo el equipo del cliente | *"¿Qué gané, qué me falta, y qué me puedo pedir con eso?"* | Va tercera |
| **Vista interna del producto** | CTO, CEO, Product Design | Cómo está hecho por dentro y qué mecanismos hay que defender | No va |

**Son cuatro desde el 27/08.** El panel del líder de área se separó del de gerencia a propósito: lo
que un líder necesita para **ayudar** y lo que la gerencia necesita para **decidir** no son el mismo
dato, y meterlos en la misma pantalla es como se construye una herramienta de vigilancia sin querer.

**Por qué el BackOffice va primero, en palabras del CEO:** *"en una PyME venezolana paga el jefe.
Llevamos desde el 06/08 diseñando con excelencia para la única persona de la ecuación que no paga."*
Le vendemos al jefe lo que él ve; le entregamos al empleado lo que él siente.

**La app del empleado tiene cinco secciones:** Inicio (bento con filtro día/semana/mes), Misiones
(listado, detalle, hilo y estados de sincronización), Tienda (beneficios por familia, con cupo real
y filtro por zona), Ranking (±3 por defecto y meta colectiva) y Perfil (nivel, racha, trofeos,
medallas y el interruptor de opt-out).

## 1.4 · Cómo se ve ganar

**A 3 semanas (la meta viva hoy):** el producto no se rompe. Backend afinado, establecimiento de
tareas funcionando, dinámica interna sin errores, y Alim usándolo personalmente todos los días.
*"No podemos salir con un producto roto."*

**A 3 meses:** cinco clientes Fundadores pagando, cada uno con su **gate de lanzamiento cumplido**
— y ese gate es medible, no ceremonial: **3 Intrarrecompensas de tiempo activas y al menos un canje
ejecutado.** Un workspace sin eso no está lanzado, está instalado. Y **la línea base se mide ANTES
de instalar**: sin eso, en 90 días no hay caso, hay anécdotas.

**A 6 meses:** las 20 entrevistas cerradas (`LVL-011`) y el primer corte del dato propietario — qué
beneficio movió qué comportamiento, por rol. Ese es el momento en que la tesis deja de ser
literatura.

**El modelo:** $50/mes con 10 asientos incluidos + $4 por asiento adicional. Promo Fundadores
$100/3 meses. El pool de beneficios es **línea aparte, default $0**. Sigue siendo precio de trabajo
hasta que aterrice `LVL-022` (costo de inferencia de IA por usuario/mes). Self-funded a
$120–180/mes, sin capital externo, hasta que Venezuela esté validada.

## 1.5 · Qué NO estamos construyendo

Estas cuatro confusiones han costado semanas cada una. Van escritas para poder señalarlas rápido.

| No es | Por qué se confunde |
| :--- | :--- |
| **No es un Work OS gamificado** | Fue el posicionamiento original y murió el 06/08. "Gamificado" sobrevive solo como descriptor de la experiencia adentro, nunca como categoría de venta |
| **No es una moneda ni un sistema financiero** | El Oro **no** se convierte a USD ni a nada. Es puntaje de juego. Es la confusión más cara que hemos tenido |
| **No es una herramienta de vigilancia** | El BackOffice muestra el **trabajo**, nunca a la persona |
| **No es un gestor de tareas con puntos** | Un catálogo vacío convierte el producto exactamente en eso. Por eso existe el gate de lanzamiento |

## 1.6 · Las líneas que no se cruzan

Ocho reglas permanentes gobiernan el sistema. Estas cuatro son las que tocan producto todos los
días:

- **R-03 · La participación gamificada es siempre opt-in.** Es el claim más fuerte que tenemos y el
  único que no depende de terceros.
- **R-04 · El inventario de beneficios es pasivo financiero, no feature.** El pasivo vive en el
  cupo, no en el puntaje. Todo lo que toque inventario requiere CFO + CTO.
- **R-07 · Ninguna superficie de gerencia muestra un dato cuyo único uso posible sea señalar a una
  persona.** Ni hilos, ni quién apagó el juego, ni qué pidió cada quien. *"R-03 muere sin R-07: si
  el jefe puede ver quién apagó el juego, el opt-out no es voluntario aunque el código diga que sí."*
- **R-08 · El Maestro es la fuente única de verdad.** Si un agente cree que está equivocado, pide
  enmienda por la EA. No lo contradice en silencio.

**Y cuatro antimétricas, que son posición del CEO y no propuesta de diseño.** Ningún agente puede
proponer optimizarlas sin pasar por él: **tiempo dentro de la app** (si alguien resuelve su día en
tres minutos, ganamos), **DAU y sesiones diarias**, **volumen bruto de misiones cerradas** (la
métrica más fácil de inflar troceando el trabajo) y **cualquier ranking individual como KPI de
gerencia**.

---
---

# PARTE 2 · DÓNDE ESTAMOS HOY

## 2.1 · El semáforo, sin maquillaje

| Pieza | Estado real | Nota |
| :--- | :--- | :--- |
| **App del empleado** | 🟢 Prototipo v0.5 navegable, 5 secciones, flujos completos | Corre sobre datos falsos |
| **BackOffice de gerencia** | 🟢 Prototipo v0.3, dos secciones + reto de empresa | Corre sobre datos falsos |
| **BackOffice de Líder de Área** | 🟡 Prototipo v0.1 completo, **pendiente de decisión del CEO** | Ver 2.6 |
| **Vista interna** | 🟢 v0.2, con el mapa de código real extraído del AST | Es la única pieza con datos reales |
| **Frontend V1** | 🟡 Funcional (React 18 + TS + Tailwind + Vite) | **Sobre `localStorage`** |
| **Backend** | 🔴 **Diseñado, NO en producción** | Sin JWT real, sin WebSockets, sin despliegue, sin multi-tenancy |
| **Catálogo de beneficios** | 🔴 19 precios **sin suelo** | Ver 2.4 |
| **Voz de cliente** | 🔴 **Cero entrevistas** | Ver 2.3 |
| **Equipo** | 🔴 Alim solo, ~18h/semana | 12–14 productivas reales |

## 2.2 · Lo que sí existe y se puede enseñar hoy

- **La economía completa, publicada en pantalla.** `XP = 40 × urgencia × importancia × esfuerzo`,
  `Oro = XP × 0,40`, tope 150/día, nivel derivado siempre del XP. Nada oculto.
- **El flujo de misión completo**, con lo que Alim pidió esta semana: no se "marca lista", se
  **envía a revisión**; la recompensa queda **apartada, no acreditada**; el hilo abre solo con
  constancia de quién revisa; **reparto 60/40 entre varios responsables**; y **«Pedir ayuda»** con
  recompensa sugerida, que quien ayuda puede rechazar con **«Porque soy pana»**.
- **La Tienda con cupos reales**, separada en Disponibles y Por desbloquear, con
  **«Marcar como objetivo»** que genera un plan a partir del ritmo real de tus propias misiones —
  y que **te dice que no** si el plan tarda más de 90 días, porque el Oro vence antes.
- **Los seis estados de fallo dibujados con su copy escrito**, incluido `Indeterminado` y el
  `Rechazado por cupo agotado en carrera` que va a ser el más frecuente del producto.
- **El opt-out construido de verdad**, no como casilla: apaga XP, niveles, Oro nuevo, trofeos,
  medallas, tablas, rachas y avisos, y **baja la navegación de 5 pestañas a 3**.
- **El BackOffice sin tabla de personas**, con la distribución de carga sin nombres en su lugar.
- **El mapa de llamadas del propio prototipo**, extraído con graphify: 41 funciones, 41 llamadas,
  7 comunidades, 6 costuras. Es la única superficie del sistema que no depende de que nosotros
  digamos la verdad: la dice el AST.

## 2.3 · Lo que NO existe, y conviene decirlo antes que otro lo descubra

- **No hay backend en producción.** Todo lo que se ve en los prototipos vive en el navegador. Un
  comprador técnico lo descubre en cinco minutos.
- **No hay una sola entrevista con una empresa venezolana.** Ni una encuesta, ni una carta de
  intención. **Todo el diagnóstico de dolor es inferido de literatura.** Es la debilidad más grande
  que tenemos, está abierta desde el 06/08, y ningún material puede presentar el diagnóstico de
  mercado como validado.
- **El catálogo se está diseñando sin saber qué pide realmente un empleado venezolano.** "Salida
  anticipada" y "día libre" no son intercambiables, y hoy no sabemos cuál pesa más.
- **El cupo se decrementa y nunca vuelve.** Bug encontrado por el CTO leyendo el prototipo. Importa
  más de lo que parece: *"el cupo, no el Oro, es donde va a estar la contención real del producto"*.

## 2.4 · La economía: qué está firme y qué está sin suelo

**Firme:** el Oro es puntaje, no dinero. No existe tasa Oro→USD. El empleado nunca ve un monto
salvo cuando el beneficio *es* un descuento de comercio. El Oro **vence a los 90 días para todo el
mundo**, incluido quien apaga el juego. La zona la fija RRHH del cliente, nunca el empleado.

**Sin suelo, y es el problema económico abierto más serio:** al quitar el USD, el poder de
repreciar el esfuerzo no desapareció — **se mudó al precio en Oro del catálogo**. Subir "Día libre"
de 900 a 1.800 de Oro es la misma devaluación sin tipo de cambio. Tres personas llegaron a la misma
conclusión sin leerse entre sí:

> **CFO:** *"la tasa Oro→USD no murió, se escondió — sigue viva en nuestra propia factura cuando
> compramos un cupo."*
> **CTO:** *"al desaparecer la tasa, desapareció el instrumento de medición del pasivo."*

Y el CFO cruzó los números: con el precio ilustrativo de 900 de Oro, el escenario **más
conservador** (una misión promedio al día) da **11 días libres al año por empleado**, sobre unas
vacaciones legales de 15. El escenario del tope da 44. **Ninguno es sostenible.** O el precio está
equivocado en un orden de magnitud, o la fórmula de emisión lo está.

Hay un segundo hallazgo del mismo tipo, y es más silencioso: **la curva de nivel es un calendario
de escalamiento de costos.** Como el nivel abre catálogo, toda la plantilla desbloquea el catálogo
caro alrededor del mes 5, simultáneamente y para siempre.

**Modelo de gobernanza ya decidido (C-012):** bandas de precio de Levelop, precio del cliente dentro
de la banda, registro nuestro e inauditable de alterar. Con **reindexación de saldos**: si sube el
precio de una familia, los saldos ya ganados suben por el mismo factor.

## 2.5 · Los cinco bloqueos que mandan

| # | Qué | Dueño | Por qué manda |
| :-- | :--- | :--- | :--- |
| **CH-6** | **2 semanas disponibles contra 21–32 de trabajo estimado** | Alim | Es una restricción física, no una prioridad. Todo lo demás se decide dentro de esto |
| **CH-5** | Los 19 precios del catálogo no tienen suelo | CFO + PD | Bloquea el catálogo, que es el producto |
| `LVL-013` | Backend mínimo | CTO | Prerequisito de casi todo |
| `LVL-011` | Las 20 entrevistas | GS | La única evidencia primaria que vamos a tener. Cierra el 16/09 |
| `LVL-015` | Dictamen laboral LOTTT | CFO | Prioridad #1 del CFO: un beneficio recurrente puede volverse derecho adquirido |

Y dos preguntas que **solo Alim** puede responder: **¿cuál es el tope mensual en USD para comprar
catálogo de "Beneficios de Levelop"?** y **¿la ventana de congelamiento de 90 días es permanente o
solo del piloto?**

## 2.6 · Las dos contradicciones vivas que hay que resolver esta semana

**La primera, y es la que manda.** El 25/08 el CEO mató la tabla de personas ordenable del
BackOffice porque *"una tabla de personas ordenable es un ranking individual"*, y la subió a regla
permanente (R-07). El 27/08 la lista de mejoras de Alim pide, textual, **«una especie de ranking que
diga quién necesita más ayuda en tu equipo»** e **«identificar los top performers y los del
bottom»**.

**Es la misma superficie con mejor intención.** Y la intención sí es mejor —la de Alim es para
ayudar, no para evaluar, y lo dice explícito— pero **R-07 no habla de intenciones, habla de datos**.
Lo construí con cinco salvaguardas (lista de patrones y no de personas; ordenada por antigüedad del
patrón y no por qué tan mal está alguien; mínimo tres semanas; la persona ve lo mismo que su líder;
sin historial) y está escalado al CEO.

**Si la respuesta es que no, el panel del líder de área se cae completo.** No es una decisión de
diseño y no debería tomarla el diseñador.

**La segunda, que viene de la mañana y sigue abierta.**

La lista de mejoras del 26/08 **revive los Impulsos**, y la §4.4 del Maestro los declaró muertos
este trimestre (C-6), junto con las tablas alternativas del ranking y varios trofeos que la misma
lista toca. Está construido y está en el prototipo.

Además, la §4.4 dice que las próximas tres semanas son **hardening**, no alcance nuevo — y lo
entregado en v0.4 es alcance nuevo.

**O se enmienda el Maestro, o hay que apagar lo construido antes de la demo.** No puede quedar así.
Está escalado a la EA en el MSG-008 y es la decisión más barata de tomar y más cara de posponer de
toda esta lista.

## 2.7 · Qué sigue

**Las próximas 3 semanas (A-7):** hardening. Afinar el backend, garantizar que el establecimiento
de tareas funcione, que la dinámica interna no tenga errores, y que Levelop verdaderamente ayude a
los usuarios con sus tareas. Alim lo prueba personalmente. **Después se buscan los 5 Fundadores.**

**Lo que Product Design tiene en cola, en orden:**
1. Resolver 2.6 (no depende de mí).
2. Ruta de devolución del cupo.
3. Rehacer los 19 precios cuando el CFO cierre `LVL-024`.
4. Entrar a las visitas de campo de Growth & Sales el 16/09 con guion co-diseñado — el día que
   dejamos de diseñar el catálogo desde literatura.

---
---

# PARTE 3 · CÓMO SABREMOS QUE VAMOS BIEN

**Lo que sí medimos.** Cada una está elegida porque es difícil de inflar:

| Métrica | Qué prueba | Por qué esta y no otra |
| :--- | :--- | :--- |
| **Workspaces con gate cumplido** (3 Intrarrecompensas activas + 1 canje) | Que el producto arrancó de verdad | Un workspace instalado sin catálogo es un gestor de tareas con puntos |
| **Canjes ejecutados / Oro emitido** | Que la economía cierra el círculo | Emitir puntaje es gratis; entregar un beneficio no |
| **% de canjes que terminan en `Confirmado`** | Que la promesa se cumple | Si sube el `Indeterminado`, el problema es el aliado, no la gente |
| **Cupos usados / cupos contratados** | Si el cliente está comprando bien | Es la métrica que le devuelve plata al cliente |
| **Concentración de la carga** | Si el trabajo está mal repartido | Sin nombres — es una distribución, no un ranking |
| **% que apaga el juego** | Si el opt-out es real | Solo agregado global, jamás por persona (R-07) |

**Lo que no medimos, jamás:** tiempo dentro de la app, DAU, volumen bruto de misiones cerradas, y
cualquier ranking individual como KPI de gerencia.

---

## Las dos preguntas de esta semana

Ninguna es de diseño ni de código.

> **1 · ¿«Quién necesita una mano» sobrevive a R-07, o se cae?**

De esa respuesta depende una superficie entera. Si sobrevive con las cinco salvaguardas, Levelop
tiene algo que ningún gestor de tareas tiene: un panel que ayuda sin señalar. Si se cae, se cae
limpio y no pasa nada — pero hay que decirlo, no dejarlo correr.

> **2 · ¿Las próximas tres semanas son hardening, o son alcance?**

Van **dos listas de alcance nuevo seguidas** dentro de una ventana que el Maestro declaró de
hardening (A-7). Si es hardening, se congela el prototipo, se enmienda el Maestro para registrar lo
construido como *hecho pero fuera de v1*, y los cuatro artefactos se vuelven material de demo, no de
desarrollo. Si es alcance, hay que decir qué sale de las 21–32 semanas estimadas para que quepa.

**Todo lo demás puede esperar. Estas dos no.**

---
*Levelop · Product Design · 27 Ago 2026 · escrito contra el Maestro v1.0 §§1–8, el acta de la Mesa
Redonda MVP v0.3, las dos listas de mejoras de Alim del 26 y el 27/08, y los prototipos v0.5.*
