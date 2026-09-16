import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService, TokensResponse } from './auth.service';
import { AceptarInvitacionDto, LoginDto, RefreshDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtPayload } from './jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /**
   * A qué empresas pertenece quien acaba de loguearse.
   *
   * Es el único endpoint que NO lleva `TenantMembershipGuard`, y no puede
   * llevarlo: la pregunta que responde es justamente cuál es el tenant. Se
   * protege con el JWT y filtra por el `sub` del token — nunca por un id que
   * mande el cliente.
   */
  @Get('mis-membresias')
  @UseGuards(JwtAuthGuard)
  misMembresias(@Req() req: { user: JwtPayload }): Promise<unknown[]> {
    if (req.user.tipo === 'interno') return Promise.resolve([]);
    return this.auth.misMembresias(req.user.sub);
  }

  @Post('login')
  login(@Body() dto: LoginDto): Promise<TokensResponse> {
    return this.auth.loginUsuario(dto.email, dto.password);
  }

  /** Login del equipo Levelop, nunca miembros de un tenant (ver InternalUser). */
  @Post('interno/login')
  loginInterno(@Body() dto: LoginDto): Promise<TokensResponse> {
    return this.auth.loginInterno(dto.email, dto.password);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto): Promise<TokensResponse> {
    return this.auth.refrescar(dto.refreshToken);
  }

  /**
   * INVITACIONES (16/09/26) — los dos únicos endpoints públicos además del
   * login. El token del path ES la credencial: no hay JWT porque la persona
   * todavía no tiene cuenta (o la tiene en otra empresa). Ver `Invitation`.
   */
  @Get('invitacion/:token')
  verInvitacion(@Param('token') token: string) {
    return this.auth.verInvitacion(token);
  }

  @Post('invitacion/:token/aceptar')
  aceptarInvitacion(@Param('token') token: string, @Body() dto: AceptarInvitacionDto) {
    return this.auth.aceptarInvitacion(token, dto);
  }
}
