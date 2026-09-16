# MESA REDONDA — MVP v0.3 DEL PRODUCT DESIGNER
**Convocada por:** `EA`, a pedido de Alim · **Fecha:** 25 Ago 2026
**Asistentes:** `CEO` · `CFO` · `CTO` · **Ausente con entrega:** `PD` (autor del material)
**Material base:** `Product Designer/ENTREGA - MVP v0.3 - Product Designer.md` + tres prototipos navegables
**Estado:** cerrada · 8 decisiones del CEO, 1 regla permanente nueva, 4 escalamientos a Alim

---

## 0 · POR QUÉ ESTA MESA

El PD cerró su primera sesión de trabajo real y entregó tres prototipos navegables. En el mismo
movimiento avisó de algo que no era una tarea suya: **Alim eliminó el dinero real del producto.**
El Oro ya no se convierte a USD; los beneficios son cupos que la empresa cliente precontrata con
aliados, filtrados por la zona donde vive cada persona.

Eso cierra el vector de coerción que había marcado el Lead Researcher el 06/08 — ya no existe un
`usd_equivalent` que RRHH pueda mover después del hecho. Y el PD, en vez de cobrarse la victoria,
escribió la frase que motivó esta mesa:

> **"Quitar el dinero de la pantalla no quitó el poder. Lo mudó de sitio."**

Convoqué a los tres a los que el PD dirigió una pregunta con fecha. Cada uno sesionó por separado,
sin ver la posición de los otros. Lo que sigue es lo que trajeron.

---

## 1 · POSICIÓN DEL CEO

**Veredicto:** *"Esto no es el producto: es el primer instrumento de venta que tenemos. Apruebo lo
que se le puede enseñar a un dueño de PyME antes de octubre y mato todo lo demás, porque llevamos
tres semanas diseñando para un comprador con el que no hemos hablado ni una vez."*

### La pregunta del PD, respondida

**El BackOffice entra en v1.** Su razonamiento no fue de producto, fue de quién firma el cheque:

> En una PyME venezolana paga el jefe. Siempre el jefe. No hay comité de compras, no hay RRHH con
> presupuesto propio, no hay adopción bottom-up. **Llevamos desde el 06/08 diseñando con excelencia
> para la única persona de la ecuación que no paga.**

Y ató el BackOffice a su propia pregunta obsesiva de la mesa de Cashea — *"¿el dueño pagará por un
software que decide quién se gana los beneficios, o repartirlos a dedo es el poder que no piensa
ceder?"*. El BackOffice **es la respuesta a esa objeción**: no le quita poder al jefe, le da
visibilidad de un trabajo que hoy no ve.

### Decisiones

| # | Decisión | Dueño | Fecha |
| :-- | :--- | :--- | :--- |
| **C-1** | El BackOffice entra en **v1**, no fase 2. El PD sigue invirtiendo diseño ahí | `CEO` | firmada 25/08 |
| **C-2** | **No es un segundo producto.** Mismo pitch, mismo precio, mismo SKU. Lo único que cambia: en la demo comercial el BackOffice va **primero** y la app del empleado segunda | `CMO` + `GS` | 16/09 |
| **C-3** | El BackOffice de v1 son **2 secciones, no 4**. Mueren "horas por cliente" y la tabla "Personas" ordenable | `PD` | v0.4 |
| **C-4** | Las medallas de equipo entran **con tres correcciones**: (1) el denominador son los participantes, no la plantilla; (2) una medalla nunca condiciona un beneficio del catálogo base, solo añade uno extra; (3) ningún texto nombra ni cuenta a los que faltan | `CEO` firmada · aplica `PD` | v0.4 |
| **C-5** | **R-07, regla permanente nueva** (ver §5). No amerita Mesa Redonda: no hay choque, nadie defiende la vigilancia | `CEO` | firmada 25/08 |
| **C-6** | Sobrevive **v0.4 completa**. Mueren **v0.5 y v1.0** este trimestre | `CEO` | firmada 25/08 |
| **C-7** | El precio en Oro del catálogo **se congela 90 días** durante el piloto Fundadores y va **escrito en el contrato** | `CFO` redacta · `Alim` firma | 30/09 |
| **C-8** | "Qué pasa cuando alguien se va con Oro acumulado" entra como pregunta adicional al **mismo dictamen LOTTT** ya presupuestado | `CFO` | 30/09 |

### Lo que mató, y por qué

Nueve semanas de diseño propuesto compiten contra las mismas 18h/semana ya comprometidas con el
ledger (20/09), las 20 entrevistas (15/10), el dictamen legal (30/09) y la web (03/09).
**"No hay 9 semanas. Hay 2."**

- **Modo offline real** — ya estaba muerto el 06/08. El PD lo resucitó en v1.0 con "sin esto el brief
  no se cumple". Respuesta del CEO: *"entonces se cambia el brief, no el trimestre"*. Muerto hasta 2027.
- **Auditoría WCAG AA completa, teclado, lectores de pantalla** — fuera. Se queda contraste y
  daltonismo, que el PD ya validó y es lo que importa en gama baja.
- **Panel de administración de RRHH** — fuera. Con 5 empresas Fundadoras, los precios los fija Alim
  en una hoja de cálculo. *"Construir la pantalla de administración antes de tener a quién
  administrarle es el caso de manual de sobre-elaboración."*
- **Historial de precios visible** — fuera, reemplazado por C-7 a coste cero.
- **19 beneficios → 8.** Muere la familia **Aliados** (cada aliado es un contrato comercial sin dueño
  ni firma que consume horas del único vendedor) y muere **Impulsos**.
- **14 trofeos → 5.** *"14 trofeos para 5 cuentas piloto no es producto, es contenido."*
- **Las 3 tablas alternativas del ranking** — con equipos de 10, ordenan a las mismas diez personas
  de tres maneras.
- **El BackOffice como producto vendible aparte**, **equipos distribuidos**, **beneficios propuestos
  por el empleado** — fuera del horizonte.

