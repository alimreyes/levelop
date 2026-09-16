import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * El JWT prueba IDENTIDAD (quién es), nunca AUTORIZACIÓN (qué puede hacer).
 *
 * A propósito no meto rol ni areaId en el payload: esos datos viven en
 * `memberships` y cambian sin que el token expire (alguien asciende a líder,
 * alguien se desactiva). Si los pusiera en el JWT, un rol viejo seguiría siendo
 * válido hasta que el token expirara solo — un ascenso o una baja tardarían
 * hasta 15 minutos en tener efecto real. `TenantMembershipGuard` los resuelve
 * en cada request contra la base, que es barato y siempre está al día.
 */
export interface JwtPayload {
  sub: string; // userId o internalUserId
  email: string;
  tipo: 'usuario' | 'interno';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) throw new Error('Falta JWT_SECRET en el entorno');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // Passport adjunta lo que devuelva aquí a `req.user`. Sin roles, sin
    // membresías — eso lo agrega TenantMembershipGuard leyendo la base.
    return payload;
  }
}
