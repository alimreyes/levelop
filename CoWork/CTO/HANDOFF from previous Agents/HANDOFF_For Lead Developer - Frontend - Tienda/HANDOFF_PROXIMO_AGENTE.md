# 🎮 LVL UP! — Documento de Traspaso para el Próximo Agente

**Última actualización:** Sesión Tienda V1.5 (Diciembre 2025)
**Preparado por:** Claude (sesión de desarrollo frontend — Tienda)

---

## 1️⃣ OBJETIVO DEL PROYECTO

**LVL UP!** es una plataforma SaaS de gamificación que transforma la gestión de tareas laborales en una experiencia estilo RPG. El objetivo de negocio (Alim es Founder & CEO) es:

- Convertir tareas diarias en "misiones" con recompensas de **XP** y **oro virtual**.
- Sistema de **niveles, logros y leaderboards** entre equipos para aumentar el engagement.
- Resolver el problema de desmotivación/desenganche laboral en equipos pequeños.
- **Mercado objetivo:** agencias y empresas tech pequeñas (10-30 empleados) en Santiago, Chile (ej. Base1 Publicidad, Agencia Salvaje).
- **Pricing:** $10-12/usuario/mes (normal), con "founder's deal" de $4/usuario/mes (60% OFF) para early adopters en fase beta.
- **Meta actual de negocio:** conseguir 4-5 clientes beta mediante outreach sistemático (LinkedIn, email, WhatsApp), con filosofía "hecho es mejor que perfecto".

**Objetivo técnico de esta sesión:** completar la sección **Tienda** (Shop) del frontend en React con sistema de filtros avanzados y ofertas/descuentos, antes de avanzar a otras secciones (Misiones, Alertas, Líderes, Perfil) y a la integración con backend (NestJS + TypeORM + PostgreSQL, actualmente el frontend usa `localStorage`).

---

## 2️⃣ STATUS ACTUAL

| Sección | Estado |
|---|---|
| **Tienda (Shop)** | ✅ **COMPLETA** — V1.5, confirmada funcionando por Alim con screenshot |
| Misiones | ⏳ Placeholder en este archivo de Tienda. Existen versiones más avanzadas en otros archivos de proyecto (ver sección 3) |
| Alertas | ⏳ Placeholder, no iniciado en esta línea de trabajo |
| Líderes (Leaderboard) | ⏳ Placeholder, no iniciado en esta línea de trabajo |
| Perfil/Héroe | ⏳ Placeholder, no iniciado en esta línea de trabajo |
| Backend (NestJS/PostgreSQL) | ⏳ No iniciado — frontend sigue usando `localStorage`, estructurado para migración futura |

**La Tienda V1.5 es la versión más actualizada** y quedó confirmada como funcional por el usuario (Alim) mediante screenshot de la app corriendo, mostrando badge de oferta, timer, precio tachado y precio final correctamente renderizados.

---

## 3️⃣ ARCHIVOS RELEVANTES

### 🎯 Archivo principal (el más actualizado — usar este)
```
/mnt/user-data/outputs/LvlUpApp_Tienda_V1.5_Ofertas_SingleSelect.jsx
```
Este es el código que Alim ya copió a `src/App.jsx` de su proyecto React (Vite) y confirmó que funciona.

### 📄 Documentación de la versión actual
```
/mnt/user-data/outputs/V1.5_OFERTAS_FILTROS_SINGLE.md
```
Explica en detalle: sistema de ofertas con timer, animación pulse, y el cambio de filtros multi-select → single-select.

### 📚 Historial de versiones (contexto, no usar como base — están superadas)
```
LvlUpApp_Tienda_V1.1_Balanced.jsx / V1.1_UPDATED.jsx  → Economía base (XP/Gold), rareza 3 tiers
LvlUpApp_Tienda_V1.2_Final.jsx                         → Modal corporativo, banner persistente
LvlUpApp_Tienda_V1.3_Mobile.jsx                        → Optimización mobile-first
LvlUpApp_Tienda_V1.4_Filtros.jsx                       → Filtros avanzados (multi-select, ahora reemplazado)
```

### 🧩 Archivos de proyecto (Project Knowledge) — de otra línea de trabajo, sobre Misiones
Estos **no** corresponden a esta sesión de Tienda, pero están disponibles en el proyecto y son el punto de partida lógico para implementar la sección de Misiones:
```
/mnt/project/LVL_UP_-_App_Completa_Unificada.tsx           (1,435 líneas — app unificada con más secciones)
/mnt/project/LVL_UP_-_Sistema_Unificado_de_Misiones.tsx     (1,668 líneas — sistema de misiones)
/mnt/project/LVL_UP_-_Misiones_Mejoradas_con_Detalles.tsx   (618 líneas — misiones con detalle)
```
⚠️ **Importante para el próximo agente:** antes de usarlos, verificar si son compatibles/actualizados respecto a la Tienda V1.5 (mismo sistema de estado, mismos componentes compartidos como Header, tabs, etc.), ya que provienen de un hilo de trabajo distinto y podrían no estar sincronizados.

