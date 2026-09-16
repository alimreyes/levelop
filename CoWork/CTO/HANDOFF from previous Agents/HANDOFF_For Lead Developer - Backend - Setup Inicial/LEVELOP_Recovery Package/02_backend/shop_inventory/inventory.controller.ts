import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { PurchaseItemDto, EquipItemDto, UserInventoryResponseDto } from './dto/inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  /**
   * POST /inventory/purchase
   * Comprar un item y agregarlo al inventario
   */
  @Post('purchase')
  async purchaseItem(@Body() dto: PurchaseItemDto): Promise<UserInventoryResponseDto> {
    return this.inventoryService.purchaseItem(dto);
  }

  /**
   * POST /inventory/equip
   * Equipar un item del inventario
   */
  @Post('equip')
  async equipItem(@Body() dto: EquipItemDto): Promise<UserInventoryResponseDto> {
    return this.inventoryService.equipItem(dto);
  }

  /**
   * GET /inventory/user/:userId
   * Obtener el inventario de un usuario
   */
  @Get('user/:userId')
  async getUserInventory(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserInventoryResponseDto[]> {
    return this.inventoryService.getUserInventory(userId);
  }

  /**
   * GET /inventory/user/:userId/item/:itemId/active
   * Verificar si un usuario tiene un item activo y equipado
   */
  @Get('user/:userId/item/:itemId/active')
  async hasActiveItem(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('itemId', ParseIntPipe) itemId: number, // ✅ NUMBER
  ): Promise<{ hasItem: boolean }> {
    const hasItem = await this.inventoryService.hasActiveItem(userId, itemId);
    return { hasItem };
  }

  /**
   * POST /inventory/clean-expired
   * Limpiar items expirados (para ejecutar con cron)
   */
  @Post('clean-expired')
  async cleanExpiredItems(): Promise<{ message: string }> {
    await this.inventoryService.cleanExpiredItems();
    return { message: 'Items expirados limpiados correctamente' };
  }
}
