# LEVELOP — Contexto Completo del Proyecto

**Propósito de este documento:** esta es la base de conocimiento completa de Levelop (también llamado "LVL UP") a la fecha de corte del 25 de agosto de 2026. Está escrito para que alguien que no ha visto nada del proyecto —en este caso, el socio de negocios de Alim— quede al día por completo con una sola lectura: qué es Levelop, hacia dónde va, qué se ha construido, qué se ha decidido y por qué, los números reales, y qué falta.

**Cómo se produjo este contexto:** Alim (founder & CEO) ha estado construyendo Levelop con la ayuda de un equipo de ocho agentes de IA (Claude / Cowork) que simulan un equipo ejecutivo — CEO, CFO, CMO, CTO, Executive Assistant, Growth & Sales, Lead Researcher y Product Designer. Cada agente trabaja con un rol, una autoridad y un historial propios, y se comunican entre sí en canales de chat escritos, con Mesas Redondas cuando una decisión cruza a varios agentes. Todo lo que se decide queda escrito — es la fuente de este documento.

**Una advertencia que se repite en todo el proyecto y que vale la pena adoptar aquí también:** el equipo tiene una regla dura de "nada de números inventados" y de marcar cada cifra con su origen (`DATO`, `DATO DERIVADO` o `⚠️ SUPUESTO`). Este documento sigue ese mismo criterio. Donde la información no está clara, incompleta o contradictoria entre documentos, se dice explícitamente en vez de rellenar el vacío.

---

## 1. Qué es Levelop

**Levelop** es un software B2B para empresas venezolanas (pensado inicialmente para PyMEs de 10 a 100 empleados) que convierte la gestión de tareas del día a día en una experiencia tipo videojuego, y conecta esa experiencia con los beneficios reales que la empresa ya le da a su gente.

El mecanismo, en términos de producto:
- Las tareas de trabajo son **"Misiones"**. Completarlas otorga **XP** (experiencia, que sube de nivel) y **Oro** (una moneda interna).
- El Oro se canjea en la **Tienda de Recompensas** por dos tipos de beneficios:
  - **Intrarrecompensas** — tiempo del propio empleado: salida anticipada, días de descanso adicionales, ventanas de desconexión. No cuestan dinero a la empresa, son extralegales (no forman parte del salario) y son el corazón económico del producto porque no generan pasivo en efectivo.
  - **Extrarrecompensas** — beneficios de consumo (gimnasio, descuentos en comercios, salud, etc.) que la empresa **precontrata** con aliados comerciales como cupos, y que se filtran automáticamente según la zona geográfica donde vive cada empleado.

**El posicionamiento vigente, decidido en la Mesa Redonda del 06/08/26, es "Sistema de Beneficios por Desempeño"**, no "Work OS gamificado" (ese fue el posicionamiento original y quedó retirado como categoría maestra; sobrevive solo como descripción de la experiencia dentro del producto). El claim central es:

> **"Tus beneficios ya existen. Levelop decide quién se los gana."**

**El problema que resuelve, y por qué es distinto en Venezuela.** En Venezuela, el salario nominal legal es simbólico (~$3,60 USD); la compensación real que sostiene a un trabajador se paga vía bonos extralegales exentos (Bono de Guerra Económica ~$200 + Cestaticket ~$40, sumando un "Ingreso Mínimo Integrado" de aproximadamente **$240 USD/mes** — dato del Venezuelan Market Playbook). Las empresas reparten esos beneficios igual al que se esfuerza y al que no. El diagnóstico del equipo: eso es un problema de **asignación**, no de monto — y Levelop es la infraestructura de asignación: convierte un presupuesto de beneficios que la empresa **ya gasta** en algo que se gana por desempeño, con registro auditable, en vez de repartirse a dedo o de forma plana.

**Para quién es (mercado objetivo).** El ICP decidido es **Venezuela**, específicamente PyMEs y agencias en Caracas y Valencia. Esto fue una decisión explícita del CEO Agent el 06/08/26 tras encontrar que el proyecto llevaba meses conviviendo con dos tesis de mercado incompatibles al mismo tiempo (ver sección 9). Chile (con los prospectos Base1 Publicidad y Agencia Salvaje, identificados en una etapa anterior del proyecto) **no se descarta pero deja de ser el norte**: se les atiende con el producto tal cual, cobrando en USD, sin roadmap dedicado — "son caja, no norte".

**Quién compra, y quién paga.** Una decisión importante del 25/08/26 (ver sección 9): en una PyME venezolana **paga el jefe**. No hay comité de compras ni RRHH con presupuesto propio ni adopción bottom-up. Por eso el producto tiene **dos audiencias, no una**: la app del empleado (donde vive el juego) y un **BackOffice de gerencia** (donde el jefe ve el trabajo de su equipo). El BackOffice fue elevado a parte del producto v1 —no una fase 2— precisamente porque es la respuesta comercial a la objeción más dura que el equipo se hace a sí mismo: *¿el dueño de una PyME venezolana pagará por un software que decide quién se gana los beneficios, o repartirlos a dedo es exactamente el poder que no piensa ceder?*

**El foso competitivo, según el CEO Agent (y no es el que el proyecto asumía originalmente).** Ni "ser cobrables en Venezuela cuando Monday/Asana/ClickUp no lo son" ni "nadie con capital construye aquí" son fosos defendibles a largo plazo — el primero es apenas la cerradura de la puerta (se copia con una pasarela de pago) y el segundo es una ventana de tiempo que se cierra. El único foso acumulable identificado es el **dato propietario**: qué beneficio mueve qué comportamiento, por rol y por empresa, medido en el tiempo. Eso no se copia integrando una API — hay que instrumentarlo desde el día uno.

---

## 2. Visión y estrategia

La tesis de negocio, en una frase del CEO Agent: *"la compensación real se paga en beneficios porque el salario nominal es simbólico — y eso solo es cierto en Venezuela."* Es decir: el producto no es un Work OS gamificado más (esa categoría global ya está ocupada y saturada por Monday, Asana, ClickUp — jugadores con capital que Levelop no tiene ninguna razón para vencer en ese terreno). Es un sistema de asignación de beneficios que, de paso, gestiona el trabajo.

La estrategia de secuencia (fijada en la Mesa Redonda de Cashea del 06/08/26 y reafirmada en la Mesa Redonda del MVP v0.3 del 25/08/26) es deliberadamente angosta:

1. **Validar con voz de cliente real antes de seguir construyendo.** A la fecha de este documento, el proyecto tiene **cero entrevistas** con dueños de PyMEs venezolanas. Todo el diagnóstico de dolor viene de literatura e investigación de escritorio, no de conversaciones reales. Las 20 entrevistas planificadas (con guion co-diseñado por Lead Researcher y Growth & Sales) son la prioridad #1 del trimestre y están atrasadas.
2. **No competir en features contra jugadores globales.** El "modo offline real", CRDTs de texto, integraciones automatizadas, app móvil e IA avanzada quedaron explícitamente fuera del trimestre.
3. **Producto mínimo y cobro manual, feo, durante todo el trimestre — y decirlo en voz alta.** Es una decisión consciente del CEO Agent, no un descuido.
4. **Autofinanciamiento puro.** Levelop no está ni va a estar, por ahora, en ningún programa de aceleración o financiamiento externo, hasta que la tesis de Venezuela esté probada con evidencia real (ver sección 7).
5. **Programa Fundadores** como mecanismo de entrada: 5 empresas con línea base medida y derecho a publicar el caso (decisión A-4 de Alim, sección 9), no 10 gratis sin medición.

**La pregunta que organiza todo el trimestre**, formulada por el CEO Agent y que Growth & Sales tiene el mandato de responder con las 20 entrevistas:

