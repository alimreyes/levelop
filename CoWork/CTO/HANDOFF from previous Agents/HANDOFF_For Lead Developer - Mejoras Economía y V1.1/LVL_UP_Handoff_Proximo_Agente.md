# 🎮 LVL UP — Documento de Traspaso para el Próximo Agente
**Preparado:** para continuidad entre sesiones de Claude
**Fundador:** Alim (Founder & CEO)

---

## 1. Objetivo del Proyecto

**LVL UP** es una plataforma SaaS de gamificación empresarial que convierte la gestión de
tareas diarias en una experiencia tipo RPG: las tareas son "misiones" con recompensas de
XP y oro virtual, hay niveles, logros, tienda de ítems con efectos reales, y leaderboards
de equipo. La propuesta de valor central: combatir el desenganche laboral haciendo que el
trabajo sea más motivador y competitivo.

**Mercado objetivo:** agencias y empresas tech pequeñas (10-30 empleados), no enterprise.
**Pricing:** $10-12/usuario/mes (precio normal). Se está usando un "founder's deal" de
lanzamiento: $4/usuario/mes (60% off) para early adopters.
**Beta targets identificados:** agencias en Santiago, Chile — Base1 Publicidad y Marketing,
Agencia Salvaje.
**Contexto del fundador:** Alim trabaja solo (sin equipo), ~18 horas/semana en el proyecto,
mientras mantiene su trabajo actual en una agencia (lo cual le da acceso a la industria y a
prospectos). Filosofía declarada: **"hecho es mejor que perfecto"** — prioriza ejecución
rápida y outreach sistemático de clientes por sobre planificación exhaustiva.

**Meta de esta iteración (V1.1):** transformar el prototipo funcional (V1, solo frontend con
localStorage) en un producto listo para vender a los primeros beta customers, con backend
real, economía balanceada, y las mejoras de UX que Alim identificó en su propio análisis.

---

## 2. Status Actual (a la fecha de este traspaso)

- **V1 completa:** frontend funcional en React + Vite + Tailwind, sin backend. Todo el
  estado vive en `useState` y se pensaba migrar a `localStorage` / backend real.
- **V1.1 — Fase de planificación: completa.** En una sesión anterior se generó un plan
  estratégico completo de 10 fases (~20 semanas para producto completo, ~12 semanas para
  MVP). Alim aprobó la **Opción A** (empezar por backend, 3 semanas) y confirmó que
  **trabaja solo**.
- **V1.1 — Fase de implementación: NO ha comenzado en el código.** Se verificó en esta
  sesión que el archivo principal del proyecto (`LVL_UP_-_App_Completa_Unificada.tsx`)
  **todavía usa la lógica y precios antiguos** — el rebalanceo de economía discutido en
  esta sesión (ver sección 4) está documentado pero no aplicado al código.
- **No existe backend todavía.** Todo sigue siendo frontend-only con estado en memoria.
- **⚠️ Punto operativo importante:** el entorno de trabajo de Claude se reinicia entre
  sesiones. Los archivos que se generan con `create_file` en `/mnt/user-data/outputs/`
  **no persisten automáticamente** de una sesión a otra — Alim debe descargarlos/guardarlos
  él mismo. En esta sesión se tuvo que reconstruir 4 de los 5 documentos de planificación
  a partir de un transcript guardado, y el 5to (rebalanceo de economía) se reconstruyó de
  memoria de la conversación porque no había transcript de esa parte. **Recomendación:**
  pedirle a Alim que guarde los .md entregados en su propio repositorio o Google Drive
  apenas los recibe.

---

## 3. Archivos Relevantes

### Código de la app (en el proyecto de Claude, carpeta `/mnt/project/`)
Hay **tres archivos .tsx** y no está 100% claro cuál es la fuente de verdad actual:

| Archivo | Líneas | Notas |
|---|---|---|
| `LVL_UP_-_App_Completa_Unificada.tsx` | 1435 | Tiene Recharts (gráficas de analytics), `avatarColor`, fechas 2025. Parece la versión más "completa" en Líderes/Analytics. |
| `LVL_UP_-_Sistema_Unificado_de_Misiones.tsx` | 1668 | Más grande, sin Recharts. Probablemente tiene trabajo más detallado en la sección Misiones (filtros, drag-and-drop) que no se ha fusionado con el archivo de arriba. |
| `LVL_UP_-_Misiones_Mejoradas_con_Detalles.tsx` | 618 | El más chico, fechas 2024 — parece una iteración más antigua. |

**Ninguno de los tres tiene todavía sistema de inventario implementado** (confirmado por
grep), aunque está en el roadmap de la Fase 2.

**⚠️ Acción recomendada para el próximo agente:** antes de tocar código, preguntarle a
Alim cuál de los tres archivos es su versión de trabajo actual (probablemente
`App_Completa_Unificada.tsx`, pero conviene confirmar si fusionó las mejoras de misiones
de `Sistema_Unificado_de_Misiones.tsx`).

### Documentos de planificación (entregados en `/mnt/user-data/outputs/`)
1. **`LVL_UP_Plan_Implementacion_V1.1.md`** — Plan maestro de 10 fases, con impacto/
   complejidad/tiempo por feature y cronograma de 20 semanas.
