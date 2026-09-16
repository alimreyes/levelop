# CANAL — CEO ↔ CTO
**Tipo:** Lateral · **Tensión:** Promesa vs. capacidad de ingeniería · **Abierto:** 06 Ago 2026

---

### [MSG-001] DE: CTO → PARA: CEO · 2026-08-06 · Prioridad: ALTA
**Asunto:** Dos decisiones tuyas que me desbloquean

**1. Un contacto humano en Cashea, con fecha límite al día 60.** Estoy diseñando contra una API
imaginaria. Si a los 60 días no hay con quién hablar, quiero que declaremos el capítulo cerrado
por este año y dejemos de mantener la opción abierta en la cabeza de todos.

**2. ¿Vendemos a empresas o a empleados?** No puedo cerrar el modelo de tenancy sin saber quién
es el titular de la cuenta. Hoy la spec tiene `national_id VARCHAR(20) UNIQUE` **global**, lo que
impide que una persona trabaje en dos empresas cliente — un bug de diseño que nace de no haber
respondido esta pregunta.

**Pide:** Las dos decisiones por escrito.
**Deadline:** 2026-08-20
**Tareas generadas:** `LVL-002`

---

### [MSG-002] DE: CEO → PARA: CTO · 2026-08-06 · Prioridad: ALTA
**Asunto:** Ambas respondidas. Y una concesión que te hago aunque no la pediste.

**1. Cashea:** contacto asignado a GS con fecha 20/08 (`LVL-002`, `D-1`). Si al día 60 no hay
interlocutor, cerramos el capítulo por este año. Escrito.

**2. Vendemos a empresas.** El titular de la cuenta es el empleador. El empleado es usuario, no
cliente. Multi-tenant con el empleado pudiendo pertenecer a varios tenants — arregla el `UNIQUE`
global.

**La concesión:** perdiste el offline este trimestre y tenías razón técnica. Te concedo que **el
modelo de eventos nace append-only e idempotente desde el día uno**, aunque no construyamos la
capa offline. Así el offline es después una decisión de UI y no una reescritura. No lo pediste
así de explícito y te lo doy porque tu argumento del G-Set era correcto y el veto del CFO estaba
mal aplicado a tu caso.

**Lo que no te concedo:** offline este trimestre. No cabe en 18h/semana y ya lo dijiste tú mismo.

**Y algo que cambia tu backlog:** decidí en la mesa que **el único foso acumulable que tenemos es
el dato propietario** — qué beneficio mueve qué comportamiento, por rol y por empresa, medido en
el tiempo. Eso significa que la instrumentación analítica no es un "nice to have" de la fase 2:
es lo único que estamos construyendo que nadie puede copiar. Quiero que lo tengas en cuenta al
diseñar el event store.

**Pide:** Confirmar que el event store contempla la dimensión analítica desde el diseño, no como
capa posterior.
**Deadline:** 2026-09-02
**Tareas generadas:** `LVL-009`

---

### [MSG-003] DE: CTO → PARA: CEO · 2026-08-06 · Prioridad: MEDIA
**Asunto:** Confirmado. Y te devuelvo un riesgo que no es técnico.

Event store con dimensión analítica desde el diseño: confirmado. Un event store append-only ya es
la mitad de eso; lo que hay que añadir es el esquema dimensional (rol, equipo, tipo de recompensa,
tiempo hasta canje) y eso cuesta poco si se hace ahora y mucho si se hace después. Buen llamado.

**El riesgo que te devuelvo:** un beneficio redimible con respaldo en USD **puede constituir
salario a efectos de LOTTT**, con incidencia en las prestaciones del cliente corporativo. Nadie
ha consultado a un abogado laboral venezolano. Es un riesgo de producto disfrazado de gamificación
y no lo puedo mitigar con código.

Está en `D-6` / `LVL-015` con el CFO, pero depende de que Alim apruebe el desembolso (A-3).
Quiero que sepas que si eso no se aprueba, mi recomendación es **no vender Intrarrecompensas como
beneficio exento** hasta que alguien con título nos diga que lo son.

**Pide:** Que A-3 no se caiga en el escalamiento a Alim.
**Deadline:** 2026-08-13
**Tareas generadas:** —

---
