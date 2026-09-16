import { IsOptional, IsUUID } from 'class-validator';

export class SolicitarCanjeDto {
  @IsUUID()
  itemId!: string;

  /** Solo para reintentos explícitos del cliente offline; normalmente se omite. */
  @IsOptional()
  @IsUUID()
  idempotencyKeyCliente?: string;
}