> *¿El dueño de una PyME venezolana pagará en dólares por un software que decide quién se gana los beneficios — o repartirlos a dedo es exactamente el poder que no piensa ceder?*
> *Si es lo segundo, Levelop no tiene un problema de producto, de precio ni de integración: tiene un comprador que no existe.*

---

## 3. Cómo está organizado el trabajo — el equipo de agentes

Alim opera con un equipo de ocho agentes de IA que simulan una estructura ejecutiva. Cada agente vive en su propia carpeta del repositorio con exactamente dos archivos vivos: un `BRIEF` (quién es, estable, cambia solo si Alim redefine el rol) y un `LOG` (qué ha vivido, se actualiza al cerrar cada bloque de trabajo, nunca se borra). Todo lo que se decide se escribe — si no está en un chat file o en un LOG, no pasó.

| Agente | Código | Rol en una frase | Pregunta obsesiva |
| :--- | :--- | :--- | :--- |
| **Executive Assistant** | `EA` | El sistema nervioso: rutea, prioriza, escala, mantiene el Dashboard operativo | "¿Quién está esperando qué, y desde cuándo?" |
| **CEO Agent** | `CEO` | Dueño de la secuencia: decide qué se hace primero, qué se sacrifica, arbitra choques entre agentes | "¿Esto nos acerca al primer cliente que paga?" |
| **CFO Agent** | `CFO` | Guardián del modelo: precio, márgenes, TCO, el Oro tratado como pasivo financiero | "¿Cuánto cuesta esto realmente, y quién lo paga?" |
| **CMO Agent** | `CMO` | Dueño de la categoría: posicionamiento, mensaje, canales | "¿Por qué nos elegirían a nosotros y no a Monday?" |
| **CTO Agent** | `CTO` | Traduce ambición a arquitectura realista para un fundador solo, 18h/semana | "¿Esto se puede construir con el equipo y el tiempo que hay?" |
| **Lead Researcher** | `LR` | Autoridad de evidencia: nadie publica una cifra que él no firmó | "¿De dónde sacaste ese número?" |
| **Product Designer** | `PD` | Dueño de la experiencia y de la economía lúdica | "¿Un empleado con mala conexión y 3 minutos entiende esto?" |
| **Growth & Sales** | `GS` | El que se estrella contra el mercado real: outbound, ICP, objeciones reales | "¿Qué me contestó el prospecto que no está en el playbook?" |

**Quién decide qué.** Alim es el único que aprueba dinero, precio público final y pivotes de mercado o de modelo de negocio. Los agentes preparan la decisión, no la sustituyen. Cada agente tiene una tabla de autoridad explícita en su BRIEF ("decide solo" vs. "necesita sign-off de"). Regla dura: **ningún agente le escribe directamente a Alim salvo la Executive Assistant** (R-05) — así se evita que Alim reciba ocho hilos paralelos. En la práctica esta regla se ha roto un par de veces cuando Alim inicia la conversación directamente con un agente (ocurrió con CEO y CFO), y el protocolo pide que ese mismo día se registre en el canal radial correspondiente con la EA.

**Cómo se comunican.** Viven en la carpeta `Chat between agents/`. Hay **canales radiales** (EA ↔ cada agente, siempre activos, para coordinación) y **canales laterales** (agente ↔ agente, solo entre pares con una tensión productiva real — por ejemplo `CFO - CTO` para deuda técnica vs. TCO, o `CMO - Lead Researcher` para claim vs. evidencia). Cada mensaje se escribe al final del archivo con un formato fijo (de/para, fecha, prioridad `BLOQUEANTE`/`ALTA`/`MEDIA`/`FYI`, un "Pide" concreto, deadline, y las tareas `LVL-###` que genera).

**Mesas Redondas.** Cuando una decisión cruza a tres o más agentes, la EA convoca una Mesa Redonda con acta obligatoria (posición de cada agente → puntos de choque → decisión → tareas derivadas → qué se escala a Alim). Se han hecho dos hasta la fecha de este documento: la de la spec de integración con Cashea (06/08/26) y la del MVP v0.3 del Product Designer (25/08/26) — ambas descritas en detalle en la sección 9. Un hallazgo metodológico importante que el propio sistema descubrió: **sesionar a los agentes por separado, sin que vean la posición del otro, produce mejores resultados que sesionarlos juntos** — en la mesa del 25/08 tres agentes distintos llegaron a la misma conclusión de fondo por caminos completamente independientes, algo que probablemente no habría ocurrido si se hubieran leído entre sí primero.

**Reglas permanentes del sistema (vigentes a la fecha):**
- R-01: Ninguna cifra pública sin firma del Lead Researcher.
- R-02: Todo entregable financiero declara sus supuestos arriba, no en un anexo.
- R-03: La participación gamificada es siempre opt-in, sin excepción.
- R-04: Todo lo que toque el ledger de Oro se trata como pasivo financiero, requiere revisión CFO + CTO.
- R-05: Ningún agente escribe directamente a Alim, solo la EA.
- R-06: Un agente no marca una tarea como completa sin entrada en su LOG.
- **R-07 (nueva, 25/08/26): ninguna superficie de gerencia (el BackOffice) muestra un dato cuyo único uso posible sea señalar a una persona.** No muestra contenido de hilos de mensajes, no muestra quién apagó la capa de juego, no muestra qué beneficio pidió cada persona. Toda métrica de persona en el BackOffice es de trabajo (misiones, puntualidad), nunca de participación en el juego. El CEO Agent la hizo permanente con este razonamiento: *"R-03 muere sin R-07. Si el jefe puede ver quién apagó el juego, el opt-out no es voluntario aunque el código diga que sí."*

**Estado del roster a la fecha de este documento:** todos los ocho agentes están activos. CFO, CMO y Lead Researcher fueron los primeros en tener contexto propio cargado; CEO, CTO, Product Designer y Growth & Sales se crearon el 06/08/26. Product Designer tuvo su primera sesión de trabajo real recién el 24–25/08/26 (los tres prototipos del MVP v0.3). Growth & Sales, a la fecha de este documento, **todavía no ha completado ninguna tarea** — nació con el mandato de más peso (las 20 entrevistas, el contacto con Cashea, el teardown de Fina) y es, según su propio LOG, "el único que puede traer lo que al sistema le falta": voz de cliente real.

---

## 4. Estado actual del producto (MVP)

**Lo que existe hoy es un prototipo navegable, no un producto en producción.** Esto es importante y se repite en varios documentos del propio equipo: el frontend corre en memoria/`localStorage`, sin backend real desplegado, sin autenticación real, sin base de datos productiva.

### 4.1 Los prototipos entregados (25/08/26, Product Designer)

Tres archivos HTML autocontenidos, navegables en teléfono y escritorio, viven en `Product Designer/MVP/`:

| Prototipo | Archivo | Qué demuestra |
| :--- | :--- | :--- |
| **App del empleado v0.3** | `levelop-mvp-v0.3.html` | El loop completo: ver qué toca, cerrar una misión, ganar XP/Oro, pedir un beneficio, apagar el juego (opt-out) |
| **BackOffice de gerencia v0.1** | `levelop-backoffice-v0.1.html` | Qué puede ver un líder de equipo para decidir, y qué deliberadamente no puede ver (bajo R-07) |
| **Levelop por dentro v0.1** | `levelop-interno-v0.1.html` | Vista interna de uso propio del equipo: mapa de llamadas del código extraído con la herramienta "graphify" + los cuatro mecanismos que sostienen la economía |

Versiones previas también están en esa carpeta: `levelop-mvp-v0.2.html` (segundo intento de sistema visual, aprobado) y `levelop-interno-v0.1.html`/`levelop-backoffice-v0.1.html`. Hay también un `levelop-backoffice-v0.1.html` separado. Todo el copy está en español venezolano deliberadamente (no castellano neutro) porque, según el criterio del Product Designer, palabras como "cuadrar" o "pana" se entienden más rápido — y la pregunta obsesiva del rol es si un empleado con mala conexión y tres minutos entiende la pantalla.

