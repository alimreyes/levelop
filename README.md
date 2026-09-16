# Levelop (LVL UP)

Repositorio de trabajo de Levelop — sistema de beneficios por desempeño para PyMEs venezolanas (misiones, XP, Oro y tienda de recompensas canjeables por tiempo y beneficios).

## Empezar aquí

**[`LEVELOP_CONTEXTO_COMPLETO.md`](./LEVELOP_CONTEXTO_COMPLETO.md)** — el documento de referencia. Explica qué es Levelop, el estado actual del producto, las decisiones clave tomadas y por qué, el modelo de negocio, las finanzas, el research de mercado y los pendientes. Está pensado para subirse como base de conocimiento de un Proyecto de Claude (o pegarse como contexto inicial) y crear un agente que responda cualquier pregunta sobre el proyecto.

## Cómo está organizado este repositorio

El trabajo se hizo con un equipo de agentes de IA (Claude/CoWork) que simulan un equipo ejecutivo. Cada carpeta bajo `CoWork/` es el espacio de trabajo de un agente:

| Carpeta | Rol |
|---|---|
| `CoWork/CEO` | Estrategia, decisiones de producto y mercado |
| `CoWork/CFO` | Finanzas, pricing, plan de self-funding, TCO |
| `CoWork/CMO` | Posicionamiento y mensaje |
| `CoWork/CTO` | Arquitectura técnica, handoffs de desarrollo |
| `CoWork/Executive Assistant` | Coordinación, protocolo operativo, mapa de agentes |
| `CoWork/Growth & Sales` | Ventas, pitch |
| `CoWork/Lead Researcher` | Investigación de mercado |
| `CoWork/Product Designer` | Diseño de producto, prototipos MVP |
| `CoWork/Chat between agents` | Conversaciones entre agentes, incluidas las "Mesas Redondas" donde se toman decisiones cruzadas |

Dentro de cada carpeta de agente:
- `BRIEF - *.md` — definición del rol
- `LOG - *.md` — historial de avances y decisiones
- `Contexto/` — documentos de referencia usados por ese agente
- `HANDOFF*` (en CTO) — traspasos de trabajo técnico entre sesiones, incluye código de referencia del prototipo

`Inspiración/` contiene imágenes de referencia visual para el diseño del producto.

Los prototipos HTML navegables del MVP están en `CoWork/Product Designer/MVP/` (versión más reciente: `levelop-mvp-v0.3.html`).
