import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { UserInventory } from './entities/user-inventory.entity'; // ✅ CORREGIDO
import { ShopItem } from '../entities/shop-item.entity'; // ✅ CORREGIDO
import { PurchaseItemDto, EquipItemDto, UserInventoryResponseDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(UserInventory)
    private inventoryRepository: Repository<UserInventory>,
    @InjectRepository(ShopItem)
    private shopItemRepository: Repository<ShopItem>,
  ) {}

  async purchaseItem(dto: PurchaseItemDto): Promise<UserInventoryResponseDto> {
    const { userId, itemId, durationHours } = dto;

    // Verificar que el item existe
    const item = await this.shopItemRepository.findOne({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException(`Item con id ${itemId} no encontrado`);
    }

    // Crear entrada en inventario
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + durationHours);

    const inventory = this.inventoryRepository.create({
      userId,
      itemId,
      expiresAt,
      isActive: true,
      isEquipped: false,
    });

    const saved = await this.inventoryRepository.save(inventory);

    return {
      ...saved,
      item: {
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category,
        icon: item.icon,
        price: item.price,
        benefit: item.benefit,
      },
    };
  }

  async equipItem(dto: EquipItemDto): Promise<UserInventoryResponseDto> {
    const { userId, itemId } = dto;

    // Buscar el item en el inventario del usuario
    const inventory = await this.inventoryRepository.findOne({
      where: { userId, itemId, isActive: true },
      relations: ['item'],
    });

    if (!inventory) {
      throw new NotFoundException(`Item ${itemId} no encontrado en el inventario del usuario`);
    }

    // Verificar que no esté expirado
    if (new Date() > inventory.expiresAt) {
      throw new BadRequestException('Este item ha expirado');
    }

    // Desequipar otros items de la misma categoría
    await this.inventoryRepository.update(
      { userId, isEquipped: true },
      { isEquipped: false }
    );

    // Equipar el item seleccionado
    inventory.isEquipped = true;
    const updated = await this.inventoryRepository.save(inventory);

    return {
      ...updated,
      item: {
        id: inventory.item.id,
        name: inventory.item.name,
        description: inventory.item.description,
        category: inventory.item.category,
        icon: inventory.item.icon,
        price: inventory.item.price,
        benefit: inventory.item.benefit,
      },
    };
  }

  async getUserInventory(userId: number): Promise<UserInventoryResponseDto[]> {
    const inventory = await this.inventoryRepository.find({
      where: { userId, isActive: true },
      relations: ['item'],
    });

    return inventory.map((entry) => ({
      ...entry,
      item: {
        id: entry.item.id,
        name: entry.item.name,
        description: entry.item.description,
        category: entry.item.category,
        icon: entry.item.icon,
        price: entry.item.price,
        benefit: entry.item.benefit,
      },
    }));
  }

  async hasActiveItem(userId: number, itemId: number): Promise<boolean> {
    const count = await this.inventoryRepository.count({
      where: {
        userId,
        itemId,
        isActive: true,
        isEquipped: true,
        expiresAt: LessThan(new Date()),
      },
    });

    return count > 0;
  }

  async cleanExpiredItems(): Promise<void> {
    await this.inventoryRepository.update(
      { expiresAt: LessThan(new Date()), isActive: true },
      { isActive: false, isEquipped: false }
    );
  }
}