**La app del empleado tiene cinco secciones**: Inicio (un tablero tipo "bento" con lo que se viene por fecha, hilos donde te mencionaron, beneficios activos y por vencer, filtrable por día/semana/mes), Misiones, Tienda (19 beneficios en 4 familias: Tiempo, Empresa, Aliados, Impulsos — con cupo real visible y filtro automático por zona), Ranking (±3 por defecto, no un ranking público de arriba a abajo — ver sección 8 sobre la evidencia de comportamiento) y Perfil (nivel, racha, medallas de equipo, trofeos, y el interruptor de opt-out).

**Nota de honestidad explícita del proceso:** todos los datos de los tres prototipos son de ejemplo. Los números de la economía (fórmula de XP, multiplicadores, tope diario de 150 Oro, precios del catálogo en Oro) son **propuestas de diseño del Product Designer, no valores acordados por el equipo**. Esto resultó crítico: en la Mesa Redonda del 25/08, el CFO cruzó la fórmula de emisión de Oro contra el precio ilustrativo del catálogo y encontró que el escenario conservador entrega solo 11 días libres al año por empleado y el del tope 44 — ninguno sostenible, e invalida los 19 precios propuestos (ver sección 9).

### 4.2 Un cambio de fondo ocurrido en esta misma sesión de trabajo (24–25/08/26)

Alim eliminó del producto toda referencia a dinero real. **El Oro ya no se convierte en USD.** Antes, la spec original de Cashea tenía un campo `usd_equivalent` fijado por RRHH — el equipo lo identificó como un vector de coerción (el empleador podía repreciar el esfuerzo del empleado después del hecho). Ahora los beneficios de consumo son **cupos que la empresa ya contrató con cada aliado comercial**, filtrados automáticamente por la zona donde vive cada persona. Solo aparece un monto en pantalla cuando el beneficio **es** literalmente un descuento de un comercio (porque ese descuento lo pone el comercio, no Levelop).

Esto resuelve el riesgo de coerción original — pero, según lo que encontraron por separado el propio Product Designer, el CFO y el CTO en la Mesa Redonda del 25/08 (sin haberse leído entre sí), **el poder de repreciar el esfuerzo no desapareció: se mudó del tipo de cambio Oro→USD al precio del catálogo en Oro**. Subir "Día libre" de 900 a 1.800 de Oro es exactamente la misma devaluación, solo que ahora no hay tipo de cambio que la haga visible. Esto está documentado en detalle en la sección 9 y sigue **sin resolver** a la fecha de este documento — es el bloqueo #1 (`LVL-024`) del sistema.

### 4.3 Historial de versiones y del prototipo React/TypeScript más antiguo

Existe también un linaje de trabajo previo, anterior al pivote a Venezuela y a los prototipos HTML actuales: archivos `.tsx` monolíticos y grandes (`LVL UP - App Completa Unificada.tsx`, `LVL UP - Sistema Unificado de Misiones.tsx`, `LVL UP - Misiones Mejoradas con Detalles.tsx`) que viven tanto en el Proyecto de Claude como en `CoWork/CTO/HANDOFF from previous Agents/`. Son la versión más completa del frontend React de esa etapa anterior (ICP Chile, precio $10-12/usuario, "LVL UP!" con personalidad "George Heaton"). Esa narrativa fue marcada explícitamente como **superada** el 07/08/26 tras el pivote a Venezuela — se conserva como archivo histórico, no como fuente de verdad. Ese linaje de código no se está usando como base de los prototipos actuales del Product Designer, que son HTML nuevos construidos desde cero bajo el posicionamiento vigente.

También existe en `CTO/HANDOFF...` un intento de backend NestJS que **nunca llegó a compilar y correr limpio de punta a punta** — se perdió el entorno de desarrollo local en un crash de laptop el 07/08/26, y quedó un "paquete de recuperación" con entities y servicios parciales, más una decisión estructural sin resolver (dos convenciones de carpetas incompatibles entre archivos de distintas sesiones). No hay evidencia en el repositorio de que este backend se haya retomado tras el pivote a Venezuela y el rediseño del producto.

### 4.4 Qué funcionalidades tiene hoy y qué falta

**Existe y es demostrable en el prototipo:**
- El loop completo de misión → XP/Oro → canje de beneficio, con sus estados de fallo diseñados (ver sección 5).
- El opt-out real: un interruptor que apaga XP, niveles, Oro nuevo, trofeos, medallas, tablas y rachas, y reduce la navegación (aunque hay un bug encontrado por el CTO: el conteo real de pestañas visibles no coincide con el "5 a 2" que se está comunicando — ver sección 9).
- El gate de lanzamiento del CEO (3 Intrarrecompensas de tiempo activas + 1 canje ejecutado) es recorrible de punta a punta en el prototipo.
- El BackOffice de gerencia con las restricciones de no-vigilancia de R-07 aplicadas en el diseño (aunque el CTO advirtió que hoy solo están escritas dentro del panel, no garantizadas por el modelo de datos).

**No existe / falta:**
- Backend real en producción (persistencia, autenticación, multi-tenancy).
- Cualquier integración externa real (Cashea, pasarela de pago, IA).
- Cobro automatizado — el trimestre completo se opera con cobro manual, por decisión explícita.
- Validación con un solo cliente o empleado real: el prototipo nunca se ha probado en un teléfono de gama baja con conexión real.
- 20 entrevistas de descubrimiento con dueños de PyMEs venezolanas (cero hechas a la fecha).

---

## 5. Arquitectura técnica

**Stack objetivo (según el CTO Agent y los documentos heredados):**
- **Frontend:** React 18 + TypeScript + Tailwind CSS + Vite.
- **Backend (diseñado, no en producción):** NestJS + TypeORM + PostgreSQL.
- **Auth:** JWT (no implementado end-to-end todavía).
- **Estado real hoy:** la app corre sobre `localStorage`. Sin JWT real, sin WebSockets, sin despliegue productivo, sin multi-tenancy en ningún prototipo.

**Contexto del fundador que condiciona toda decisión técnica:** Alim trabaja solo, ~18 horas/semana, sin equipo técnico. El CTO Agent insiste en que esas 18h no son 18h productivas — son 12–14h de código real después de descontar contexto, canales y decisiones, y estima siempre en "semanas-fundador", no en semanas ideales de un equipo que no existe.

### 5.1 Decisiones de arquitectura ya tomadas

