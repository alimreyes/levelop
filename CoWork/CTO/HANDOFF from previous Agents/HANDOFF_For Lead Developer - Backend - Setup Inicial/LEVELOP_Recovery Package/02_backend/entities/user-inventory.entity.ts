import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ShopItem } from '../shop/shop-item.entity';

@Entity('user_inventory')
export class UserInventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'integer' })
  userId: number;

  @Column({ name: 'item_id', type: 'integer' }) // ✅ NUMBER (coincide con la BD)
  itemId: number;

  @Column({ name: 'purchased_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  purchasedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_equipped', type: 'boolean', default: false })
  isEquipped: boolean;

  @ManyToOne(() => ShopItem, (item) => item.inventoryEntries)
  @JoinColumn({ name: 'item_id' })
  item: ShopItem;
}