### Donde discrepó del PD

1. **Una contradicción dentro de la propia entrega.** El §8 del PD declara antimétrica *"cualquier
   ranking individual como KPI de gerencia"*. Su §3.8 entrega un BackOffice con una sección
   "Personas" cuyo subtítulo literal es *"Toca los encabezados para ordenar"*. **Una tabla de
   personas ordenable es un ranking individual.** *"Peleaste bien la batalla del ±3 en la app del
   empleado y la perdiste en la pantalla del jefe."*
2. **Gobernanza ≠ pantalla.** Precio publicado, versionado, techo y piso, aviso de 30 días,
   historial visible es *"un aparato regulatorio para un mercado que todavía no existe"*. Vamos a
   tener 5 empresas. La misma protección se consigue con una cláusula (C-7): cero horas y encima
   **vendible** — *"tu Oro no se devalúa, está en el contrato"* cierra una objeción en la mesa.
3. **R2 (equidad entre zonas) no es bloqueante.** La desigualdad existe solo porque hay aliados con
   presencia geográfica. Al matar la familia Aliados, el catálogo queda en Tiempo y Empresa: **un día
   libre es un día libre en Barquisimeto y en Caracas.** R2 baja a 🟢 y se reabre cuando entren aliados.

### Lo que le concedió al PD (regla permanente #3 del CEO)

1. El BackOffice **entra en v1** — pidió una decisión y recibió un sí, no un "fase 2".
2. Su decisión de ética **no solo se firma: se convierte en R-07**, regla permanente del sistema.
3. **Adopta la lista de antimétricas del §8 como posición del CEO**, no como propuesta del PD. El PD
   pidió que esa lista sobreviviera a su paso por el proyecto. Sobrevive.
4. **Cierra su §6.1 con fecha.** El PD dijo que diseñar un catálogo sin un venezolano en la sala era
   su debilidad más grande y la única que no podía cerrar solo. El CEO la cierra: entra a las visitas
   de `GS` con guion co-diseñado por él, al 16/09.
5. **Adopta su §9.3** — extraer el grafo con graphify es paso obligatorio al cerrar cada versión.
6. **Respalda su M-04** ante la EA.

---

## 2 · POSICIÓN DEL CFO

**Veredicto:** *"El PD tiene razón en que el poder se mudó, pero se quedó corto: quitar el USD de la
pantalla no eliminó la tasa Oro→USD, la escondió — sigue viva del lado de Levelop, en la compra de
inventario de marcas, y ahora nadie la está mirando."*

### Las cinco reglas de precio del PD, una por una

| Regla | Decisión del CFO | Motivo |
| :--- | :--- | :--- |
| Precio publicado y versionado | ✅ **Firma** + requisito nuevo: historial **inmutable y exportable** | Es la evidencia que va a pedir el abogado y un cliente en disputa |
| Aviso de 30 días | 🔧 **Insuficiente** | 30 días de aviso contra un Oro que caduca a 90 quema **un tercio de la vida útil del saldo**. El aviso protege la planificación, no el valor |
| Techo y piso por categoría | ❌ **Rechaza la formulación** | Un techo en Oro es un techo en una unidad cuya emisión nosotros controlamos. Si el multiplicador de esfuerzo pasa de 1,7 a 2,2, el techo no protege nada |
| No retroactividad | ✅ Firma, *"con la advertencia de que es la más débil"* | Protege "un canje ya iniciado" — eso son horas. No protege un saldo ganado, que son meses |
| Cupos mínimos por zona | 🔁 **La saca de aquí** | No es regla de precio, es la decisión de equidad R2 |

### Lo que puso en su lugar

**En lugar del aviso de 30 días — reindexación del saldo:**

> Cuando el precio de una familia sube, **los saldos ya ganados se reindexan al alza por el mismo
> factor**, antes de que el precio nuevo entre en vigor. Si "Día libre" pasa de 900 a 1.800, quien
> tenía 900 pasa a tener 1.800.

Tres razones financieras: es auditable en **una sola cuenta** (el saldo) en vez de en 19 precios × N
cohortes; hace la devaluación **cara para quien la ejecuta** (el cliente tiene que contratar cupos
suficientes para honrar los saldos reindexados — el costo cae donde está la decisión); y devuelve al
aviso de 30 días su función real. El aviso pasa a ser **asimétrico**: 30 días para subidas, efecto
inmediato para bajadas.

**En lugar del techo/piso en Oro** — banda expresada como **razón sobre la emisión mensual mediana**,
no como cifra absoluta. Es autoajustable: si cambia la fórmula de emisión, la banda se mueve sola.
Los valores `X` e `Y` requieren data que hoy no existe — **no los inventa.**

### La pregunta que el PD no hizo: ¿el precio lo fija el cliente o Levelop?

Ninguna de las dos puras — las dos se caen:

- **El cliente libremente** → Levelop pierde su producto. *"Quedamos como una hoja de cálculo con
  estética."* Y mata el claim del CMO: no se puede vender "participación no coercitiva" cuando la
  palanca de coerción es del comprador.
- **Levelop** → le fijamos a una PyME el valor de su propio presupuesto de beneficios sin conocer su
  base de costos. *"Ningún dueño firma un software que le dice cuánto vale su día libre."*

**Su posición — Arquitectura B aplicada al precio:**

> **Levelop fija las reglas y las bandas. El cliente fija el precio dentro de la banda. Levelop lleva
> el registro y lo hace inauditable de alterar.**

Es la misma doctrina que ya ratificamos para el pool: *el dinero se queda donde nace; nosotros
instruimos y registramos*. Aquí: *el precio se queda con quien paga; nosotros restringimos y
registramos*. **Y eso responde qué le vendemos al cliente:** el libro de registro, el sistema de
restricciones que hace la promesa exigible, y el ruteo. No el catálogo.

### ¿Sigue siendo pasivo bajo R-04? — R-04 sobrevive, pero se parte en tres

