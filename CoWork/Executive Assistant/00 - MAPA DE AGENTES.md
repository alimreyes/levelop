# MAPA DE AGENTES — LEVELOP
**Dueño:** Executive Assistant · v1.0 · 06 Ago 2026

---

## LA RED

```
                                  ┌─────────┐
                                  │  ALIM   │  Founder & CEO humano
                                  │ (final) │  Único que aprueba dinero,
                                  └────┬────┘  precio y pivotes.
                                       │
                                  ┌────▼────┐
                       ┌──────────│   EA    │──────────┐
                       │          │ (hub)   │          │
                       │          └────┬────┘          │
                       │               │               │
              ┌────────▼──────┐  ┌─────▼─────┐  ┌──────▼────────┐
              │  ESTRATEGIA   │  │ EVIDENCIA │  │  CONSTRUCCIÓN │
              └───────────────┘  └───────────┘  └───────────────┘
                     │                 │                 │
              ┌──────┴──────┐          │          ┌──────┴──────┐
              │             │          │          │             │
           ┌──▼──┐       ┌──▼──┐    ┌──▼──┐    ┌──▼──┐       ┌──▼──┐
           │ CEO │◄─────►│ CFO │    │ LR  │    │ CTO │◄─────►│ PD  │
           └──┬──┘       └──┬──┘    └──┬──┘    └──┬──┘       └──┬──┘
              │             │          │          │             │
              │             │          │          │             │
              └─────────────┼──────────┼──────────┘             │
                            │          │                        │
                         ┌──▼──┐       │                        │
                         │ CMO │◄──────┼────────────────────────┘
                         └──┬──┘       │
                            │          │
                         ┌──▼──┐       │
                         │ GS  │◄──────┘
                         └─────┘

   ◄────►  canal lateral activo (fricción productiva declarada)
```

---

## LOS 8 AGENTES

| # | Agente | Una frase | Su pregunta obsesiva |
| :-- | :--- | :--- | :--- |
| 1 | **Executive Assistant** (EA) | El sistema nervioso. Rutea, prioriza, escala, mantiene el Dashboard. | *"¿Quién está esperando qué, y desde cuándo?"* |
| 2 | **CEO Agent** | El dueño de la secuencia. Decide qué se hace primero y qué se sacrifica. | *"¿Esto nos acerca al primer cliente que paga?"* |
| 3 | **CFO Agent** | El guardián del modelo. Precio, márgenes, TCO, el Oro como pasivo. | *"¿Cuánto cuesta esto realmente, y quién lo paga?"* |
| 4 | **CMO Agent** | El dueño de la categoría. Posicionamiento, mensaje, canales. | *"¿Por qué nos elegirían a nosotros y no a Monday?"* |
| 5 | **CTO Agent** | El traductor de ambición a arquitectura. Stack, secuencia, deuda. | *"¿Esto se puede construir con el equipo y el tiempo que hay?"* |
| 6 | **Lead Researcher** (LR) | La autoridad de evidencia. Nadie publica una cifra que él no firmó. | *"¿De dónde sacaste ese número?"* |
| 7 | **Product Designer** (PD) | El dueño de la experiencia. Flujos, jerarquía, el loop de juego. | *"¿Un empleado con mala conexión y 3 minutos entiende esto?"* |
| 8 | **Growth & Sales** (GS) | El que se estrella contra el mercado real. Outbound, ICP, objeciones. | *"¿Qué me contestó el prospecto que no está en el playbook?"* |

---

## POR QUÉ CADA CANAL LATERAL EXISTE

Un canal existe cuando dos agentes tienen **incentivos legítimamente opuestos**. Ahí es donde se produce el pensamiento; el resto es coordinación y va por la EA.

| Canal | Tensión | Qué se rompe si no existe |
| :--- | :--- | :--- |
| `CEO - CFO` | Velocidad vs. runway | Se promete un roadmap que no está financiado |
| `CFO - CMO` | Alcance vs. payback | Se gasta en awareness antes de tener un funnel que convierte |
| `CFO - CTO` | Deuda técnica vs. TCO | Se elige CRDT y se paga 17-33x en RAM sin que nadie lo vea hasta la factura |
| `CEO - CTO` | Promesa vs. capacidad | Se le vende a un cliente una integración que no existe |
| `CMO - LR` | Claim vs. evidencia | Salimos al mercado con "+85% engagement" sin poder defenderlo |
| `CMO - GS` | Mensaje vs. objeción | El pitch suena bien en el deck y muere en la primera llamada |
| `CTO - PD` | Deseable vs. construible | Se diseña un feed en tiempo real que satura el sync server |
| `PD - LR` | Diseño vs. comportamiento | Se construye un leaderboard que quema al percentil bajo |
| `GS - CFO` | Descuento vs. margen | Se cierra el primer cliente a un precio que no escala |

---

## FLUJOS TÍPICOS

**Una decisión de producto:**
`LR (evidencia) → PD (flujo) → CTO (viabilidad) → CFO (costo) → CEO (sí/no) → EA (tarea) → Dashboard`

**Una decisión de mercado:**
`GS (señal de campo) → CMO (relectura de mensaje) → LR (¿la evidencia lo sostiene?) → CEO (sí/no) → EA → Dashboard`

**Una decisión de dinero:**
`CFO (modelo) → CEO (implicación estratégica) → EA (consolida) → ALIM (firma)`

**Un bloqueo:**
`Agente → su canal con EA → EA evalúa → (a) resuelve, (b) convoca mesa, (c) escala a Alim`

---

## ESTADO ACTUAL DEL ROSTER

| Agente | Estado | Carpeta | Contexto propio cargado |
| :--- | :--- | :--- | :--- |
| EA | 🟢 Activo | `Executive Assistant/` | Context.md, protocolo, dashboard |
| CFO | 🟢 Activo | `CFO/` | TCO doc + modelo ROI (xlsx/csv) |
| CMO | 🟢 Activo | `CMO/Contexto/` | Positioning brief |
| Lead Researcher | 🟢 Activo | `Lead Researcher/Contexto/` | 4 PDFs + playbook VE + Cashea spec + engagement + arquitectura |
| CEO | 🟡 Creado 06/08 | `CEO/` | Hereda de todos; sin doc propio aún |
| CTO | 🟡 Creado 06/08 | `CTO/` | Hereda Cashea spec + arquitectura deep dive |
| Product Designer | 🟡 Creado 06/08 | `Product Designer/` | Hereda engagement analysis; sin doc propio |
| Growth & Sales | 🟡 Creado 06/08 | `Growth & Sales/` | Hereda playbook VE §8 (objeciones); sin doc propio |

🟡 = brief listo, sin historial de trabajo todavía.
