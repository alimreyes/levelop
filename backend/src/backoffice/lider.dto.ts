import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TipoInteraccionAyuda } from '../common/enums';

export class RegistrarInteraccionDto {
  @IsUUID()
  membershipId!: string;

  @IsEnum(TipoInteraccionAyuda)
  tipo!: TipoInteraccionAyuda;

  @IsOptional()
  @IsString()
  nota?: string;
}