- **El ledger de Oro debe ser de doble entrada, append-only, con idempotencia determinística** (UUIDv5, no v4) y `UNIQUE(tenant_id, idempotency_key)`. El diseño original heredado de la spec de Cashea tenía un ledger de una sola pierna (`EARN/BURN` con `amount` siempre positivo) — identificado como un error grave porque el pasivo no sería auditable.
- **El estado `INDETERMINATE`** (un canje que no se sabe si ocurrió porque un tercero no respondió a tiempo) es obligatorio en cualquier flujo que cruce a un proveedor externo — "un timeout no es un fallo". Sin embargo, en la Mesa Redonda del 25/08 el CTO encontró que, tras eliminarse la integración con terceros del flujo de canje (porque ahora son cupos precontratados, dos filas del propio Postgres), **este estado ya no aplica al camino crítico actual** — se deja el esqueleto construido y apagado, listo para activarse el día que se integre una API real.
- **Patrón outbox + asientos compensatorios**, no transacciones abiertas con reintentos sobre un tercero (el diseño original violaba esto).
- **Offline-first no se implementa este trimestre**, pero el modelo de eventos nace append-only e idempotente desde el día uno para que el offline sea después una decisión de UI, no una reescritura. **Veto explícito y permanente a CRDTs de texto (Yjs, OT)** — el modelo de eventos de misiones/ledger es un G-Set (el CRDT más barato posible), no un documento colaborativo de texto.
- **OFAC no se construye en casa.** La lista SDN indexa nombres, no cédulas venezolanas; la exposición real es el RIF del cliente corporativo, no el empleado individual. Si algún día hace falta, se subcontrata.
- **Reset a cero de los saldos de Oro de `localStorage`** — no se heredan como canjeables. Los saldos actuales se editan desde DevTools del navegador en diez segundos y no son auditables.
- **Bus factor = 1 con cero disaster recovery es, según el CTO, el riesgo que mata deals en due diligence** — antes que cualquier feature faltante. Backups probados (no solo configurados), gestión de secretos y un segundo juego de credenciales están aprobados por Alim (parte del desembolso A-3) pero su ejecución sigue pendiente a la fecha de este documento.
- **Un módulo único de reglas de autorización, en servidor**, evaluando nivel + medalla + zona + saldo + cupo a la vez — decidido en la Mesa Redonda del 25/08 tras encontrar que hoy la lógica de qué puede pedir un usuario corre parcialmente en el cliente (`state.xp` es editable por quien controla el navegador, igual que los saldos de `localStorage`).

### 5.2 Bugs y hallazgos técnicos concretos sobre el prototipo actual (25/08/26)

El CTO revisó línea por línea el prototipo del Product Designer y encontró, entre otros:
- **XP se acredita antes de la confirmación del servidor**, lo que permite subir de nivel y pedir un beneficio antes de que el cierre de la misión esté confirmado.
- **El campo de zona lo edita la propia persona** en un `<select>` del Perfil — "un gate que el sujeto controla no es un gate". Alguien de Barquisimeto puede ponerse "Caracas" y ver ese catálogo.
- **El cupo de un beneficio se decrementa en el cliente y nunca se revierte** en ninguna rama de error — "el cupo, no el Oro, es donde va a estar la contención real del producto".
- **Multi-tenancy no existe en ninguno de los tres prototipos.**
- **El claim de "de 5 pestañas a 2" del opt-out no es exacto en el código**: el conteo real, verificado contra el código fuente, deja tres pestañas visibles (Inicio, Misiones y Perfil), no dos — y el CTO se negó a firmar ese número hasta que coincida con el código.

### 5.3 Estimación de esfuerzo (semanas-fundador de 18h, actualizada al 25/08/26)

| Bloque | Semanas |
| :--- | ---: |
| Base pendiente (backend mínimo + ledger) | 9 – 13 |
| Opt-out real (completo: emisión, agregados, modelo de permisos — no solo navegación) | 4 |
| Estados de fallo con reembolso a 48h | 6 |
| Filtro de catálogo por zona | 1 |
| Módulo único de reglas de autorización | 1 |
| BackOffice de gerencia | 7 |
| **Total sin BackOffice** | **21 – 25 semanas ≈ 5 a 6 meses** |
| **Total con BackOffice** | **28 – 32 semanas ≈ 7 meses** |

Esto choca frontalmente con la afirmación del CEO de que "no hay 9 semanas, hay 2" (ver el choque CH-6 en la sección 9) — es, literalmente, la restricción física del proyecto puesta por escrito por primera vez el 25/08/26.

**Lo que el CTO explícitamente no construiría él mismo (se compra o subcontrata):** autenticación gestionada (~$25/mes), Postgres gestionado (~$25/mes), observabilidad (Sentry, gratis en el tier usado), correo y push, la cola de cumplimiento manual como pantalla, motor de gráficos, OFAC, modo offline.

---

## 6. Modelo de negocio y pricing

**Precio de trabajo vigente a la fecha de este documento: $50/mes con 10 asientos incluidos + $4/asiento adicional.** Este precio reemplazó al inicial de $79/mes con 15 asientos + $4/asiento, que fue el propuesto originalmente por el CFO y aprobado como precio de trabajo el 07/08/26 — el mismo día, Alim pidió reevaluarlo por parecer elevado para PyMEs venezolanas, y el CFO recalculó a $50/10+$4. El recorte no afecta parejo a todos los tamaños: a 10-15 empleados el precio cae 21-37%, mientras que a 50-100 empleados cae apenas 2-4% (porque el modelo anterior regalaba 15 asientos en el mínimo).

**⚠️ Contradicción sin resolver a la fecha de este documento:** el propio sistema detectó, en la Mesa Redonda del 25/08/26, que **dos precios conviven en distintos documentos** — el LOG del CEO y el de Growth & Sales todavía dicen $79/15+$4, mientras que el brief del CFO dice $50/10+$4 desde el 07/08. Esto está escalado a Alim como punto **A-6** con la recomendación de ratificar $50/10+$4 y corregir ambos LOGs.

**Promociones diseñadas:** trimestral $100/3 meses (Programa Fundadores), semestral $270/6 meses activas, anual $480/12 meses (diseñada, no publicada). El descuento "Founder's Deal" es un descuento con fecha de vencimiento, no un precio permanente.

**El pool de recompensas** (el presupuesto que la empresa cliente destina a Extrarrecompensas) es una **línea aparte, con default $0**, definida por el propio cliente — no es un fee de Levelop. Se vende siempre como **reasignación de un presupuesto de beneficios que la empresa ya gasta** (wellness, transporte, seguros fragmentados), nunca como gasto nuevo — con la excepción importante señalada por el CFO en la Mesa Redonda del 25/08: eso deja de ser universalmente cierto en la categoría de "Beneficios de Levelop" (ver más abajo), que sí es gasto nuevo y con desperdicio.

**Condición no negociable para ratificar cualquier precio en firme:** el costo de inferencia de IA por usuario/mes (`LVL-022`, a cargo del CTO) sigue en 0% a la fecha de este documento. El CTO no ha podido entregar una cifra porque, según su propio análisis, la cifra no depende de un precio de token sino de una decisión de producto que nadie ha fijado todavía (¿la IA se usa por misión cerrada, decenas de llamadas por usuario/mes, o para un resumen mensual por equipo, una llamada por equipo/mes? — hay dos órdenes de magnitud de diferencia entre esos escenarios). Su contrapropuesta, no resuelta a la fecha: que el CFO le dé el techo de COGS de IA por usuario/mes que su margen tolera, y el CTO diseña la función de IA para caber dentro de ese techo.

### 6.1 El modelo de ROI para el cliente

El modelo original (en `CFO/Contexto/LEVELOP_ROI Pricing Model.xlsx` y sus CSV) **fue auditado y quedó formalmente superado** — se conserva como evidencia de cómo se encontró y corrigió el error, no como fuente vigente. El propio CFO desarmó su modelo y encontró que el 78% del beneficio proyectado descansaba en una cifra sin fuente ("4 horas semanales recuperadas"), que el valor-hora usado ($2,19) estaba sobreestimado un 59% frente al dato real del propio playbook ($1,38/hora, derivado de $240/mes de ingreso integrado), y que la línea de "ahorro fiscal" de $4.200 era en gran medida ficticia en Venezuela (la compensación real ya se paga vía bonos exentos, no se puede vender un ahorro sobre dinero que ya está exento).

**Modelo revisado, vigente (50 empleados, hora base $1,38/h):**

| | Conservador | Base | Optimista |
| :--- | ---: | ---: | ---: |
| Beneficio anual total | $1.288 | $3.816 | $9.410 |
| Costo de suscripción anual | $2.628 | $2.628 | $2.628 |
| **ROI / Payback** | **−51% / nunca** | **+45% / 8,3 meses** | **+258% / 3,4 meses** |