### 🗂️ Dependencias del proyecto
- React + Vite, TypeScript parcial
- Tailwind CSS
- `lucide-react` (iconos)
- `recharts` (gráficos, para analíticas — aún no usado en Tienda)

---

## 4️⃣ CAMBIOS Y CORRECCIONES IMPLEMENTADOS EN ESTA SESIÓN (V1.4 → V1.5)

### 🔥 Sistema de Ofertas (nuevo)
- Badge "OFERTA" con gradiente rojo (`from-red-600 to-red-500`) y emoji 🔥.
- Precio original tachado (`line-through`) junto al precio final destacado en badge dorado con ícono de moneda.
- **Indicador de tiempo restante** (countdown) que se actualiza cada **1 segundo** (más preciso que la sugerencia original de backend, que pedía actualización cada minuto).
- Lógica de color por urgencia: naranja si queda >1h, azul/naranja en rango medio, rojo si queda <1h.
- **Animación pulsante + efecto glow rojo** cuando la oferta tiene menos de 1 hora restante (`animate-pulse-offer`, clase `glow-red`).
- Badge "Expirada" cuando el timer llega a cero.

### 🎯 Filtros: cambio de multi-select a single-select
- **Antes (V1.4):** checkboxes, se podían combinar múltiples filtros por categoría (ej. Tiempo + Experiencia a la vez) con lógica OR dentro de categoría / AND entre categorías.
- **Ahora (V1.5):** radio buttons — **solo un filtro activo por categoría** (Beneficio / Tipo / Precio). Estado cambió de arrays (`benefits: []`) a valores únicos (`benefit: null`).
- Se agregó texto "(selecciona uno)" en cada sección del modal de filtros para dejar clara la nueva regla.
- Toggle: primer click selecciona, segundo click sobre la misma opción la deselecciona.

### Validación con sugerencia previa de backend
Se comparó explícitamente contra una sugerencia dada en un chat anterior sobre backend (contador cada minuto, badge simple, precio tachado básico) — se confirmó que V1.5 cumple y **excede** esa sugerencia (timer cada segundo, animaciones, badges mejorados).

---

## 5️⃣ ERRORES / OBSERVACIONES — QUÉ FUNCIONA Y QUÉ NO

### ✅ Confirmado funcionando (por Alim, vía screenshot real de la app)
- Badge "-15% OFF" renderizando correctamente en rojo.
- Timer countdown visible y con formato correcto (ej. "16h 0m").
- Precio original tachado (280) + precio final en badge naranja/dorado (238).
- Diseño general responsive y sin errores visuales evidentes.
- Header, tabs de rareza (Todos/Común/Raro/Épico), botón "Filtros Avanzados" visibles.

### ⚠️ No confirmado / pendiente de verificar
- El screenshot compartido **no muestra el modal de filtros abierto**, por lo que el comportamiento single-select (radio buttons, solo un filtro por categoría) **no ha sido validado visualmente todavía** — solo se validó el sistema de ofertas.
- No se ha probado la animación de **pulse** en ofertas con menos de 1 hora restante (el item mostrado tenía "16h 0m", fuera del rango de pulso).
- No se reportaron errores de consola ni bugs por parte de Alim hasta el momento.

### 🚫 Sin errores reportados por el usuario en esta sesión.

---

## 6️⃣ SIGUIENTES PASOS

Al cierre de esta sesión, Alim aún no ha decidido la prioridad siguiente. Las opciones puestas sobre la mesa fueron:

1. **Implementar Misiones** (recomendado como prioridad — sección más importante del producto): drag & drop, comentarios, asignación de tareas, recompensas XP/Oro. Punto de partida sugerido: los archivos en `/mnt/project/` listados arriba (validar compatibilidad primero).
2. **Implementar Alertas** (notificaciones, menciones).
3. **Implementar Líderes** (rankings, gráficos con `recharts`).
4. **Implementar Perfil/Héroe** (avatar, logros, progreso, equipamiento).
5. **Ajustar algo adicional de Tienda** (aún no solicitado, pero abierto).
6. **Conectar con Backend real** (NestJS + PostgreSQL, reemplazando `localStorage`), incluyendo JWT auth y WebSockets — esto es parte del roadmap técnico general del proyecto pero no se abordó en esta sesión.

**Recomendación para el próximo agente:** confirmar con Alim si aún faltan validaciones pendientes de Tienda V1.5 (especialmente el modal de filtros single-select) antes de saltar a una nueva sección, y luego seguir con Misiones dado que es la sección núcleo del producto.

---

## 📌 Notas de contexto adicionales para el agente

- Alim trabaja ~18 horas/semana en el proyecto, en paralelo a su trabajo en agencia de marketing.
- Prefiere ejecución rápida ("hecho es mejor que perfecto") sobre planificación extensa — no perder tiempo en exceso de confirmaciones, proponer y ejecutar.
- Prefiere respuestas y código en español (la comunicación de todo el proyecto ha sido en español).
- Todo el código de Tienda vive actualmente en un solo archivo `src/App.jsx` (monolítico) — hay migración planeada hacia arquitectura modular con separación de componentes, pero aún no ejecutada.
