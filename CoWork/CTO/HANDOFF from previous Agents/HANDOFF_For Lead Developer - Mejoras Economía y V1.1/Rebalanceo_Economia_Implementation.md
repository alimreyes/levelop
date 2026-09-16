# ⚠️ Nota sobre este documento
Este archivo se había generado antes en esta misma conversación, pero no quedó guardado
de forma persistente (el entorno de trabajo se reinicia entre sesiones si no exportas
los archivos). Esta es una **reconstrucción fiel** basada en lo que se acordó en el chat,
no una recuperación byte-exacta del original. Los números y fórmulas son los que se
discutieron y aprobaron.

---

# 💰 LVL UP — Rebalanceo de Economía (Sección TIENDA)

## 📍 ¿Dónde se implementa esto?

**TODO en FRONTEND**, porque el proyecto todavía no tiene backend real (Fase 0 del plan
general sigue pendiente). El estado se maneja con `useState` + `localStorage`.

Archivo objetivo: `LVL_UP_-_App_Completa_Unificada.tsx`

Ubicaciones reales verificadas en el archivo actual:
- **Array `shopItems`** → línea 81 (`const [shopItems] = useState([...])`)
- **Función `addTask`** (cálculo de recompensas XP/Gold) → línea 291
- **Estado inicial `tasks`** (datos de prueba) → línea 23

> Nota: en el chat mencioné líneas aproximadas distintas (~170, ~600); esas eran
> estimaciones. Las líneas de arriba son las verificadas contra el archivo real del proyecto.

---

## 🎯 1. Categorías de rareza para ítems de tienda

| Rareza  | Rango de precio (gold) |
|---------|-------------------------|
| Común   | 50 – 100                |
| Raro    | 200 – 400                |
| Épico   | 500 – 800                |

**Regla de balance:** 1 día bueno de tareas (≈5 tareas de dificultad media) debe rendir
~250–300 gold. Con eso:
- Un usuario activo puede comprar ~1 ítem raro por semana, o
- Ahorrar ~2 semanas para un ítem épico.

### Estado actual del código (sin aplicar todavía)
Los ítems en `shopItems` hoy usan precios antiguos, sin campo de rareza:
```javascript
{ id: 'w1', name: 'Arco de Hielo', price: 50, ... }
{ id: 'w2', name: 'Espada de Fuego', price: 75, ... }
{ id: 'a1', name: 'Coraza del Amanecer', price: 80, ... }
{ id: 'a2', name: 'Casco del Sabio', price: 65, ... }
{ id: 'p1', name: 'Poción de Energía', price: 40, ... }
{ id: 'p2', name: 'Elixir de Claridad', price: 55, ... }
```

### Cambio propuesto
Agregar campo `rarity` y reescalar precios según el nuevo rango. Ejemplo con la Espada de Fuego
(efecto fuerte: bloquea asignación de tareas 1hr) subiendo a rareza Épica:
```javascript
{ id: 'w2', name: 'Espada de Fuego', rarity: 'epic', price: 600, ... }
```

---

## ⚡ 2. Nueva fórmula de recompensas (XP y Gold)

**Antes** (código actual en `addTask`, línea 291):
```javascript
const xpReward = Math.floor(50 * urgMult[newTask.urgency] * impMult[newTask.importance]);
const goldReward = Math.floor(20 * urgMult[newTask.urgency] * impMult[newTask.importance]);
```

**Después** (acordado en esta sesión):
```javascript
const urgMult = { baja: 1, media: 1.5, alta: 2 };
const impMult = { baja: 1, media: 1.5, alta: 2 };

const xpReward = Math.floor(30 * urgMult[newTask.urgency] * impMult[newTask.importance]);
const goldReward = Math.floor(15 * urgMult[newTask.urgency] * impMult[newTask.importance]);
```

| Urgencia/Importancia | Multiplicador |
|-----------------------|----------------|
| Baja                  | 1x             |
| Media                 | 1.5x           |
| Alta                  | 2x             |

### Ejemplo de resultado
Tarea de urgencia media + importancia alta:
- XP = 30 × 1.5 × 2 = **90 XP**
- Gold = 15 × 1.5 × 2 = **45 Gold**

---

## ✅ Checklist de esta sub-sección (Tienda — Fase 2, Semana 6)

- [ ] Agregar campo `rarity` a cada ítem en `shopItems`
- [ ] Reescalar precios: Comunes 50-100 / Raros 200-400 / Épicos 500-800
- [ ] Reemplazar fórmula de XP en `addTask` (base 30, multiplicadores urgencia/importancia)
- [ ] Reemplazar fórmula de Gold en `addTask` (base 15, mismos multiplicadores)
- [ ] Actualizar `tasks` de prueba (línea 23) con las nuevas recompensas para que la demo sea consistente
- [ ] Testing manual: simular 1 semana de tareas variadas y verificar que el gold acumulado permite comprar ~1 ítem raro

## ⏭️ Pendiente de decidir (no bloqueante)
- Si el campo `rarity` se usa solo para mostrar un badge visual, o si también filtra/ordena en la tienda
- Si los ítems existentes (Arco de Hielo, Espada de Fuego, etc.) cambian de rareza o solo de precio