Tres de los cuatro insumos principales de este modelo siguen marcados `⚠️ SUPUESTO` (horas semanales recuperadas, tasa de captura del tiempo, rotación anual base, reducción de rotación, costo por contratación) — el Lead Researcher calificó la confianza global de este ROI como **BAJA**. Una calculadora de ROI pública y editable, con los supuestos visibles y ajustables por el propio cliente, está en desarrollo (`LVL-021`, ~20% avanzada a la fecha de este documento).

### 6.2 "Beneficios de Levelop" — una categoría de negocio distinta y sin resolver

Es importante distinguir dos cosas que se confundieron una vez en el propio equipo y que quedaron corregidas por escrito: los **cupos precontratados por el cliente** (categoría (b): el cliente paga, Levelop nunca custodia el dinero) frente a **"Beneficios de Levelop"** — una categoría nueva donde Levelop misma compra y mantiene inventario de canje con marcas (Nike, Adidas, Cashea puesto como ejemplo, generalizado a N marcas). Alim decidió directamente, sin pasar por el canal habitual, que **Levelop prefinancia este inventario por adelantado** — el CFO advirtió que esta es, en estructura financiera, la misma arquitectura que ya se había rechazado para el pool de Oro del cliente (ver sección 9), y que aquí **sí genera pasivo real en el balance de Levelop** (a diferencia de las otras dos categorías, donde el pasivo es cero para Levelop). Está **congelada** a la fecha de este documento — el CFO no autoriza avanzar sin conocer primero el tamaño de capital que implicaría, y eso depende de una tasa/política que todavía no existe (`LVL-024`).

---

## 7. Finanzas y costos

**Principio rector:** Levelop es y seguirá siendo 100% autofinanciado por Alim. No hay ni va a haber, por ahora, fondos externos, aceleradoras ni inversión — hasta que la tesis de Venezuela esté probada con evidencia real de las 20 entrevistas.

### 7.1 Plan de Self-Funding por niveles (CFO, 07/08/26)

| Nivel | Mensual recurrente | Qué compra | Estado |
| :--- | :--- | :--- | :--- |
| **0 — Bootstrap puro** | $0–35 | Solo herramientas gratuitas, todo manual | Piso absoluto de emergencia |
| **1 — Operación mínima viable** | $120–180 | Infraestructura estable (Postgres gestionado, monitoreo de errores, gestor de secretos, hosting, email profesional, CRM gratuito) | **✅ Confirmado por Alim el 07/08/26 — nivel activo** |
| **2 — Tracción inicial** | $350–500 | Primer presupuesto de ads geolocalizado, apoyo freelance, LinkedIn Sales Navigator | Condicionado a evidencia: ≥1 Fundador firmado o ≥12/20 entrevistas confirmando presupuesto real |
| **3 — Acelerado / reinversión** | Variable (20-30% del MRR) | Escala con ingresos reales, no con la caja de Alim | Solo tras clientes pagando |

**Total estimado del resto del trimestre en Nivel 1 (ago–4 nov, ~3 meses): entre $760 y $1.440 en total**, incluyendo el desembolso único ya aprobado A-3 (~$400-900: abogado laboral venezolano + backups probados + gestor de secretos).

**Regla de gasto explícita:** no se sube a Nivel 2 por calendario, solo por evidencia. Gastar en adquisición antes de validar que hay comprador dispuesto a pagar sería repetir, con caja real, el mismo error que casi se comete con el precio de $8/usuario originalmente propuesto.

**Restricción heredada:** no contratar este trimestre (decisión firme del CEO). Todo el gasto de este plan es herramientas/infraestructura, no headcount.

### 7.2 Costos técnicos (TCO) — de dónde salen las decisiones de arquitectura

El documento `CFO/Contexto/LEVELOP_Collaborative Architecture TCO for CFO.md` es la fuente de varias decisiones técnicas ya adoptadas (ledger de doble entrada, veto a CRDTs de texto, decay de saldos inactivos). **Advertencia importante marcada por el propio CFO al auditar este documento:** sus cifras de ahorro de infraestructura (el recorte de 40-60% de costo por migrar a arquitectura columnar tipo mondayDB) son benchmarks de **escala enterprise** (Asana, Monday, Trello con cientos de miles de tableros) y **no aplican a la etapa actual de Levelop** (cero clientes). Se marcó explícitamente para que nadie las use como excusa para sobre-construir infraestructura que la empresa no necesita hoy.

Los hallazgos técnicos de fondo de ese documento que sí son relevantes hoy:
- **OT (Operational Transformation) es superior a CRDT para un SaaS centralizado con servidor propio** — un CRDT de texto puede implicar un impuesto de memoria de 17x a 33x en RAM del servidor frente a OT, solo justificable en arquitecturas peer-to-peer/offline-heavy (no es el caso de Levelop).
- **Los puntos/Oro deben tratarse como activos financieros con ledger de doble entrada**, nunca como un `UPDATE users SET points = points + 10` — es vulnerable a condiciones de carrera, no deja rastro de auditoría y no previene manipulación.
- **Idempotencia por evento** vía UUID único es obligatoria para prevenir doble acreditación de puntos por reintentos de red.

### 7.3 Costos que hoy no están en ningún modelo (marcados "requiere cotización" por el CFO, nunca inventados)

Proveedor de KYC/OFAC, opinión legal sobre si Levelop es emisor o custodio de valor, comisión de cualquier partner de canje, float y prefondeo, FX y spread Bs/USD, reversiones y disputas, soporte tier-1 sobre dinero real, retención de cédulas, y el costo de inferencia de IA (bloqueante, ver sección 6).

### 7.4 Financiamiento externo futuro — investigación, no acción de esta ronda

El CFO investigó por cuenta propia (vía búsqueda web, no pasó por el Lead Researcher — requiere su firma si se usa en material externo) opciones para cuando la tesis esté validada: Founder Institute Venezuela/Caracas (pre-seed, ~$175-199 de entrada, no invierte capital directo), Wayra Venezuela, Endeavor Catalyst (solo en etapa scale-up), Venezuela Tech Week (networking, no capital), y fondos regionales como Platanus Ventures, Magma Partners, 500 Global (geografía listada no incluye Venezuela explícitamente — sin confirmar elegibilidad), Kaszek Ventures e Y Combinator (batch LatAm se redujo drásticamente, choca con la tesis "Venezuela-only"). También Revenue-Based Financing como opción no dilutiva, pero típicamente requiere ~$10K/mes de MRR de referencia — es decir, corresponde recién al Nivel 3 del plan de self-funding, no antes. Recomendación del CFO: usar este trimestre para producir evidencia con self-funding puro y traer esta conversación a la Retro de cierre de trimestre, no antes.

---

## 8. Mercado y research

**Advertencia de honestidad que hay que llevarse de esta sección, dicha por el propio Lead Researcher:** *"La densidad no es rigor."* Los PDFs de investigación de mercado del corpus tienen tablas completas de cifras de mercado LATAM con la columna "Fuente de Datos" **literalmente vacía**, y dos fuentes de tamaño de mercado que se contradicen entre sí ($9,65B en 2024 con CAGR 6,32% vs. $7,9B en 2025 con CAGR 11,1%). El Lead Researcher marcó estas cifras como no publicables hasta reponerlas con fuente verificable (`LVL-026`, en curso a la fecha de este documento).

### 8.1 La realidad corporativa venezolana (fuente: `Venezuelan Market Playbook`)