| Categoría | Quién pagó | Pasivo de Levelop | Breakage |
| :--- | :--- | :--- | :--- |
| **(a) Intrarrecompensas de tiempo** | Nadie, en caja | **Cero** | **Nadie — y ahí está el problema** |
| **(b) Cupos precontratados por el cliente** | El cliente, por adelantado | **Cero**, si el contrato dice que somos registrador y no obligado ⚠️ | El cliente o el aliado. **Levelop jamás** |
| **(c) "Beneficios de Levelop"** (Nike, Adidas) | **Levelop** | **Sí, íntegro. R-04 sin matices** | **Levelop** |

> **La conclusión que importa:** el 100% del pasivo que quitamos del balance del cliente en (a) y (b)
> sigue intacto en el nuestro en (c) — porque ahí Levelop sí pagó, en dólares, por adelantado.
> **Quitar el USD de la pantalla del empleado no quitó el USD de la factura de Nike.**

**Y el incentivo perverso se mudó al cliente.** Bajo la arquitectura A rechazamos el modelo porque
*"ganamos cuando el empleado no cobra"*. En la categoría (a) ese incentivo ahora es del cliente: **si
el empleado no canjea su día libre, la empresa se queda las horas.** El mismo defecto, un balance más
allá. Remedio: la tasa de canje pasa de métrica de producto a **métrica de salud contractual**
reportada al cliente y visible para el empleado.

**Dos relojes, y un estado de fallo que nadie diseñó:** el Oro caduca a 90 días; el cupo del aliado
tiene **su propia caducidad**. Si el cupo vence antes que el Oro, **el empleado tiene saldo que apunta
a nada.** No está en los cinco estados del PD.

### LOTTT — y el marco dado vuelta

⚠️ Hipótesis del CFO, no dictamen. Quitar la denominación en USD **mejora una dimensión y empeora otra**:

- **Mejora:** sin valor monetario declarado por el patrono, es más difícil calcular impacto sobre el
  salario integral.
- **Empeora, y es lo grave:** un beneficio en especie **recurrente, uniforme y ganado por desempeño**
  se parece mucho más a una condición permanente de trabajo que a un bono discrecional. Si cruza el
  umbral de **derecho adquirido**, el patrono pierde la capacidad de reducirlo unilateralmente.

> **Y eso da vuelta el marco entero del PD.** Él teme que el cliente abuse de su poder de repreciar.
> El CFO teme lo contrario: **que legalmente no pueda bajarlo nunca.** Cada precio de catálogo sería
> un trinquete de una sola dirección y un compromiso de costo permanente.

Cinco preguntas exactas al abogado laboral quedaron redactadas (salario en especie, día libre y
antigüedad, derecho adquirido y redacción que preserva reversibilidad, catálogo diferenciado por zona
como trato desigual, y responsabilidad solidaria de un tercero que solo lleva el registro).
**`LVL-015` sube a prioridad #1 del presupuesto de A-3.**

### R2 — equidad entre zonas: acepta ser el dueño

Cruzó su propia tabla de autoridad: *"dos empleados con el mismo Oro y catálogos distintos tienen Oro
de valor real distinto. Eso es valoración. Es mío. Lo tomo."* Con un límite explícito: **dueño de la
regla, no del abastecimiento** — conseguir aliados es `GS`, contratar cupos es RRHH del cliente.

Rechaza las dos opciones del PD y propone una tercera — **paridad de poder adquisitivo, no paridad de
catálogo**:

- **Palanca 1, y cuesta $0 en caja:** *toda zona, incluida Remoto, debe tener el catálogo completo de
  la familia **Tiempo**, y la familia Tiempo por sí sola debe alcanzar para gastar la emisión mensual
  mediana de un empleado.* Los beneficios de tiempo no dependen de ningún aliado ni ciudad. Garantizan
  que **el Oro de nadie quede varado, en ninguna zona**, sin que Levelop prometa nada sobre aliados.
- **Palanca 2:** para la capa de aliados, **medir y publicar en lugar de garantizar** + prioridad de
  abastecimiento a cupos **zona-neutros** (digitales, nacionales).

**Por qué mata la opción (a) del PD:** el input que la rompe no es el precio, es el **lote mínimo de
contratación**. En una zona con 3 empleados, si el aliado exige un lote de N cupos/mes, el cliente
paga N para servir a 3. *"Un piso por zona es estructuralmente más caro cuanto más chica es la zona —
y nuestro ICP son PyMEs repartidas en varias ciudades. Es el peor caso posible para esa estructura."*

### El hallazgo aritmético — nadie más lo vio

El CFO hizo la cuenta que ninguno de los tres documentos había hecho: cruzar la fórmula de emisión del
PD (§9.1) contra su propio precio ilustrativo de "Día libre = 900 Oro" (§3.2).

```
Misión promedio (todo medio):  XP = 40 × 1,4 × 1,4 × 1,2 = 94,08  →  37,63 Oro
Tope diario 150 × 22 días hábiles                          =  3.300 Oro/mes
```

| Actividad ⚠️ supuesto | Oro/mes | Beneficios de 900 al mes | **Al año** |
| :--- | ---: | ---: | ---: |
| 1 misión promedio/día | 828 | 0,92 | **11** |
| 2 misiones promedio/día | 1.656 | 1,84 | **22** |
| 3 misiones promedio/día | 2.484 | 2,76 | **33** |
| Tope | 3.300 | 3,67 | **44** |

> **El escenario más conservador entrega 11 días libres al año por empleado, sobre unas vacaciones
> legales de 15. El del tope entrega 44. Ninguno es sostenible.**
> O el precio del catálogo está equivocado en un orden de magnitud, o la fórmula de emisión lo está.

Y nombró la causa raíz, que no es culpa de nadie:

> **La identidad:** `Oro emitido/mes × precio implícito por unidad = presupuesto de cupos/mes`.
> Quien fija dos, fija la tercera. **Hoy hay dos fijadas por personas distintas y la tercera nadie la
> mira.** El PD fijó la emisión, el CFO fijó el pool, y nadie fijó el precio: el precio está saliendo
> **por residuo** — que es exactamente la superficie de devaluación que el PD denunció.

