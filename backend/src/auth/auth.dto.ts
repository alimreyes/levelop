import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class RefreshDto {
  @IsString()
  refreshToken!: string;
}

/**
 * Aceptar una invitación (16/09/26). Dos casos, mismo endpoint:
 *  - Correo NUEVO: `nombre` y `password` son obligatorios — se crea el usuario.
 *  - Correo que YA es usuario (trabaja en otra empresa cliente): `password` es
 *    su contraseña de siempre y se verifica; `nombre` se ignora. No se crea
 *    un segundo usuario: se agrega la membresía.
 * La validación de cuál caso aplica la hace el servicio contra la base.
 */
export class AceptarInvitacionDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nombre?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(200)
  password!: string;
}
