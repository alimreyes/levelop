import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { PerfilConexion } from '../common/enums';
import {
  Area,
  InternalUser,
  Invitation,
  Membership,
  Tenant,
  User,
} from '../identity/identity.entities';
import { JwtPayload } from './jwt.strategy';

export interface TokensResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * NOTA HONESTA, para que no se lea como terminado: los refresh tokens aquí son
 * JWT firmados con `tipo: 'refresh'`, sin tabla de sesiones detrás. Funcionan,
 * pero no se pueden revocar antes de que expiren (30 días por defecto). Si
 * hace falta poder cerrar sesión de verdad —por ejemplo, alguien pierde el
 * teléfono— hace falta una tabla `refresh_tokens` con estado. Lo dejo
 * pendiente a propósito en vez de fingir que ya está resuelto.
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectDataSource(PerfilConexion.APP) private readonly ds: DataSource,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async loginUsuario(email: string, password: string): Promise<TokensResponse> {
    const user = await this.ds
      .getRepository(User)
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.email = :email', { email })
      .getOne();

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.emitir({ sub: user.id, email: user.email, tipo: 'usuario' });
  }

  async loginInterno(email: string, password: string): Promise<TokensResponse> {
    const user = await this.ds
      .getRepository(InternalUser)
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.email = :email', { email })
      .getOne();

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.emitir({ sub: user.id, email: user.email, tipo: 'interno' });
  }

  /**
   * Las membresías activas de una persona, con el contexto que la app necesita
   * para pintarse.
   *
   * POR QUÉ EXISTE (14/09/26): `POST /auth/login` devuelve solo tokens, y eso
   * es correcto — el JWT prueba identidad, no autorización; el rol se resuelve
   * vivo contra la base en cada request y no se cachea en el token. Pero eso
   * dejaba al frontend sin forma de saber a qué tenant pertenece quien acaba
   * de loguearse, y la única alternativa era hardcodear el UUID del cliente
   * piloto dentro del HTML. Un UUID hardcodeado en un archivo que se va a
   * copiar cuatro veces (una por superficie) es una bomba de tiempo: el día
   * que entre el segundo cliente, alguien va a ver los datos del primero
   * porque nadie se acordó de cambiarlo.
   *
   * Este endpoint cuesta una consulta y elimina esa clase de error por
   * completo. De paso resuelve identidad (nombre, área, zona, rol, opt-in),
   * que el frontend tampoco tenía forma de obtener.
   *
   * Atraviesa tenants a propósito — es la única consulta del sistema que lo
   * hace, porque la pregunta misma es "¿a cuáles pertenece esta persona?".
   * Filtra por `userId` del JWT, nunca por un parámetro del cliente.
   */
  async misMembresias(userId: string): Promise<unknown[]> {
    return this.ds.query(
      `SELECT m.id            AS "membershipId",
              m."tenantId"    AS "tenantId",
              t.nombre        AS "tenantNombre",
              m.rol           AS "rol",
              m."areaId"      AS "areaId",
              a.nombre        AS "areaNombre",
              m.zona          AS "zona",
              m."optInJuego"  AS "optInJuego",
              u.nombre        AS "usuarioNombre",
              u.email         AS "email"
         FROM memberships m
         JOIN tenants t ON t.id = m."tenantId"
         JOIN users   u ON u.id = m."userId"
         LEFT JOIN areas a ON a.id = m."areaId"
        WHERE m."userId" = $1
          AND m.activo = true
        ORDER BY t.nombre ASC`,
      [userId],
    );
  }

  // ===========================================================================
  // INVITACIONES (16/09/26) — el único camino de alta. Ver `Invitation`.
  // ===========================================================================

  /**
   * Lo que la pantalla de "te invitaron" necesita mostrar ANTES de que la
   * persona escriba nada: a qué empresa, con qué rol, en qué área, si el link
   * sigue vivo, y si ese correo ya es usuario (para pedir contraseña de
   * siempre en vez de crear una). Es público: el token es la credencial.
   */
  async verInvitacion(token: string) {
    const inv = await this.ds.getRepository(Invitation).findOne({ where: { token } });
    if (!inv) throw new NotFoundException('Esta invitación no existe');
    const [tenant, area, usuario] = await Promise.all([
      this.ds.getRepository(Tenant).findOne({ where: { id: inv.tenantId } }),
      inv.areaId ? this.ds.getRepository(Area).findOne({ where: { id: inv.areaId } }) : null,
      this.ds.getRepository(User).findOne({ where: { email: inv.email } }),
    ]);
    return {
      email: inv.email,
      rol: inv.rol,
      tenantNombre: tenant?.nombre ?? null,
      areaNombre: area?.nombre ?? null,
      zona: inv.zona ?? tenant?.zonaDefault ?? null,
      expiraAt: inv.expiraAt,
      vencida: inv.expiraAt.getTime() < Date.now(),
      yaAceptada: !!inv.aceptadaAt,
      usuarioExiste: !!usuario,
    };
  }

  /**
   * Acepta la invitación y deja a la persona adentro: devuelve tokens como un
   * login normal, más el `tenantId` para que el frontend no tenga que llamar a
   * `mis-membresias` a ciegas.
   *
   * Todo en una transacción: crear el usuario (si hace falta), crear la
   * membresía, marcar la invitación como usada. Si algo falla a la mitad, no
   * queda un usuario sin membresía ni una invitación consumida sin membresía.
   *
   * Si ya existe una membresía activa de esa persona en ese tenant (llegó dos
   * veces con dos invitaciones distintas), no se duplica — la constraint
   * UNIQUE (tenant, user) lo impediría igual; aquí se explica en vez de fallar.
   */
  async aceptarInvitacion(
    token: string,
    dto: { nombre?: string; password: string },
  ): Promise<TokensResponse & { tenantId: string; membershipId: string }> {
    return this.ds.transaction(async (tx) => {
      const inv = await tx
        .getRepository(Invitation)
        .createQueryBuilder('i')
        .setLock('pessimistic_write')
        .where('i.token = :token', { token })
        .getOne();
      if (!inv) throw new NotFoundException('Esta invitación no existe');
      if (inv.aceptadaAt) throw new BadRequestException({ motivoRechazo: 'INVITACION_USADA' });
      if (inv.expiraAt.getTime() < Date.now()) {
        throw new BadRequestException({ motivoRechazo: 'INVITACION_VENCIDA' });
      }

      const tenant = await tx.getRepository(Tenant).findOne({ where: { id: inv.tenantId } });
      if (!tenant) throw new NotFoundException('La empresa de esta invitación ya no existe');

      let user = await tx
        .getRepository(User)
        .createQueryBuilder('u')
        .addSelect('u.passwordHash')
        .where('u.email = :email', { email: inv.email })
        .getOne();

      if (user) {
        // Persona que ya existe: su contraseña de siempre es la prueba de que
        // es ella y no alguien que interceptó el link.
        if (!(await bcrypt.compare(dto.password, user.passwordHash))) {
          throw new UnauthorizedException(
            'Ese correo ya tiene cuenta en Levelop: escribe la contraseña de esa cuenta',
          );
        }
      } else {
        if (!dto.nombre || dto.nombre.trim().length < 2) {
          throw new BadRequestException('Falta tu nombre');
        }
        const repoU = tx.getRepository(User);
        user = await repoU.save(
          repoU.create({
            email: inv.email,
            nombre: dto.nombre.trim(),
            passwordHash: await bcrypt.hash(dto.password, 10),
          }),
        );
      }

      const repoM = tx.getRepository(Membership);
      let membership = await repoM.findOne({ where: { tenantId: inv.tenantId, userId: user.id } });
      if (membership) {
        if (!membership.activo) {
          // Volvió a la empresa: se reactiva la misma membresía (conserva historial).
          membership.activo = true;
          membership.rol = inv.rol;
          membership.areaId = inv.areaId ?? membership.areaId;
          membership.zona = inv.zona ?? membership.zona;
          membership = await repoM.save(membership);
        }
        // Si ya estaba activa, no se toca: la invitación solo se consume.
      } else {
        membership = await repoM.save(
          repoM.create({
            tenantId: inv.tenantId,
            userId: user.id,
            rol: inv.rol,
            areaId: inv.areaId ?? null,
            zona: inv.zona ?? tenant.zonaDefault,
            activo: true,
            optInJuego: true,
          }),
        );
      }

      inv.aceptadaAt = new Date();
      inv.aceptadaMembershipId = membership.id;
      await tx.getRepository(Invitation).save(inv);

      return {
        ...this.emitir({ sub: user.id, email: user.email, tipo: 'usuario' }),
        tenantId: inv.tenantId,
        membershipId: membership.id,
      };
    });
  }

  async refrescar(refreshToken: string): Promise<TokensResponse> {
    let payload: JwtPayload & { tipo: string };
    try {
      payload = this.jwt.verify(refreshToken, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
    return this.emitir({ sub: payload.sub, email: payload.email, tipo: payload.tipo as any });
  }

  private emitir(payload: JwtPayload): TokensResponse {
    const secret = this.config.get<string>('JWT_SECRET');
    return {
      accessToken: this.jwt.sign(payload, {
        secret,
        expiresIn: this.config.get<string>('JWT_EXPIRES_IN') ?? '15m',
      }),
      refreshToken: this.jwt.sign(payload, {
        secret,
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '30d',
      }),
    };
  }
}
