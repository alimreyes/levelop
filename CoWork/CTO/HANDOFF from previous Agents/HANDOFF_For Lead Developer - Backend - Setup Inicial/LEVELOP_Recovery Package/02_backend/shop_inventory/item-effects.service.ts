import { Injectable } from '@nestjs/common';
import { InventoryService } from '../inventory/inventory.service';

// ✅ IDs NUMÉRICOS (coinciden con la BD)
export const ITEM_IDS = {
  // Weapons
  FREEZE_ARROW: 1,      // Arco de Hielo
  FIRE_SWORD: 2,        // Espada de Fuego
  
  // Potions
  ENERGY_POTION: 3,     // Poción de Energía
  
  // Armor
  DAWN_ARMOR: 4,        // Coraza del Amanecer
  WISE_HELMET: 5,       // Casco del Sabio
};

export enum ItemEffect {
  FREEZE_TIME = 'freeze_time',           // Arco de Hielo: +50 minutos
  BLOCK_ASSIGNMENTS = 'block_assignments', // Espada de Fuego: bloquea asignaciones
  DOUBLE_XP = 'double_xp',               // Pociones: x2 XP
  REDUCE_PENALTY = 'reduce_penalty',     // Coraza: -50% penalización
  BONUS_XP_HARD = 'bonus_xp_hard',       // Casco: +25% XP en tareas difíciles
}

@Injectable()
export class ItemEffectsService {
  constructor(private readonly inventoryService: InventoryService) {}

  /**
   * Verifica si el usuario tiene un item activo equipado
   */
  async hasActiveItem(userId: number, itemId: number): Promise<boolean> {
    return this.inventoryService.hasActiveItem(userId, itemId);
  }

  /**
   * Obtiene el tiempo adicional por el Arco de Hielo (item 1)
   */
  async getAdditionalTime(userId: number, taskId: number): Promise<number> {
    const hasFreezeArrow = await this.hasActiveItem(userId, ITEM_IDS.FREEZE_ARROW);
    return hasFreezeArrow ? 50 : 0; // 50 minutos adicionales
  }

  /**
   * Verifica si el usuario puede recibir nuevas asignaciones
   * (bloqueado por Espada de Fuego - item 2)
   */
  async canReceiveAssignments(userId: number): Promise<boolean> {
    const hasFireSword = await this.hasActiveItem(userId, ITEM_IDS.FIRE_SWORD);
    return !hasFireSword; // Si tiene espada de fuego, no puede recibir asignaciones
  }

  /**
   * Calcula el multiplicador de XP basado en items activos
   */
  async getXpMultiplier(userId: number, taskDifficulty: 'baja' | 'media' | 'alta'): Promise<number> {
    let multiplier = 1.0;

    // Casco del Sabio: +25% en tareas difíciles (item 5)
    if (taskDifficulty === 'alta') {
      const hasWiseHelmet = await this.hasActiveItem(userId, ITEM_IDS.WISE_HELMET);
      if (hasWiseHelmet) {
        multiplier += 0.25;
      }
    }

    // Poción de Energía: +10% en todas las tareas (item 3)
    const hasEnergyPotion = await this.hasActiveItem(userId, ITEM_IDS.ENERGY_POTION);
    if (hasEnergyPotion) {
      multiplier += 0.10;
    }

    return multiplier;
  }

  /**
   * Calcula la penalización por tareas atrasadas considerando la Coraza del Amanecer (item 4)
   */
  async getDelayPenalty(userId: number, basePenalty: number): Promise<number> {
    const hasDawnArmor = await this.hasActiveItem(userId, ITEM_IDS.DAWN_ARMOR);
    return hasDawnArmor ? basePenalty * 0.5 : basePenalty; // 50% de reducción
  }

  /**
   * Obtiene todos los efectos activos del usuario
   */
  async getActiveEffects(userId: number): Promise<ItemEffect[]> {
    const effects: ItemEffect[] = [];

    if (await this.hasActiveItem(userId, ITEM_IDS.FREEZE_ARROW)) {
      effects.push(ItemEffect.FREEZE_TIME);
    }

    if (await this.hasActiveItem(userId, ITEM_IDS.FIRE_SWORD)) {
      effects.push(ItemEffect.BLOCK_ASSIGNMENTS);
    }

    if (await this.hasActiveItem(userId, ITEM_IDS.ENERGY_POTION)) {
      effects.push(ItemEffect.DOUBLE_XP);
    }

    if (await this.hasActiveItem(userId, ITEM_IDS.DAWN_ARMOR)) {
      effects.push(ItemEffect.REDUCE_PENALTY);
    }

    if (await this.hasActiveItem(userId, ITEM_IDS.WISE_HELMET)) {
      effects.push(ItemEffect.BONUS_XP_HARD);
    }

    return effects;
  }

  /**
   * ⛑️ Calcular XP con bonus del Casco del Sabio
   * Usado por tasks.service.ts al completar tareas
   */
  async calculateXPWithBonus(
    userId: number,
    baseXP: number,
    importance: 'baja' | 'media' | 'alta',
  ): Promise<number> {
    let finalXP = baseXP;

    // Casco del Sabio: +25% XP en tareas de importancia "alta"
    if (importance === 'alta') {
      const hasWiseHelmet = await this.hasActiveItem(userId, ITEM_IDS.WISE_HELMET);
      if (hasWiseHelmet) {
        finalXP = Math.floor(baseXP * 1.25);
        console.log(`⛑️ Casco del Sabio activo: XP ${baseXP} → ${finalXP} (+25%)`);
      }
    }

    return finalXP;
  }

  /**
   * 🛡️ Reducir penalización con Coraza del Amanecer
   * Usado por tasks.service.ts para tareas atrasadas
   */
  async reducePenalty(
    userId: number,
    originalPenalty: number,
  ): Promise<{ originalPenalty: number; finalPenalty: number; hasCoraza: boolean }> {
    const hasDawnArmor = await this.hasActiveItem(userId, ITEM_IDS.DAWN_ARMOR);

    if (hasDawnArmor) {
      const finalPenalty = Math.floor(originalPenalty * 0.5); // 50% de reducción
      console.log(`🛡️ Coraza del Amanecer activa: Penalización ${originalPenalty} → ${finalPenalty} (-50%)`);
      return {
        originalPenalty,
        finalPenalty,
        hasCoraza: true,
      };
    }

    return {
      originalPenalty,
      finalPenalty: originalPenalty,
      hasCoraza: false,
    };
  }
}
