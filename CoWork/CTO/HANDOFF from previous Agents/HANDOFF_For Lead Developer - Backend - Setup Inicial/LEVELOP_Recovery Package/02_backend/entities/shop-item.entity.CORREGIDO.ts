import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserInventory } from '../inventory/entities/user-inventory.entity'; // ✅ CORREGIDO

export enum ItemCategory {
  WEAPONS = 'weapons',
  ARMOR = 'armor',
  POTIONS = 'potions'
}

@Entity('shop_items')
export class ShopItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ItemCategory,
    name: 'category'
  })
  category: ItemCategory;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon: string;

  @Column({ type: 'integer' })
  price: number;

  @Column({ name: 'discount_percentage', type: 'integer', default: 0 })
  discountPercentage: number;

  @Column({ name: 'is_offer', type: 'boolean', default: false })
  isOffer: boolean;

  @Column({ name: 'duration_hours', type: 'integer' })
  durationHours: number;

  @Column({ type: 'boolean', default: true })
  available: boolean;

  @Column({ type: 'varchar', length: 200, nullable: true })
  benefit: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => UserInventory, (inventory) => inventory.item)
  inventoryEntries: UserInventory[];
}
