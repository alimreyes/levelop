import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopItem, ItemCategory } from '../entities/shop-item.entity';
import { CreateShopItemDto } from './dto/create-shop-item.dto';
import { UpdateShopItemDto } from './dto/update-shop-item.dto';

@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(ShopItem)
    private shopItemRepository: Repository<ShopItem>,
  ) {}

  /**
   * Calcula el precio final con descuento
   */
  private calculateFinalPrice(item: ShopItem): number {
    if (item.isOffer && item.discountPercentage > 0) {
      return Math.floor(item.price - (item.price * (item.discountPercentage / 100)));
    }
    return item.price;
  }

  /**
   * Enriquece un item con el precio final
   */
  private enrichItemWithFinalPrice(item: ShopItem) {
    return {
      ...item,
      finalPrice: this.calculateFinalPrice(item),
    };
  }

  async findAll() {
    const items = await this.shopItemRepository.find({
      where: { available: true },
    });
    return items.map((item) => this.enrichItemWithFinalPrice(item));
  }

  async findByCategory(category: string) {
    // ✅ Validar que sea una categoría válida
    if (!['weapons', 'armor', 'potions'].includes(category)) {
      throw new BadRequestException('Categoría inválida');
    }

    const items = await this.shopItemRepository.find({
      where: { 
        category: category as ItemCategory, // ✅ CORREGIDO
        available: true 
      },
    });
    return items.map((item) => this.enrichItemWithFinalPrice(item));
  }

  async findOne(id: number) {
    const item = await this.shopItemRepository.findOne({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`Item con ID ${id} no encontrado`);
    }

    return this.enrichItemWithFinalPrice(item);
  }

  async create(createShopItemDto: CreateShopItemDto) {
    // ✅ Crear el item correctamente
    const item = this.shopItemRepository.create({
      name: createShopItemDto.name,
      description: createShopItemDto.description,
      category: createShopItemDto.category as ItemCategory, // ✅ CAST EXPLÍCITO
      icon: createShopItemDto.icon,
      price: createShopItemDto.price,
      discountPercentage: createShopItemDto.discountPercentage || 0,
      isOffer: createShopItemDto.isOffer || false,
      durationHours: createShopItemDto.durationHours,
      available: true,
      benefit: createShopItemDto.benefit,
    });

    const saved = await this.shopItemRepository.save(item);
    return this.enrichItemWithFinalPrice(saved);
  }

  async update(id: number, updateShopItemDto: UpdateShopItemDto) {
    const item = await this.findOne(id);

    Object.assign(item, updateShopItemDto);

    const updated = await this.shopItemRepository.save(item);
    return this.enrichItemWithFinalPrice(updated);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    await this.shopItemRepository.remove(item);
    return { message: 'Item eliminado exitosamente' };
  }
}