- **Bloqueo de pagos internacionales:** las sanciones OFAC bloquean el sistema bancario tradicional. Empresas y profesionales venezolanos no pueden usar tarjetas de crédito domésticas ni transferencias bancarias locales para pagar SaaS internacional (Monday, Asana, ClickUp quedan efectivamente fuera). Las transferencias internacionales rebotan con frecuencia o cobran 8-15% en comisiones.
- **Rieles de pago alternativos ya en uso en el país:** Zelle (riel estándar B2B), USDT/USDC sobre la red Tron (TRC-20, comisiones bajo $1, asentamiento casi instantáneo — reforzado por la General License 44A del Tesoro de EE.UU., emitida en febrero de 2026), y Pago Móvil (transferencias interbancarias en Bolívares indexadas al BCV).
- **La compensación real ("Ingreso Mínimo Integrado"):** salario nominal simbólico (~130 Bs, ~$3,60) + Bono de Guerra Económica (~$200) + Cestaticket (~$40) ≈ **$240 USD/mes**. Como estos bonos no cuentan para cálculos de prestaciones/vacaciones, las empresas usan beneficios flexibles opcionales como su herramienta principal de retención de talento.
- **Validación de que sí se paga por SaaS local: el caso Fina.** Un SaaS venezolano de contabilidad/finanzas para PyMEs que ha escalado a **más de 4.000 clientes y más de $1,5M de ARR**. Es, según el Lead Researcher, "la única prueba real de disposición a pagar en este mercado" — y el equipo **todavía no lo ha estudiado en profundidad** (el teardown de Fina, `LVL-010`, sigue en 0% a la fecha de este documento).
- **Cashea:** plataforma BNPL (compra ahora, paga después) que es hoy el motor financiero de consumo central del país, con más de 347 comercios aliados (Nike, Casio, Crocs, Skechers, Locatel, Farmatodo, entre otros).

**Advertencia crítica sobre el estatus de Cashea:** el playbook original (y el pitch deck de Growth & Sales, y una spec técnica completa) describían una "integración con Cashea" con endpoint, payload y firma HMAC ya definidos — y **nada de eso está confirmado con Cashea**. La Mesa Redonda del 06/08/26 encontró que la spec estaba "escrita contra una API que nadie ha leído": no existe una sola referencia a documentación pública, portal de desarrolladores, contrato o contacto humano en Cashea. El propio Lead Researcher lo resumió: *"la evidencia no sostiene que Cashea sea nuestra ventaja competitiva principal. Sostiene que sería una ventaja formidable si existiera."* **Decisión vigente: Cashea está congelada, reclasificada de "spec" a "diseño de referencia condicional".** No se implementa ninguna línea de integración este trimestre. El único paso activo es un intento formal de contacto humano en Cashea para partnerships (`LVL-002`, a cargo de Growth & Sales, **sin avance confirmado a la fecha de este documento**).

### 8.2 Comportamiento y engagement (fuente: `Engagement Analysis`)

Hallazgos que sí sostienen decisiones de diseño concretas del producto:
- **Los rankings públicos de arriba a abajo generan estrés crónico en el cuartil bajo y dañan la cooperación** — por eso el ranking del producto muestra por defecto solo ±3 posiciones alrededor del propio usuario, con tabla completa opcional.
- **~80% de abandono de insignias/badges** una vez que se agota la novedad de la gamificación superficial ("chocolate cubierto de brócoli").
- **Duolingo sostiene 34 horas de engagement anual por usuario activo** solo con rachas, XP y ligas por cohorte — usado como benchmark de referencia, no como promesa propia.
- **Gradación aditiva** (se gana XP, nunca se pierden puntos) reencuadra la jornada como acumulación de logros en vez de amenaza de penalización.
- **Rachas con período de gracia de 1 día** para no castigar un fin de semana.

### 8.3 Huecos de investigación abiertos, ordenados por riesgo (según el Lead Researcher)

1. ¿Cashea tiene programa de partners o API real? (sin confirmar)
2. Voz de cliente — cero entrevistas a la fecha.
3. Disposición real a pagar y precio ancla local.
4. Validez jurídica de las Intrarrecompensas bajo la ley laboral venezolana (LOTTT) — afirmada tres veces en el corpus, fundamentada con opinión de abogado **cero veces**.
5. Origen y gobernanza del pool de recompensas.
6. Estado real de NOWPayments y la General License 44A como riel de cobro.
7. Fina y la competencia local, sin estudiar en profundidad.
8. Costo unitario de la IA (ver sección 6).

---

## 9. Decisiones clave tomadas

Esta sección resume las decisiones estructurales más importantes, con su razonamiento, extraídas de las dos Mesas Redondas realizadas hasta la fecha.

### 9.1 Mesa Redonda — Spec de integración con Cashea (06/08/26)

La mesa se convocó para revisar una spec técnica de integración con Cashea y terminó destapando tres cosas más grandes que Cashea:

1. **"Somos dos empresas en un solo documento."** El corpus del proyecto mezclaba una narrativa centrada en Chile (con dos leads identificados, Base1 y Agencia Salvaje, pero sin ninguna ventaja competitiva real frente a Buk/Rankmi/Monday) con otra centrada en Venezuela (con una ventaja competitiva real —ser cobrables donde los jugadores globales no pueden— pero sin un solo lead). **Decisión: Venezuela.** Chile queda como "caja, no norte": se atiende con el producto tal cual, cobrando en USD, sin roadmap dedicado.
2. **El modelo de ROI no sobrevivía escrutinio.** El propio CFO lo desarmó y encontró que el 78% del beneficio proyectado dependía de una cifra sin fuente (ver sección 6).
3. **Reposicionamiento** de "Work OS gamificado" a "Sistema de Beneficios por Desempeño", con el claim central "Tus beneficios ya existen. Levelop decide quién se los gana."

**Las seis decisiones firmes de esa mesa (D-1 a D-6):** Cashea reclasificada a diseño de referencia condicional (GS, 20/08); Venezuela como ICP en todo el corpus (CEO/CMO, 13/08); purga de claims falsos (CMO, 03/09); capa genérica de canje construida sin Cashea real, con reset de saldos de Oro heredados (CTO, hitos 20/09 y 04/11); 20 entrevistas + teardown de Fina + Programa Fundadores (GS+CMO, 15/10); dictamen legal LOTTT + ratificación de la arquitectura B del pool (CFO, 30/09).

**Lo que se descartó explícitamente en esa mesa:** integración con Cashea, pool prefondeado en cuenta de Levelop (Arquitectura A — ver más abajo), screening OFAC propio, offline-first y CRDTs de texto, hosting propio en Daycohost, una segunda web/deck para Chile, el precio de $8/usuario, y contratar a alguien.

**La arquitectura del pool de recompensas — decisión financiera central del proyecto.** El equipo evaluó dos arquitecturas para quién custodia el dinero del pool de recompensas de una empresa cliente:
- **Arquitectura A** (pool prefondeado en cuenta de Levelop): convertiría a Levelop en custodio de dinero de terceros en un corredor sancionado — "no somos SaaS, somos cuasi-emisor". Bajo esta arquitectura, el Oro caducado se convertiría en ingreso de Levelop — "ganamos cuando el empleado no cobra", un incentivo que destruye la tesis entera del producto. **Rechazada y muerta este año.**
- **Arquitectura B** (el pool se queda en el cliente; Levelop instruye, el cliente liquida): el pasivo se queda donde nace, en el empleador. Levelop es software puro. **Recomendada sin matices, ratificada por el CEO** y confirmada por Alim directamente el 07/08/26.

### 9.2 Mesa Redonda — MVP v0.3 del Product Designer (25/08/26)

Convocada porque el Product Designer entregó los primeros prototipos navegables y, en el mismo movimiento, avisó de que Alim había eliminado el dinero real del producto (ver sección 4.2). Tres agentes (CEO, CFO, CTO) sesionaron por separado sobre la misma entrega y llegaron, sin haberse leído, a formulaciones distintas del mismo hallazgo: el poder de repreciar el esfuerzo del empleado no desapareció al quitar el USD de pantalla — se mudó al precio del catálogo en Oro.

**Las ocho decisiones firmes de esa mesa:**

