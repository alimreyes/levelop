import { IsInt, IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class PurchaseItemDto {
  @IsInt()
  userId: number;

  @IsInt() // ✅ NUMBER
  itemId: number;

  @IsInt()
  durationHours: number;
}

export class EquipItemDto {
  @IsInt()
  userId: number;

  @IsInt() // ✅ NUMBER
  itemId: number;
}

export class UserInventoryResponseDto {
  id: number;
  userId: number;
  itemId: number; // ✅ NUMBER
  purchasedAt: Date;
  expiresAt: Date;
  isActive: boolean;
  isEquipped: boolean;
  item?: {
    id: number; // ✅ NUMBER
    name: string;
    description: string;
    category: string;
    icon: string;
    price: number;
    benefit: string;
  };
}