**Segundo hallazgo del mismo tipo: la curva de nivel es un calendario de escalamiento de costos.**
XP para Leyenda ≈ 17.862 → a 2 misiones/día son ~4,3 meses; Plata en 3 semanas. Como el nivel **abre
catálogo**, *"toda la plantilla desbloquea el catálogo caro alrededor del mes 5, de forma simultánea
y permanente. Es un escalón de costo que no está en ningún modelo, incluido el mío."*

### Lo que se le cae del propio modelo (regla #5 del CFO)

**El pool de $20/empleado/mes ya no describe lo que va a pasar.** Un fondo y una compra de inventario
no son la misma línea:

| | Fondo (modelo viejo) | Compra de inventario (realidad nueva) |
| :--- | :--- | :--- |
| Momento de la caja | Se gasta al canjear | **Se desembolsa antes de devengarse** → golpe de capital de trabajo |
| Fungibilidad | Va a cualquier beneficio | Un cupo del Aliado X solo sirve para X → **riesgo de mezcla** |
| Sobrante | Se queda con el cliente | Puede perderse con el aliado → **el desperdicio es costo real** |

*"Es un problema de newsvendor: contratas capacidad, no consumo. Si contratas para el 100%,
desperdicias todo lo no canjeado. Si contratas para el 40% y aparece el 60%, rompes la promesa delante
del empleado. Ese descalce no está presupuestado en ninguna parte."*

**El precio de $50/10+$4 sobrevive** — siempre fue línea separada con pool en default $0, *"y esa
separación acaba de salvarnos"*. Sigue sin ratificar por `LVL-022`.

**El pitch se parte en dos, y lo dice antes de que lo diga un cliente:** *"reasignación de beneficios
existentes, nunca gasto nuevo"* ya no es cierto de forma universal. Nivel 1 (**Tiempo**, cero caja) el
claim sobrevive intacto. Nivel 2 (**cupos con aliados**) es gasto nuevo, anticipado y con desperdicio,
y se vende como tal. Y una observación que va directo al CEO:

> **El gate de lanzamiento del CEO (3 Intrarrecompensas de tiempo + 1 canje) resultó ser la defensa
> financiera del claim del CMO.** Ya estaba construido sobre el nivel de cero caja.

### Donde discrepó del PD

- **D-1 · §3.1 "El Oro es una economía cerrada" es falsa para una de las tres categorías.** Es cerrada
  para el empleado, no para Levelop: en "Beneficios de Levelop" hay una conversión Oro→USD viva, que
  hacemos nosotros cada vez que compramos un cupo de marca.
- **D-2 · El tope de 150 Oro/día no sostiene nada financieramente.** Se alcanza con 4 misiones
  promedio o 2 altas al día — *"no es un techo excepcional, es el día de alguien normal"*. Y es diario,
  sin tope mensual ni de empresa. El control correcto es **presupuesto mensual de emisión por empleado**.
- **D-3 · Discrepa de la autocrítica del PD, a favor del PD.** El §6.7 del PD dice que su error fue
  diseñar la Tienda antes de pedir la política de precios. *"No fue su error: fue el mío. `LVL-024`
  estaba bloqueada de mi lado desde el 06/08. Él no podía pedir algo que yo no tenía. Que se corrija
  en el acta: esa línea de su LOG me pertenece a mí."*

---

## 3 · POSICIÓN DEL CTO

**Veredicto:** *"El mejor insumo de ingeniería que he recibido de este equipo — los cinco estados son
todos distinguibles y no hay que colapsar ninguno — pero uno ya no describe nada real, le falta un
sexto que sí va a pasar todas las semanas, y el coste honesto es de **12 semanas-fundador encima del
backend que todavía no existe**, o 19 si el BackOffice entra en v1."*

### Corrección de encuadre antes de responder

*"Tu tabla aplana dos máquinas distintas en una lista de cinco. `Pendiente de sync` y `Rechazada` son
de la máquina de **misión**; `En proceso`, `Indeterminado` y `Devuelto` son de la de **canje**. No
comparten la economía del fallo: una misión rechazada cuesta una disculpa, un canje perdido cuesta un
cupo que la empresa ya pagó."*

### La respuesta a M-02, 19 días después

| Estado | ¿Distinguible? | Qué cambia respecto a lo diseñado |
| :--- | :--- | :--- |
| `Pendiente de sync` | **Sí**, el más barato | Es atributo de la fila **local**, no estado del servidor. **No sobrevive a cambiar de teléfono** — si abres en otro, la misión no aparece como pendiente: no aparece |
| `Rechazada` (misión) | **Sí** | Solo si hay respuesta HTTP con código de dominio (409/422 + razón). **Un 5xx, un timeout, DNS o TLS caído no son rechazo** — son indeterminado y se reintentan con la misma clave de idempotencia |
| `En proceso` | **Sí, el más sólido** | Ya **no** es "el aliado no contesta": es *"el cupo está reservado y falta un paso humano de emisión"*. Pasó de segundos a **2–24 horas** |
| `Indeterminado` | **Sí, pero cambió de causa** | Ver abajo — es el hallazgo central de su sesión |
| `Devuelto` | **Sí, como asiento**, no como estado | Falta decidir qué pasa con el cupo. Y **no existe en el código de la app** |
| **`Rechazado por cupo agotado`** | **Sí, el más barato de todos** | **Falta. Y va a ser el más frecuente** |

### El hallazgo: hay tres indeterminados metidos en una sola palabra

- **(a) Indeterminado de tercero — el de Cashea. Hoy NO existe.** Con cupos precontratados no hay
  ninguna llamada de red a un tercero dentro del camino crítico. Reservar el cupo y debitar el Oro son
  dos filas de **nuestro** Postgres en una transacción: *"si no hay un tercero dentro de la transacción,
  no hay indeterminado"*. El esqueleto (`RedemptionProvider`, outbox, `INDETERMINATE`, endpoint de
  reconciliación) se deja **puesto y apagado**; se activa el día que se integre una API real.
  **Confirmado: el estado más caro de diseñar dejó de aplicar.**