2. **`LVL_UP_Quick_Start_Guide.md`** — Guía práctica de las primeras 2 semanas, con código
   completo de setup de backend (NestJS + PostgreSQL + JWT), schema SQL, y conexión
   frontend-backend con React Query.
3. **`LVL_UP_Resumen_Ejecutivo.md`** — Resumen de 1 página para stakeholders/inversores.
4. **`LVL_UP_Checklist_Completo.md`** — Checklist de 200+ items organizados por fase y
   sección de la app (Misiones, Tienda, Alertas, Líderes, Héroe), en el mismo formato de
   checkboxes que Alim usó para trackear la V1.
5. **`Rebalanceo_Economia_Implementation.md`** — Detalle de la sección Tienda: nuevas
   fórmulas de XP/Gold y categorías de rareza de ítems (ver sección 4). **Reconstruido en
   esta sesión** — el original no persistió.

---

## 4. Cambios y Correcciones Implementados en Esta Sesión

Esta sesión fue principalmente de **clarificación y documentación**, no de código directo
(no se editaron los .tsx). Lo acordado:

### Rebalanceo de economía — Sección Tienda (Fase 2, Semana 6)
- **Categorías de rareza de ítems:**
  - Comunes: 50-100 gold
  - Raros: 200-400 gold
  - Épicos: 500-800 gold
- **Regla de balance:** 1 día bueno de tareas (~5 tareas de dificultad media) ≈ 250-300 gold.
- **Nueva fórmula de recompensas por tarea:**
  - `XP = 30 × multiplicador_urgencia × multiplicador_importancia`
  - `Gold = 15 × multiplicador_urgencia × multiplicador_importancia`
  - Multiplicadores: baja = 1x, media = 1.5x, alta = 2x
  - (Antes era base 50 XP / 20 Gold, sin categorías de rareza en la tienda)

### Clarificación de arquitectura
Se confirmó con Alim: como todavía no hay backend, **todo el rebalanceo de economía se
implementa en frontend** por ahora (en el archivo `App_Completa_Unificada.tsx`), con la
lógica escrita de forma que sea fácil de migrar al backend cuando exista (Fase 0).

---

## 5. Errores / Aprendizajes (qué funciona y qué no)

- **No se reportaron bugs de la aplicación en esta sesión** — el trabajo fue de
  planificación y diseño de la economía, no de debugging.
- **Brecha plan-vs-código:** el plan de rebalanceo de economía fue aprobado y documentado,
  pero **todavía no está aplicado en el código real**. El próximo agente no debe asumir
  que estas fórmulas ya están funcionando — hay que implementarlas.
- **Persistencia de archivos entre sesiones (aprendizaje operativo, no un bug de la app):**
  los documentos generados con `create_file` no sobreviven automáticamente entre sesiones
  de Claude si Alim no los guarda por su cuenta. Esto ya causó que se tuviera que
  reconstruir 4 de 5 documentos en esta sesión. Vale la pena decírselo a Alim explícitamente
  para que archive los entregables apenas los recibe (en su repo, Notion, Drive, etc.).
- **Ambigüedad de "fuente de verdad" del código:** hay tres archivos .tsx con features que
  no están claramente fusionadas entre sí (ver sección 3). Esto puede causar que se
  implemente algo sobre un archivo que no es el que Alim está usando activamente. Vale la
  pena preguntar antes de escribir código.

---

## 6. Siguientes Pasos

### Inmediatos (retomar donde quedó esta sesión)
1. Confirmar con Alim cuál .tsx es la versión activa de trabajo.
2. Aplicar el rebalanceo de economía al código real:
   - Agregar campo `rarity` a `shopItems` y reescalar precios.
   - Reemplazar la fórmula de XP/Gold en `addTask` (base 30/15, multiplicadores por
     urgencia e importancia).
   - Actualizar las tareas de prueba para que la demo sea consistente con la nueva economía.
3. Seguir con el resto de la Fase 2 (Semana 6-7 del plan): sistema de inventario, lógica de
   efectos de ítems, mejoras de tienda (descuentos por vencimiento, filtros por beneficio).

### Según el plan aprobado (Opción A: backend primero)
4. Si todavía no se ha empezado, **Fase 0 — Fundación técnica** sigue siendo el bloqueante
   real: backend NestJS + PostgreSQL + JWT + sistema de roles. El código de referencia ya
   está en `LVL_UP_Quick_Start_Guide.md`.
5. Continuar el checklist de `LVL_UP_Checklist_Completo.md` fase por fase, sección por
   sección (Misiones → Tienda → Alertas → Líderes → Héroe).

### Recordatorio de negocio (no técnico, pero relevante para priorizar)
6. Alim sigue en fase activa de outreach a clientes beta (Santiago, Chile) con la meta de
   14 días / 4-5 beta customers. Si en algún momento hay que elegir entre pulir una feature
   más vs. tener algo demostrable para un prospecto, la filosofía de Alim es "hecho es mejor
   que perfecto" — priorizar lo demostrable.

---

*Fin del documento de traspaso.*
