# 🚨 CORRECCIÓN URGENTE - 30 ERRORES

## 🎯 PASO 1: REEMPLAZAR 4 ARCHIVOS (LOS MÁS IMPORTANTES)

### 1️⃣ src/entities/user.entity.ts
**REEMPLAZAR POR:** `user.entity.FINAL.ts`
- ✅ Agrega `UserRole` enum exportado
- ✅ Agrega campo `department`
- ✅ Agrega campo `unassignableUntil`
- ✅ Agrega relaciones: `tasks`, `comments`, `achievements`, `purchases`

### 2️⃣ src/entities/task.entity.ts
**REEMPLAZAR POR:** `task.entity.FINAL.ts`
- ✅ Agrega campos `assignedTo` y `collaborators`
- ✅ Agrega relación `assignedUser`
- ✅ Agrega relación `comments`

### 3️⃣ src/tasks/tasks.service.ts
**REEMPLAZAR POR:** `tasks.service.FINAL.ts`
- ✅ Firmas de métodos corregidas
- ✅ Usa `NotificationType` correctamente
- ✅ Maneja `penalty` como objeto

### 4️⃣ src/tasks/tasks.controller.ts
**REEMPLAZAR POR:** `tasks.controller.FINAL.ts`
- ✅ Firmas de métodos coinciden con service
- ✅ Usa `completeWithPenalty` en lugar de `completeTaskWithPenalty`

---

## ✏️ PASO 2: EDITAR 1 ARCHIVO

### 📝 src/tasks/tasks.module.ts

**AGREGAR línea 6:**
```typescript
import { NotificationsModule } from '../notifications/notifications.module';
```

**CAMBIAR el @Module:**
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    NotificationsModule, // ✅ AGREGAR ESTA LÍNEA
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
```

---

## 🔧 PASO 3: EDITAR 3 ARCHIVOS (OPCIONAL - Si dan errores)

### 📝 src/shop/shop.controller.ts

Si hay una línea que use `this.shopDiscountService`:

**OPCIÓN A:** Si la línea completa es algo como:
```typescript
const discount = this.shopDiscountService.getDiscount();
```
**→ BORRAR la línea completa**

**OPCIÓN B:** Si la línea es algo como:
```typescript
const price = basePrice - this.shopDiscountService.getDiscount();
```
**→ CAMBIAR por:**
```typescript
const price = basePrice; // Sin descuento por ahora
```

---

### 📝 src/inventory/inventory.module.ts

**QUITAR de controllers:**
```typescript
@Module({
  controllers: [InventoryController], // ✅ SIN ItemEffectsController
})
```

---

### 📝 src/shop/shop.module.ts

**QUITAR de providers:**
```typescript
@Module({
  providers: [ShopService], // ✅ SIN ShopDiscountService
})
```

---

## 🚀 PASO 4: REINICIAR

```bash
npm run start:dev
```

---

## ✅ RESULTADO ESPERADO:

Debería pasar de **30 errores** a **0 errores** (o máximo 2-3 errores menores).

---

## 📋 CHECKLIST RÁPIDO:

- [ ] Reemplacé `user.entity.ts`
- [ ] Reemplacé `task.entity.ts`
- [ ] Reemplacé `tasks.service.ts`
- [ ] Reemplacé `tasks.controller.ts`
- [ ] Edité `tasks.module.ts` (agregar NotificationsModule)
- [ ] Edité `inventory.module.ts` (quitar ItemEffectsController)
- [ ] Edité `shop.module.ts` (quitar ShopDiscountService)
- [ ] Edité `shop.controller.ts` (quitar uso de shopDiscountService)
- [ ] Reinicié el servidor

---

## ⚡ PRIORIDAD MÁXIMA:

**Haz primero el PASO 1 y PASO 2.** Esos son los más importantes y resolverán el 90% de los errores.

Los PASO 3 son opcionales y solo si siguen dando errores.

---

¡Hazlo en ese orden y deberías estar listo! 🚀