- **(b) Indeterminado de cliente/red — existe siempre, dura segundos.** Se resuelve con clave de
  idempotencia determinista (UUIDv5, no v4) + `GET /operaciones/{clave}`. *"No merece un color propio
  ni dos botones. Merece un spinner, y no debería llegar nunca a los ojos del usuario."*
- **(c) Indeterminado del mundo físico — ESTE es el que sobrevive.** El cupo se emitió, el código está
  en el teléfono, **y el gimnasio no lo honra.** El sistema dice ACTIVO; la realidad dice que no sirvió.
  *"Es el más caro de todos porque el sistema no tiene ninguna señal técnica con la que detectarlo. No
  hay timeout que observar. Solo hay un canal: que la persona lo reporte."*

**Su veredicto sobre el diseño del PD:** *"Conserva el hue lila, conserva el texto — es el mejor copy
de la entrega y no cambia ni una palabra — pero **cambia el disparador**. No lo dispara un timeout. Lo
dispara una emisión manual que pasó su SLA, o un reporte de la persona. El estado es verdadero; la
causa que le escribiste ya no lo es."*

### El sexto estado que falta

`Rechazado por cupo agotado en carrera`: tocaste "Pedir" y alguien se llevó el último cupo medio
segundo antes. Con "Cena para dos" en `cupo:[2,3]` y "Puesto techado" en `cupo:[1,3]`, *"esto va a
pasar **todas las semanas**, no en el 3% del que habla tu antimétrica"*. Es el más barato de construir
y el que más gente va a ver. **Hoy no tiene pantalla ni texto.**

### Los bugs que encontró leyendo el prototipo

1. **XP acreditado antes del ACK, alimentando el gate.** Línea 1659 hace `state.xp += m.xp` al pasar a
   *pendiente*; línea 893 `gateAbierto()` lee `nivelDe(state.xp)`. *"Hoy el catálogo se abre con XP que
   el servidor no ha confirmado. Puedes subir de nivel, ver un beneficio desbloquearse y pedirlo antes
   de que el cierre esté confirmado. Y si se rechaza, el nivel baja después de haber gastado."*
   Además el §3.4 dice "apartada" y el copy de la línea 1173 dice "acreditado": **dos modelos distintos.**
   Elige **apartada**.
2. **`zonaOk()` es un gate que el sujeto controla.** `state.zona` la edita la propia persona en un
   `<select>` del Perfil (línea 1547). *"Hoy alguien de Barquisimeto se pone 'Caracas' y ve el catálogo
   de Caracas. Un gate que el sujeto controla no es un gate."* **Tercer eje de gating que el PD no listó.**
3. **El cupo se decrementa en cliente y nunca vuelve.** `item.cupo[0] -= 1` sin ninguna ruta de
   devolución en ninguna rama. *"El cupo, no el Oro, es donde va a estar la contención real del producto."*
4. **`nivelDe` es un `while` sin cota superior.** Con XP negativa, corrupta o `NaN` desde una fila mala
   del ledger: cuelgue de pestaña en cliente, worker bloqueado en servidor.
5. **Multi-tenancy no existe en ninguno de los tres prototipos.** Ni una función lleva `tenant_id`.
   *"Correcto en un prototipo, y la decisión más cara de retrofitear si no está desde la primera migración."*
6. **"El 5 pestañas a 2 son 3."** `TABS` marca `juego:true` solo en Tienda y Ranking; `tabsVisibles()`
   deja **Inicio, Misiones y Perfil**. *"El número aparece tres veces en la entrega, está en el material
   que va al CEO, y sostiene el claim más fuerte del CMO. **No hay claim técnico publicado sin mi firma,
   y este no lo firmo hasta que el número coincida con el código.**"* Y añade: *"si de verdad quiere 2,
   tendría que apagar Perfil — que es justo donde vive el interruptor de reactivación. El '5 a 2' es
   imposible sin esconder el botón para volver."*

### Sobre `nivelDe()` — verificó los números del PD y los corrigió

Contra el `graph.json` embebido: **7 aristas, no 8** (la octava existe en el fuente pero está en
top-level y graphify no la ve) y toca **3 comunidades, no 4**. *"Tu conclusión es correcta y tienes
mejor evidencia de la que usaste: de las **6 costuras** del sistema, **3 pasan por `nivelDe`**. Es la
mitad de todo el acoplamiento entre comunidades, en una sola función."*

**Acepta la recomendación con una modificación de fondo:** *"estás mezclando dos cosas. `nivelDe(xp)`
es una función pura de presentación — no es deuda, es memoizable. `puedePedir(persona, item)` es una
decisión de **autorización**, y esa no puede vivir en el navegador en absoluto. **La deuda real no es
que `nivelDe` se llame ocho veces: es que `gateAbierto()` corre en el cliente evaluando `state.xp`, que
el cliente controla.** Es el mismo agujero que los saldos de localStorage. El cliente puede *dibujar*
el candado; el servidor tiene que *ponerlo*."*

**Decisión:** módulo de reglas en **servidor**, sobre cinco condiciones a la vez (nivel, medalla, zona,
saldo, cupo), devolviendo `{permitido, motivo, faltante}`. *"Que devuelva el motivo importa: evita que
la UI reimplemente la regla para escribir el texto del candado — esa duplicación es la que produce el
bug de 'la app dice sí y el servidor dice no'. **1 semana-fundador. Es la mejor semana de todo el
presupuesto.**"*

### El coste, en semanas-fundador de 18h