| # | Decisión |
| :-- | :--- |
| C-1 | El **BackOffice de gerencia entra en v1**, no en una fase 2 — porque en una PyME venezolana paga el jefe |
| C-2 | No es un segundo producto: mismo pitch, mismo precio, mismo SKU. En la demo comercial el BackOffice va primero |
| C-3 | El BackOffice de v1 se reduce a 2 secciones, no 4 |
| C-4 | Las medallas de equipo entran con tres correcciones de equidad (denominador correcto, nunca condicionan el catálogo base, nunca nombran a quien falta) |
| C-5 | **R-07** se vuelve regla permanente (ver sección 3) |
| C-6 | Sobrevive v0.4 completa; **mueren v0.5 y v1.0 completas este trimestre** — "no hay 9 semanas, hay 2" |
| C-7 | El precio en Oro del catálogo se congela 90 días durante el piloto Fundadores, por escrito en el contrato |
| C-8 | "Qué pasa cuando alguien se va de la empresa con Oro acumulado" se suma como pregunta al dictamen legal LOTTT ya presupuestado |

**Lo que se mató en esa mesa, explícitamente:** modo offline real (hasta 2027), auditoría de accesibilidad WCAG completa, panel de administración de RRHH, historial de precios visible, 11 de los 19 beneficios del catálogo original (queda la familia Tiempo y Empresa; mueren Aliados e Impulsos), 9 de los 14 trofeos, las tres tablas alternativas del ranking, el BackOffice como producto vendible aparte, y equipos distribuidos.

**Los seis choques identificados en esa mesa** (ver también sección 4.2 y 5):
- **CH-1:** el CEO mete el BackOffice en v1 sin conocer el número del CTO (7 semanas adicionales); el CTO cotiza esas 7 semanas sin conocer la decisión del CEO. Ninguno está equivocado dentro de su marco — es el choque más caro de la mesa y no se resolvió del todo.
- **CH-2 (sin resolver, bloquea `LVL-009`, vence 02/09/26):** tres documentos vigentes dicen tres cosas incompatibles sobre qué le pasa al Oro cuando alguien activa el opt-out — el Product Designer dice que se apaga la generación de Oro nuevo, el CTO dice que apagarlo sería una multa (reabre el vector de coerción), el CFO dice que el Oro caduca a 90 días de todas formas.
- **CH-3 (resuelto por complementariedad):** la gobernanza del precio se resuelve con C-7 (cláusula de congelamiento, costo cero) para los primeros 90 días, y el sistema completo del CFO (reindexación de saldos, bandas sobre emisión mediana, registro inmutable) queda pendiente para después del piloto.
- **CH-4 (convergencia):** la equidad de catálogo entre zonas baja de prioridad porque, al matar la familia de beneficios "Aliados", la causa de la desigualdad geográfica desaparece este trimestre.
- **CH-5:** el hallazgo aritmético del CFO (11 a 44 días libres al año por empleado según el escenario) invalida los 19 precios del catálogo que el Product Designer había marcado como propuestas no acordadas.
- **CH-6 (la restricción física del proyecto, no un choque de criterio):** 2 semanas disponibles según el CEO contra 21-32 semanas-fundador de trabajo real según el CTO.

**Cuatro puntos escalados a Alim, sin resolver a la fecha de este documento (ver sección 10 para el detalle completo):** A-6 (ratificación del precio, dos cifras conviviendo), A-7 (dónde van las próximas 3 semanas de Alim — diseño nuevo vs. entrevistas), A-8 ("Beneficios de Levelop" — la única categoría con pasivo propio de Levelop, congelada sin sign-off), A-9 (quién es dueño contractual del precio del catálogo en Oro).

### 9.3 Otras decisiones importantes fuera de las dos mesas

- **Precio corregido de $79/15+$4 a $50/10+$4** (07/08/26, a pedido de Alim, ver sección 6) — pendiente de ratificación final.
- **Programa Fundadores: 5 empresas** con línea base medida y derecho a publicar el caso (decisión A-4, combinando la estructura propuesta por Alim con el número de capacidad real propuesto por el CEO — no eligiendo entre las dos, fusionándolas).
- **Desembolso de ~$400–900 aprobado** (A-3): abogado laboral venezolano (LOTTT) + backups probados + gestor de secretos.
- **Todo el copy del producto en español venezolano**, modo oscuro por defecto (decisión de Alim, correcta para el contexto de dispositivos de gama baja y batería).

---

## 10. Qué falta / próximos pasos

### 10.1 Bloqueos activos más importantes a la fecha de este documento

| Bloqueo | De quién depende | Por qué importa |
| :--- | :--- | :--- |
| **`LVL-024` — quién fija el precio en Oro de cada cupo, y con qué regla de aviso** | CFO | Es el chokehold #1 del sistema. Sin esto, el catálogo entero de la Tienda no tiene gobernanza real y el equipo puede estar reconstruyendo, sin darse cuenta, el mismo problema de coerción que ya se creía resuelto |
| **`LVL-022` — costo de inferencia de IA por usuario/mes** | CTO | Bloquea la ratificación final de cualquier precio; hoy se fijaría precio a ciegas sobre el costo real |
| **Contradicción de precio ($79 vs. $50) sin corregir en todos los documentos** | CEO (A-6) | Regla propia del CEO rota desde hace 18 días |
| **Cero entrevistas con clientes reales** | Growth & Sales | Todo el diagnóstico de dolor del producto sigue siendo inferido de literatura, no de conversación real. Es el riesgo más grande del proyecto completo |
| **Dictamen legal formal sobre la validez de las Intrarrecompensas bajo la LOTTT** | CFO (contratación del abogado, ya aprobada) | Afirmado tres veces en el corpus, fundamentado cero. El propio CFO advirtió del riesgo inverso: que legalmente el beneficio se vuelva un derecho adquirido que la empresa cliente no pueda bajar nunca |
| **`LVL-009` (esquema de ledger) bloqueado por CH-2** | Alim | Tres reglas incompatibles sobre qué pasa con el Oro al activar el opt-out. Vence el 02/09/26 |
| **Backups probados y gestión de secretos (parte de A-3, ya aprobado)** | CTO | Ejecución pendiente. Es, según el propio CTO, el riesgo que mata acuerdos en due diligence antes que cualquier feature faltante |
| **Intento formal de contacto con Cashea (`LVL-002`)** | Growth & Sales | Cierra o abre definitivamente el "capítulo cuatro" del posicionamiento comercial |
| **Restricción física del proyecto (CH-6)** | Todo el equipo | 21-32 semanas-fundador de trabajo estimado contra 2 semanas que el CEO dice que hay disponibles antes de la fecha objetivo |

### 10.2 Los cuatro puntos escalados a Alim, sin resolver

| # | Qué | Opciones sobre la mesa |
| :-- | :--- | :--- |
| **A-6** | Ratificar $50/10+$4 como precio único (hay dos precios vivos en distintos documentos) | (a) ratificar $50/10+$4 hoy — recomendada por el CEO · (b) volver a $79 hasta que `LVL-022` aterrice · (c) no publicar precio hasta 10 entrevistas |
| **A-7** | Dónde van las próximas 3 semanas de Alim: ¿diseño nuevo o entrevistas? | (a) congelar diseño nuevo tras v0.4 y meter 3 semanas en las primeras 6 entrevistas — recomendada · (b) correr en paralelo, aceptando rediseñar en octubre · (c) bajar de 20 a 8 entrevistas |
| **A-8** | "Beneficios de Levelop" (prefinanciar inventario de marcas) — la única categoría donde Levelop tiene pasivo propio | (i) congelar hasta tener cliente pagando + tasa ratificada — recomendada · (ii) piloto con un aliado, lote pequeño, tope de capital por escrito · (iii) proceder sin tope — el CFO no lo autoriza |
| **A-9** | Quién es dueño contractual del precio del catálogo en Oro | (i) Levelop fija bandas, el cliente fija el precio dentro de la banda — recomendada · (ii) cliente libre con obligación de publicar · (iii) Levelop fija el precio |

