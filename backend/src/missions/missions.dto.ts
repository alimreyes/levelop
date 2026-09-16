import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { NivelEsfuerzo, NivelTri } from '../common/enums';

export class CrearMisionDto {
  @IsString()
  @MinLength(3)
  titulo!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsUUID()
  areaId?: string;

  @IsOptional()
  @IsEnum(NivelTri)
  urgencia?: NivelTri;

  @IsOptional()
  @IsEnum(NivelTri)
  importancia?: NivelTri;

  @IsOptional()
  @IsEnum(NivelEsfuerzo)
  esfuerzo?: NivelEsfuerzo;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fechaLimite?: Date;

  /**
   * "Mencionar al colaborador que debe tomar la misión" (pedido de Alim
   * 14/09). Es una SUGERENCIA, no una asignación forzada: la persona sigue
   * teniendo que aceptar explícitamente vía `POST :id/aceptar` para que la
   * misión pague Oro — no rompe el anti-cheat del §3.3 (creador ≠ quien
   * acepta). Cualquier membership puede sugerir a otra, no solo líderes:
   * un líder es una membership como cualquier otra en la app del empleado,
   * y restringir esto por rol no agrega nada que el propio flujo de
   * aceptación no proteja ya.
   */
  @IsOptional()
  @IsUUID()
  asignadoMembershipId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enlaces?: string[];
}

export class CerrarMisionDto {
  /**
   * Hora del cliente al momento de cerrar, para que el servicio pueda detectar
   * deriva de reloj (ver EconomyService.registrarMisionCerrada). Opcional: si
   * no llega, se usa la hora del servidor y no hay chequeo de deriva.
   */
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  clientOccurredAt?: Date;
}