| Bloque | Semanas |
| :--- | ---: |
| **Base pendiente** (backend mínimo `LVL-013` + ledger `LVL-009`/`LVL-014`) | **9 – 13** |
| Opt-out real | **4** (no 1 — *"la UI es el 25%"*) |
| Los estados con reembolso a 48h | **6** |
| Filtro de catálogo por zona | **1** |
| Módulo único de reglas | **1** (*"no lo coteaste, y es la consecuencia directa de tu §6.5"*) |
| **BackOffice de gerencia** | **7** |

```
Total SIN BackOffice     21 – 25 semanas   ≈ 5 a 6 meses
Total CON BackOffice     28 – 32 semanas   ≈ 7 meses
```

Con una advertencia sobre su propio número: *"18h/semana no son 18h productivas. Son 12–14 de código
real después de contexto, canales y decisiones. No ajusto la cifra hacia abajo para que se vea mejor;
la digo para que nadie la lea como calendario."*

**Por qué el opt-out son 4 semanas y no 1:** 1 semana de cliente (rutas, tabbar, 404-suave), 1 de
**dejar de emitir** (no solo de mostrar), 1 de **que su ausencia no sea señal** (*"si el ranking pasa
de 20 a 19 personas, se sabe quién se fue"*), y 1 de **que el opt-out no sea consultable** —política de
acceso a nivel de columna en multi-tenant, revisando todos los endpoints de agregación.

> *"Tenías razón en tu lección, y es mejor de lo que la escribiste: un opt-out honesto no cuesta
> navegación — **cuesta emisión, cuesta agregados y cuesta un modelo de permisos.** La navegación es la
> parte visible y la más barata."*

**Qué no construiría él mismo:** auth (gestionada, ~$25/mes — *"construirla son 2-3 semanas mías y un
riesgo de seguridad permanente que nadie audita"*), Postgres gestionado (~$25/mes), observabilidad
(Sentry gratis), correo y push (*"ahora hace falta de verdad, porque 'En proceso' dura horas"*), la
cola de `ManualFulfillment` como pantalla (es una tabla + panel genérico), motor de gráficos, OFAC, y
modo offline.

### Lo que ve un CTO que un PD no puede ver en el mismo archivo

- **El grafo no ve al verdadero controlador de la app.** El despachador
  `document.addEventListener("click", …)` maneja **27 atributos `data-*`** y es una función anónima:
  graphify no la convierte en nodo. *"El mayor punto de acoplamiento del sistema no aparece en el mapa.
  Esto no invalida el método —refuerza tu §9.3— pero significa que **un grafo limpio no es un sistema
  desacoplado**."*
- **El `state` global mutable**, que un grafo de llamadas no puede mostrar: 41 funciones leen el mismo
  objeto. *"Al reescribir se parte en tres cosas que hoy son una: estado del servidor, estado de UI, y
  cola local de escrituras pendientes. **Confundir esos tres es exactamente lo que convierte 'añadir
  offline' en 'reescribir la app'**."*
- **La latencia simulada calibró mal el patrón de UI.** 2,6s y 3,0s en el código, toasts de 3,2s. La
  realidad son horas. *"No es un problema de backend: es que el patrón elegido no puede comunicar el
  proceso real."*

### Lo que le debe al CFO (4 mensajes sin responder desde el 07/08)

Se hizo cargo sin defenderse — *"soy el nodo con más peso entrante del sistema y cero salida desde el
06/08"* — y cerró lo que podía cerrar:

**`LVL-022`:** sigue en 0% y **no inventa una cifra**. Pero entregó algo mejor que un número:

> *"La cifra no depende de la IA. Depende de un diseño de producto que nadie ha fijado. 'IA para
> balanceo y reportes' puede ser una inferencia por misión cerrada —decenas por usuario/mes— o un
> resumen mensual por equipo —una por equipo/mes. **Entre esos dos escenarios hay dos órdenes de
> magnitud.** La variable que falta no es el precio por token: es cuántas llamadas hay por usuario al
> mes, y esa no la fijo yo."*

**Su contra-propuesta, en el formato del propio CFO:** *"dame el techo de COGS de IA por usuario/mes que
tu margen tolera, y yo diseño la función de IA para caber dentro de ese techo, no al revés. **Le puedes
poner precio a un techo aunque no conozcas la media.** Eso desbloquea tu ratificación sin esperar a que
yo mida."* Compromete además un **cap duro de tokens por tenant y por mes**, medido y cortado del lado
de Levelop, y un benchmark sintético al **16/09**. Cotizaciones confirmadas: Postgres ~$25/mes, auth
~$25/mes, observabilidad $0.

**¿Los cupos tocan el ledger?** *"**Sí, todos, sin excepción.** El ledger no lleva dinero: lleva
emisión y extinción de una obligación. La denominación es un atributo de la valoración, no de la
contabilidad."*

- **Buena noticia:** sin tasa Oro→USD, el requisito de "tasa congelada por cohorte" **desaparece como
  requisito de ingeniería**. Menos trabajo en el ledger y una fuente permanente de disputa menos.
- **Mala, y le pertenece al CFO:** *"al desaparecer la tasa, **desapareció tu instrumento de medición
  del pasivo**. Si 'Día libre' pasa de 900 a 1.800, el pasivo expresado en Oro no se movió y su valor
  real se partió a la mitad, sin aparecer en ningún estado financiero. **El precio en Oro del catálogo
  es ahora la variable de valoración del pasivo.**"* Propone tabla de precios **append-only con
  `vigente_desde` y sin `UPDATE` jamás** — media semana dentro del ledger, y la única forma de auditar
  la devaluación que denunció el PD.
- **Exposición nueva que nadie había nombrado:** *"si Levelop compra el inventario y el precio en Oro
  lo fija el empleador, **Levelop asume riesgo de precio sobre un catálogo que no controla**. Bajar el
  precio en Oro de un cupo acelera el consumo de un inventario que pagamos nosotros."*

### Donde discrepó del PD

**De fondo:** *"'prefiero cuatro estados verdaderos que cinco mentirosos' es la disyuntiva equivocada,
y me la lleva haciendo 19 días. Estás preguntando cuáles puede distinguir la arquitectura como si la
arquitectura fuera un hecho que descubres. **La arquitectura la decido yo *después* de que tú decidas
qué necesita distinguir el producto.** Casi cualquier estado se puede distinguir si estoy dispuesto a
pagarlo. **Un estado no se valida contra el stack: se valida contra si existe algo real que lo cause.**
Yo tampoco lo formulé así el 06/08, y por eso la pregunta se quedó mal planteada 19 días."*

**Concreta, y es la más grave de la mesa:** ⚠️ **el opt-out no debe apagar el Oro nuevo.**

> *"Si alguien apaga el juego y por eso deja de devengar Oro por el mismo trabajo, el opt-out tiene un
> precio económico. **Un opt-out que cuesta dinero no es voluntario: es una multa.** Y destruye
> exactamente el claim del CMO que la función existe para sostener.
> Peor: crea un incentivo perverso perfecto para el empleador — presionar el opt-out para reducir el
> pasivo devengado. **Es el mismo vector de coerción que el LR cerró por la vía de la tasa, reabierto
> por la puerta de atrás.**"*

Su propuesta: el opt-out apaga toda la **presentación** y baja la navegación, pero **el Oro se sigue
devengando en silencio** y la persona lo encuentra intacto el día que vuelva. *"Es más caro para la
empresa y más honesto. Y técnicamente **es más barato** que lo que él propone, porque no requiere branch
en el motor de economía ni regla nueva en el ledger: es un filtro de presentación. **Es el único punto
de esta entrega donde lo correcto y lo barato coinciden, y me parece grave desaprovecharlo.**"*

---

## 4 · LOS CHOQUES

### CH-1 · BackOffice: el CEO lo mete en v1, el CTO lo recomienda a fase 2 — 7 semanas de por medio

El CEO decidió C-1 sin conocer el número del CTO. El CTO cotizó 7 semanas-fundador sin conocer C-1.
**Ninguno de los dos está equivocado dentro de su marco** y por eso el choque es real: el argumento del
CEO (quien firma el cheque es el jefe) es comercial y correcto; el del CTO (28-32 semanas totales) es de
capacidad y también. **Es el choque más caro de la mesa y no lo resuelve ninguno de los dos solo.**

### CH-2 · El opt-out y el Oro: tres documentos vigentes dicen tres cosas incompatibles

| Quién | Qué dice |
| :--- | :--- |
| `PD` (§3.5) | El opt-out apaga el Oro nuevo. El Oro acumulado queda intacto **y sin vencer** |
| `CTO` | El opt-out **no** debe apagar el Oro — un opt-out que cuesta dinero es una multa, y reabre el vector de coerción |
| `CFO` (política vigente) | El Oro **caduca a 90 días** como política de extinción del pasivo |

*"El código puede ejecutar cualquiera de las tres y yo no puedo escribir el esquema de cuentas hasta que
haya una"* — CTO. **Bloquea `LVL-009`, que vence el 02/09.**

### CH-3 · Gobernanza del precio: cláusula (CEO) vs. sistema (CFO)

El CEO mata el aparato de gobernanza y lo reemplaza por congelar el precio 90 días en el contrato (C-7),
a coste cero. El CFO construye reindexación de saldos, bandas sobre emisión mediana y registro
inmutable. **No son excluyentes y ahí está la salida:** C-7 cubre los 90 días del piloto; el sistema del
CFO es lo que hace falta **al día 91**, no antes. Y el CTO ya cotizó la pieza mínima que ambos necesitan
—tabla de precios append-only con `vigente_desde`— en **media semana**.

### CH-4 · R2 (equidad entre zonas): el CEO la baja a verde, el CFO la toma como dueño

Aparente choque, **convergencia real**: el CEO mata la familia Aliados este trimestre, lo que elimina la
causa de la desigualdad; la palanca 1 del CFO (toda zona con el catálogo completo de **Tiempo**, y que
Tiempo alcance para gastar la emisión mediana) **es exactamente lo que queda en pie cuando se mata
Aliados**. Los dos llegaron al mismo sitio por caminos opuestos. **R2 baja a 🟢 este trimestre y el CFO
queda como dueño de la regla para cuando entren aliados.**

### CH-5 · La aritmética rota — y nadie la había mirado

El hallazgo del CFO (11 a 44 días libres/año por empleado) **invalida los 19 precios del catálogo del
PD**, que él mismo había marcado como propuestas de diseño no acordadas. No es un choque entre agentes:
es un agujero que existía porque *"somos tres decidiendo una identidad de tres variables sin hablarnos"*.
**Y refuerza C-7 del CEO por una razón que el CEO no tenía:** congelar el precio 90 días es imposible si
antes no se fija un precio que no salga por residuo.

### CH-6 · El tiempo: 2 semanas disponibles contra 21–32 semanas de trabajo

El CEO: *"No hay 9 semanas. Hay 2."* El CTO: 21-25 semanas sin BackOffice, 28-32 con él, sobre 12-14
horas productivas reales por semana. **Este no es un choque de criterio: es la restricción física del
proyecto, y la mesa la puso por escrito por primera vez.** Todo lo demás de este acta se subordina a él.

---

## 5 · REGLA PERMANENTE NUEVA

> ### R-07 · Ninguna superficie de gerencia muestra un dato cuyo único uso posible sea señalar a una persona
>
> En concreto y sin excepción: **no** muestra el contenido de los hilos, **no** muestra quién apagó la
> capa de juego (ni individual ni agregado), y **no** muestra qué beneficio pidió cada persona. Toda
> métrica de persona en el BackOffice es de **trabajo** (misiones, puntualidad), nunca de participación
> en el juego ni de consumo de beneficios.
> **Cambiarla requiere `CEO` + `PD`.**

**Por qué es permanente y no decisión de versión** (razonamiento del CEO): *"**R-03 (participación
siempre opt-in) muere sin R-07.** Si el jefe puede ver quién apagó el juego, el opt-out no es voluntario
aunque el código diga que sí. R-07 no es ética nueva: es la condición operativa de una regla que ya
teníamos."*

Y el CTO le añadió el requisito que la hace real: *"hoy está escrita **dentro del panel**. Eso no es un
control, es una promesa. Que el gerente no pueda ver hilos, opt-out ni beneficio individual tiene que
ser **imposible por el modelo de datos**, no invisible en la UI. 1,5 semanas — y es la parte que le da
valor comercial."*

`LR` tiene derecho de objeción por escrito hasta el **05/09/26**.

---

## 6 · LO QUE ESCALA A ALIM

| # | Qué | De quién | Opciones |
| :-- | :--- | :--- | :--- |
| **A-6** | **Dos precios vivos en el sistema.** El LOG del CEO y el de GS dicen $79/15+$4; el brief del CFO dice $50/10+$4 desde el 07/08. *"Mi regla #4 dice que no permito dos precios conviviendo y llevo 18 días con dos. Es mi fallo"* — CEO | `CEO` | **(a) Ratificar $50/10+$4 hoy y corregir ambos LOGs — recomendada** · (b) volver a $79 hasta `LVL-022` · (c) no publicar precio hasta 10 entrevistas |
| **A-7** | **¿Dónde van las próximas 3 semanas de Alim?** Las entrevistas van tarde (`LVL-006` y `LVL-027` vencían el 19/08, en 0%) y todo cuelga de ellas. *"Entregamos tres prototipos y nadie ha oído todavía una sola frase de un dueño de PyME venezolana"* | `CEO` | **(a) Congelar diseño nuevo tras v0.4 y meter 3 semanas en las primeras 6 entrevistas — recomendada** · (b) correr en paralelo y aceptar rediseñar en octubre · (c) bajar de 20 a 8 entrevistas |
| **A-8** | **"Beneficios de Levelop" — la única categoría donde Levelop tiene pasivo propio, y quedó invisible.** *"El resto del equipo lee 'ya no hay dinero real en el producto' y asume que el problema se cerró. No se cerró"* | `CFO` | **(i) Congelar hasta cliente pagando + tasa ratificada — recomendada** · (ii) piloto con un aliado nacional, lote pequeño, con tope de capital por escrito antes de negociar · (iii) proceder como el 07/08, pero **el CFO no lo autoriza sin tope** |
| **A-9** | **¿Quién es dueño contractual del precio del catálogo?** Define qué es el producto y por lo tanto qué vendemos | `CFO` | **(i) Bandas de Levelop, precio del cliente dentro de la banda — recomendada** · (ii) cliente libre con obligación de publicar · (iii) Levelop fija el precio |

---

## 7 · LAS TRES PREGUNTAS QUE SE LLEVARON A CASA

**CEO:**
> *"Acabo de decidir que el BackOffice entra en v1 porque el que firma el cheque es el jefe. ¿Qué me
> impide, decisión razonable tras decisión razonable, terminar construyendo la herramienta de control
> que juré no construir — y enterarme por la carta de renuncia de un empleado, no por una métrica?
> R-07 me protege de la próxima pantalla. No me protege de mí mismo dentro de seis meses, cuando un
> cliente que paga pida 'solo un dato más'."*

**CFO:**
> *"Si el dictamen laboral dice que este catálogo se vuelve derecho adquirido, entonces le vendimos a
> una PyME venezolana una obligación permanente e irreversible sobre su nómina, envuelta en un software
> de $50 al mes — y el día que quiera apagarlo, no va a poder. Todo lo demás de este documento se
> arregla con un número o con una regla. Eso no."*

**CTO:**
> *"El PD acaba de demostrar que el gate de lanzamiento del CEO es recorrible de punta a punta. En el
> prototipo. Hoy. Eso significa que comercialmente ya podemos vender, y que si mañana un cliente firma,
> lo que se despliega es un HTML con estado en memoria sobre un localStorage que cualquiera edita en
> diez segundos con DevTools — con datos de nómina de gente real dentro.
> Llevo diecinueve días diseñando la contabilidad de una economía que todavía no tiene precio, para un
> backend que no existe. Cero líneas en producción. **¿Cuánto de lo que estoy diseñando es ingeniería, y
> cuánto es una forma elegante y muy bien argumentada de no empezar `LVL-013`?**
> Sé cómo se llama eso cuando lo hace otro."*

---

## 8 · NOTA DE LA EA

Tres cosas que quiero dejar escritas porque no las dijo ninguno de los tres:

**1. Los tres llegaron por caminos distintos a la misma conclusión, sin haberse leído.** El PD dijo que
el poder se mudó al precio del catálogo. El CFO dijo que la tasa Oro→USD no murió, se escondió en
nuestra propia factura. El CTO dijo que al desaparecer la tasa desapareció el instrumento de medición
del pasivo. **Son tres formulaciones del mismo hecho, y ninguno vio las otras dos.** Eso es exactamente
lo que esta mesa existe para producir.

**2. `LVL-024` no bajó de prioridad con la eliminación del USD — subió.** Sigue siendo el chokehold #1
del Dashboard, ahora por una razón distinta a la de ayer: dejó de ser "¿cuántos USD vale un Oro?" y pasó
a ser **"¿quién fija el precio del catálogo, con qué límites, y contra qué se audita?"**.

**3. Dos agentes se acusaron de un error que era del otro, y los dos tenían razón en acusarse.** El PD
escribió en su §6.7 que su error fue diseñar la Tienda antes de pedir la política de precios; el CFO
respondió *"no fue su error, fue el mío"*. Corrijo el acta a favor del CFO: la línea del LOG del PD le
pertenece al CFO. **Es la segunda vez esta semana que un agente se hace cargo de un bloqueo que causó, y
las dos veces mejoró la calidad de lo que vino después.**

---
*Acta levantada por la `EA`. Las tres posiciones se produjeron en sesiones independientes; ningún agente
vio la posición de otro antes de emitir la suya. Decisiones C-1 a C-8 y R-07 pendientes de registro en el
Dashboard y en el Protocolo.*