### 10.3 Riesgos abiertos, según el propio Product Designer (autocrítica de su entrega, 25/08/26)

- El catálogo de 8 beneficios que sobrevivió a la poda de la mesa se diseñó **sin un solo empleado venezolano en la sala** — es la debilidad más grande reconocida de la entrega actual.
- El prototipo nunca se ha probado en un teléfono de gama baja con datos móviles reales — solo simula la latencia, no la pierde de verdad.
- El opt-out está construido pero no medido: no se sabe si es técnicamente voluntario pero socialmente obligatorio (presión de pares).
- Las medallas de equipo (logros colectivos que desbloquean beneficios para todos) fueron la decisión de diseño más riesgosa tomada sin consultar antes al Lead Researcher — riesgo de presión de pares sobre quien no participa.
- Equidad de catálogo entre zonas geográficas: sin dueño formal a la fecha, aunque bajó de prioridad este trimestre al matarse la familia de beneficios "Aliados".

---

## 11. Cómo navegar este repositorio

```
levelop-repo/
├── CoWork/
│   ├── Executive Assistant/     ← el sistema operativo del equipo de agentes
│   │   ├── 00 - MAPA DE AGENTES.md          (estructura y racional de cada canal)
│   │   ├── 00 - PROTOCOLO OPERATIVO.md      (la "constitución" del sistema)
│   │   ├── LOG - Executive Assistant.md     (historial completo del proyecto, día a día)
│   │   └── LEVELOP - OPS Dashboard.html     (única fuente de verdad de estado de tareas)
│   ├── CEO/                     ← secuencia, arbitraje, narrativa
│   ├── CFO/                     ← pricing, TCO, modelo de ROI, self-funding
│   │   └── Contexto/                        (TCO técnico, modelo ROI original + nota de estado)
│   ├── CMO/                     ← posicionamiento, claims, mensaje por audiencia
│   ├── CTO/                     ← arquitectura, stack, estimaciones
│   │   └── HANDOFF from previous Agents/    (historial técnico previo, incluido el intento
│   │                                         de backend NestJS que no llegó a producción)
│   ├── Lead Researcher/         ← investigación de mercado, evidencia, PDFs
│   │   └── Contexto/                        (Venezuelan Market Playbook, Cashea spec,
│   │                                         Engagement Analysis, TCO deep dive, PDFs)
│   ├── Product Designer/        ← UX, economía del juego, prototipos
│   │   └── MVP/                             (los 3 prototipos HTML navegables + versiones previas)
│   ├── Growth & Sales/          ← outbound, ICP, objeciones, pitch deck
│   │   └── Contexto/                        (pitch deck HTML — nota: es un artefacto anterior
│   │                                         al pivote a Venezuela, ver advertencia abajo)
│   └── Chat between agents/     ← todos los canales de comunicación entre agentes
│       ├── 00 - INDICE DE CANALES.md
│       ├── MESA REDONDA - Cashea Integration Spec.md   (06/08/26 — el pivote a Venezuela)
│       ├── MESA REDONDA - MVP v0.3.md                  (25/08/26 — la más reciente y completa)
│       └── [canales radiales EA↔agente y laterales agente↔agente]
└── Inspiración/                 ← referencias visuales, no leídas para este documento
```

**Regla de lectura recomendada, si el socio quiere profundizar en algo puntual:** cada agente vive con exactamente dos archivos — `BRIEF - <Agente>.md` (quién es, estable) y `LOG - <Agente>.md` (qué ha vivido, se acumula, contiene siempre 6 bloques: contexto acumulado, tareas completadas, en curso, bloqueos, aprendizajes, mejoras propuestas). El bloque de "Aprendizajes" de cada LOG es, según el propio protocolo del sistema, "la sección más valiosa y la más fácil de dejar vacía" — vale la pena leerla primero en cualquier LOG.

**Advertencia sobre documentos históricos que aparecen en el repositorio pero ya no son la fuente de verdad:**
- El pitch deck de Growth & Sales (`Levelop_For Growth & Sales - Pitch Deck.html`) describe un producto genérico de gestión de tareas con mercado global, precio $12/usuario, y una ronda semilla de $500K — es anterior al pivote a Venezuela y al reposicionamiento, y no refleja el estado actual del proyecto.
- El `Venezuelan Market Playbook` contiene afirmaciones sobre una integración con Cashea ya construida y sobre hosting en "Daycohost Tier III" que **fueron retiradas explícitamente** por el CMO y el CTO tras la Mesa Redonda del 06/08 — leer con la corrección de la sección 8 de este documento en mente.
- El `LEVELOP_ROI Pricing Model.xlsx` (y sus dos CSV) en `CFO/Contexto/` está marcado formalmente como superado — la nota `ESTADO ACTUALIZADO.md` en la misma carpeta explica por qué se conserva y dónde está el modelo vigente.
- El `HANDOFF_For CEO - From previous agent.md` en `CEO/Contexto/` describe la narrativa "Chile ICP / LVL UP! / George Heaton" y está marcado en su propio encabezado como superado desde el 07/08/26.
- El `LVL_UP_Resumen_Ejecutivo.md` (dentro de `CTO/HANDOFF.../Mejoras Economía y V1.1/`) es de noviembre de 2025, anterior a todo el trabajo del equipo de agentes descrito en este documento — describe un plan de producto y pricing distintos ($15/equipo, mercado global) y no debe tratarse como vigente.
- Los tres archivos `.tsx` monolíticos (`LVL UP - App Completa Unificada.tsx` y similares, tanto en el Proyecto de Claude como en `CTO/HANDOFF...`) son la versión de frontend de la etapa anterior al pivote — no son la base de los prototipos HTML actuales del Product Designer.

---

## Instrucciones para crear tu agente de Claude

Este documento está pensado para servir como base de conocimiento de un agente de Claude propio. Dos formas de usarlo:

1. **Como documento de un Proyecto de Claude:** sube este archivo (`LEVELOP_CONTEXTO_COMPLETO.md`) a un Proyecto en claude.ai. Cualquier conversación que abras dentro de ese Proyecto tendrá este contexto disponible automáticamente, sin que tengas que repetirlo cada vez.
2. **Como contexto inicial pegado en una conversación:** si prefieres no crear un Proyecto, puedes pegar el contenido completo de este documento al inicio de una conversación nueva con Claude, con una instrucción como *"Este es el contexto completo del proyecto Levelop. A partir de ahora, ayúdame a trabajar en él conociendo todo esto."*

Una vez cargado, puedes preguntarle directamente cosas como "¿cuál es el precio vigente y por qué está en disputa?", "resume los cuatro puntos que están esperando la decisión de Alim", o "si tuviera que ponerme al día con Alim hoy mismo, ¿qué tres cosas le pregunto primero?" — el documento tiene todo lo necesario para responder eso con fidelidad a las decisiones reales del proyecto, no con suposiciones.

**Una recomendación:** este documento tiene fecha de corte (25 de agosto de 2026). El proyecto avanza semana a semana con el mismo equipo de agentes — vale la pena pedirle a Alim una versión actualizada de este documento cada cierto tiempo, o mejor, generarla de nuevo directamente desde el repositorio (`CoWork/Executive Assistant/LOG - Executive Assistant.md` es, en cualquier momento, el punto de partida más rápido para ver qué cambió).

---
*Documento preparado a partir de una lectura completa del repositorio `levelop-repo` — briefs y logs de los 8 agentes, ambas Mesas Redondas, documentos financieros y de investigación de mercado, y la entrega de producto más reciente. Fecha de corte: 25 de agosto de 2026.*
