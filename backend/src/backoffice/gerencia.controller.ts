import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { TenantMembershipGuard } from '../auth/tenant-membership.guard';
import { FamiliaBeneficio, PerfilConexion, RolMembership } from '../common/enums';
import { Area, Invitation, Membership } from '../identity/identity.entities';
import {
  normalizarEmail,
  nuevoTokenInvitacion,
  vencimientoInvitacion,
} from '../identity/invitations.util';
import { BenefitCatalogItem, BenefitPriceVersion } from '../benefits/benefits.entities';
import { CurrentMembership } from '../auth/current-membership.decorator';

// ---- Personas, áreas e invitaciones (16/09/26) ------------------------------

class CrearInvitacionDto {
  @IsEmail() email!: string;
  @IsOptional() @IsEnum(RolMembership) rol?: RolMembership;
  @IsOptional() @IsUUID() areaId?: string;
  @IsOptional() @IsString() @MinLength(2) @MaxLength(60) zona?: string;
}

class CrearAreaDto {
  @IsString() @MinLength(2) @MaxLength(80) nombre!: string;
}

class ActualizarAreaDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(80) nombre?: string;
  /** `null` explícito = quitar líder. Ausente = no tocar. */
  @ValidateIf((o) => o.liderMembershipId !== null)
  @IsOptional()
  @IsUUID()
  liderMembershipId?: string | null;
}

class ActualizarPersonaDto {
  @IsOptional() @IsEnum(RolMembership) rol?: RolMembership;
  @ValidateIf((o) => o.areaId !== null) @IsOptional() @IsUUID() areaId?: string | null;
  @IsOptional() @IsString() @MinLength(2) @MaxLength(60) zona?: string;
  @IsOptional() @IsBoolean() activo?: boolean;
}

class CrearItemCatalogoDto {
  @IsEnum(FamiliaBeneficio) familia!: FamiliaBeneficio;
  @IsString() @MinLength(2) nombre!: string;
  @IsOptional() @IsString() descripcion?: string;
  @IsInt() @Min(1) precioOro!: number;
  /**
   * Pedido de Alim 14/09: no todo canje necesita aprobación humana (un café
   * no, una reunión con gerencia sí). Default `true` (seguro) si no llega —
   * mismo default que la columna en la base.
   */
  @IsOptional() @IsBoolean() requiereAprobacion?: boolean;
}

class ActualizarPrecioDto {
  @IsInt() @Min(1) precioOro!: number;
}

class ActualizarAprobacionDto {
  @IsBoolean() requiereAprobacion!: boolean;
}

/**
 * BackOffice de gerencia. Conexión `backoffice` — la más restringida de las
 * cuatro (ver GRANTs de la migración inicial y R-07). Todo lo que este
 * controlador necesita y R-07 le prohíbe llega por vistas agregadas
 * (`v_gate_lanzamiento`, `v_canjes_agregados`, `v_resumen_area`), nunca por
 * tablas base con identidad.
 */
@Controller('tenants/:tenantId/backoffice')
@UseGuards(JwtAuthGuard, TenantMembershipGuard, RolesGuard)
@Roles(RolMembership.GERENCIA, RolMembership.ADMIN_TENANT)
export class GerenciaController {
  constructor(@InjectDataSource(PerfilConexion.BACKOFFICE) private readonly ds: DataSource) {}

  /**
   * El panel de inicio de gerencia: ¿lanzamos?, qué se canjea, cómo va cada
   * área — nada de esto tiene nombre de persona.
   */
  @Get('dashboard')
  async dashboard(@CurrentMembership() m: Membership) {
    const [gate, canjes, areas] = await Promise.all([
      this.ds.query(`SELECT * FROM v_gate_lanzamiento WHERE "tenantId" = $1`, [m.tenantId]),
      this.ds.query(
        `SELECT * FROM v_canjes_agregados WHERE "tenantId" = $1 ORDER BY mes DESC LIMIT 24`,
        [m.tenantId],
      ),
      this.ds.query(`SELECT * FROM v_resumen_area WHERE "tenantId" = $1`, [m.tenantId]),
    ]);
    return { gate: gate[0] ?? null, canjes, areas };
  }

  @Get('catalog')
  async catalogo(@CurrentMembership() m: Membership) {
    return this.ds.getRepository(BenefitCatalogItem).find({ where: { tenantId: m.tenantId } });
  }

  @Post('catalog')
  async crearItem(@CurrentMembership() m: Membership, @Body() dto: CrearItemCatalogoDto) {
    const repo = this.ds.getRepository(BenefitCatalogItem);
    const item = repo.create({
      tenantId: m.tenantId,
      familia: dto.familia,
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      precioOro: dto.precioOro,
      requiereAprobacion: dto.requiereAprobacion ?? true,
      zonas: [],
      activo: true,
    });
    return repo.save(item);
  }

  /**
   * Toggle de aprobación para un ítem ya existente — la "Café de cortesía"
   * de la primera prueba real (14/09) ya existía antes de este campo, con
   * el default seguro `true`. Este endpoint es cómo se pone en `false` sin
   * tener que borrar y recrear el ítem.
   */
  @Patch('catalog/:id/aprobacion')
  async cambiarAprobacion(
    @CurrentMembership() m: Membership,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarAprobacionDto,
  ) {
    const repo = this.ds.getRepository(BenefitCatalogItem);
    const item = await repo.findOne({ where: { id, tenantId: m.tenantId } });
    if (!item) throw new NotFoundException('Ítem no encontrado');
    item.requiereAprobacion = dto.requiereAprobacion;
    return repo.save(item);
  }

  /**
   * Cambiar el precio de un ítem (A-9, decisión de Alim del 25/08: el
   * dueño/gerente lo puede cambiar). Congela el precio anterior en
   * `benefit_price_versions` — el canje ya en curso sigue pagando el precio
   * que regía cuando la persona ganó su Oro (A-17), no el nuevo.
   */
  @Patch('catalog/:id/precio')
  async cambiarPrecio(
    @CurrentMembership() m: Membership,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarPrecioDto,
  ) {
    return this.ds.transaction(async (tx) => {
      const item = await tx.findOne(BenefitCatalogItem, { where: { id, tenantId: m.tenantId } });
      if (!item) throw new NotFoundException('Ítem no encontrado');

      await tx.query(
        `UPDATE benefit_price_versions SET "vigenteHasta" = now()
          WHERE "itemId" = $1 AND "vigenteHasta" IS NULL`,
        [id],
      );
      await tx.save(
        tx.create(BenefitPriceVersion, {
          tenantId: m.tenantId,
          itemId: id,
          precioOro: dto.precioOro,
          vigenteDesde: new Date(),
          creadoPorMembershipId: m.id,
        }),
      );
      item.precioOro = dto.precioOro;
      return tx.save(item);
    });
  }

  @Get('areas')
  async areas(@CurrentMembership() m: Membership) {
    return this.ds.getRepository(Area).find({ where: { tenantId: m.tenantId } });
  }

  // ===========================================================================
  // PERSONAS, ÁREAS E INVITACIONES (16/09/26) — administración, no evaluación
  // ---------------------------------------------------------------------------
  // Esta sección muestra NOMBRES en gerencia, y hay que decir por qué no rompe
  // R-07: R-07 prohíbe que una superficie de gestión muestre datos cuyo único
  // uso sea señalar a una persona — desempeño junto a identidad. Aquí no hay
  // un solo número de desempeño: es quién trabaja en la empresa, en qué área,
  // con qué rol, y a quién se invitó. Es lo que RRHH ya sabe por nómina. Las
  // vistas agregadas (`v_resumen_area`, etc.) siguen sin identidad. El rol de
  // Postgres lee `users` solo por columna (id, email, nombre) — ver migración
  // `InvitacionesYOnboarding`.
  // ===========================================================================

  /** Directorio administrativo: membresías + nombre/correo. Sin desempeño. */
  @Get('personas')
  async personas(@CurrentMembership() m: Membership) {
    return this.ds.query(
      `SELECT mem.id           AS "membershipId",
              u.nombre         AS "nombre",
              u.email          AS "email",
              mem.rol          AS "rol",
              mem."areaId"     AS "areaId",
              a.nombre         AS "areaNombre",
              mem.zona         AS "zona",
              mem.activo       AS "activo",
              mem."createdAt"  AS "desde"
         FROM memberships mem
         JOIN users u ON u.id = mem."userId"
    LEFT JOIN areas a ON a.id = mem."areaId"
        WHERE mem."tenantId" = $1
     ORDER BY mem.activo DESC, u.nombre ASC`,
      [m.tenantId],
    );
  }

  /**
   * Cambiar rol, área, zona o dar de baja (activo=false — nunca se borra: la
   * baja conserva el historial de esa persona en esa empresa).
   *
   * Dos cosas que gerencia NO puede hacerse a sí misma desde aquí: darse de
   * baja ni cambiarse el rol. No es paranoia: es la forma más fácil de dejar
   * una empresa sin nadie que pueda administrarla.
   */
  @Patch('personas/:membershipId')
  async actualizarPersona(
    @CurrentMembership() m: Membership,
    @Param('membershipId', ParseUUIDPipe) membershipId: string,
    @Body() dto: ActualizarPersonaDto,
  ) {
    const repo = this.ds.getRepository(Membership);
    const fila = await repo.findOne({ where: { id: membershipId, tenantId: m.tenantId } });
    if (!fila) throw new NotFoundException('Persona no encontrada en esta empresa');
    if (fila.id === m.id && (dto.activo === false || (dto.rol && dto.rol !== fila.rol))) {
      throw new BadRequestException('No puedes darte de baja ni cambiarte el rol a ti mismo');
    }
    if (dto.areaId) {
      const area = await this.ds.getRepository(Area).findOne({ where: { id: dto.areaId, tenantId: m.tenantId } });
      if (!area) throw new NotFoundException('Área no encontrada en esta empresa');
    }
    if (dto.rol !== undefined) fila.rol = dto.rol;
    if (dto.areaId !== undefined) fila.areaId = dto.areaId;
    if (dto.zona !== undefined) fila.zona = dto.zona;
    if (dto.activo !== undefined) fila.activo = dto.activo;
    return repo.save(fila);
  }

  @Post('areas')
  async crearArea(@CurrentMembership() m: Membership, @Body() dto: CrearAreaDto) {
    const repo = this.ds.getRepository(Area);
    return repo.save(repo.create({ tenantId: m.tenantId, nombre: dto.nombre.trim(), liderMembershipId: null }));
  }

  /**
   * Renombrar y/o asignar líder. Asignar líder hace DOS cosas en una
   * transacción: `areas.liderMembershipId` y la membresía de esa persona pasa
   * a `lider_area` + queda en esa área. Es exactamente lo que el 14/09 hubo
   * que hacer con dos scripts a mano (`set-area-lider.ts` + `set:rol`) para
   * probar el panel de líder — y lo que faltó una vez y produjo un 403.
   */
  @Patch('areas/:id')
  async actualizarArea(
    @CurrentMembership() m: Membership,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarAreaDto,
  ) {
    return this.ds.transaction(async (tx) => {
      const area = await tx.findOne(Area, { where: { id, tenantId: m.tenantId } });
      if (!area) throw new NotFoundException('Área no encontrada');
      if (dto.nombre !== undefined) area.nombre = dto.nombre.trim();
      if (dto.liderMembershipId !== undefined) {
        if (dto.liderMembershipId === null) {
          area.liderMembershipId = null;
        } else {
          const lider = await tx.findOne(Membership, {
            where: { id: dto.liderMembershipId, tenantId: m.tenantId, activo: true },
          });
          if (!lider) throw new NotFoundException('Esa persona no es miembro activo de la empresa');
          area.liderMembershipId = lider.id;
          if (lider.rol === RolMembership.EMPLEADO) lider.rol = RolMembership.LIDER_AREA;
          lider.areaId = area.id;
          await tx.save(lider);
        }
      }
      return tx.save(area);
    });
  }

  /** Invitaciones vivas y usadas del tenant, más nuevas primero. El token va porque gerencia necesita poder volver a copiar el link. */
  @Get('invitaciones')
  async invitaciones(@CurrentMembership() m: Membership) {
    return this.ds.query(
      `SELECT i.id, i.email, i.rol, i."areaId", a.nombre AS "areaNombre", i.zona, i.token,
              i."expiraAt", i."aceptadaAt", i."createdAt",
              (i."aceptadaAt" IS NULL AND i."expiraAt" > now()) AS "vigente"
         FROM invitations i
    LEFT JOIN areas a ON a.id = i."areaId"
        WHERE i."tenantId" = $1
     ORDER BY i."createdAt" DESC
        LIMIT 200`,
      [m.tenantId],
    );
  }

  /**
   * Invitar a una persona. Devuelve el token; el link lo arma el frontend con
   * su propio origen (`levelop-mvp.html?invitacion=TOKEN`) — el servidor no
   * sabe en qué dominio está servida la app. No se manda correo todavía: el
   * link se copia y se comparte por donde la empresa quiera (WhatsApp, mail).
   */
  @Post('invitaciones')
  async invitar(@CurrentMembership() m: Membership, @Body() dto: CrearInvitacionDto) {
    const email = normalizarEmail(dto.email);
    if (dto.areaId) {
      const area = await this.ds.getRepository(Area).findOne({ where: { id: dto.areaId, tenantId: m.tenantId } });
      if (!area) throw new NotFoundException('Área no encontrada en esta empresa');
    }
    // ¿Ya es miembro activo? Entonces no hace falta invitación.
    const yaMiembro = await this.ds.query(
      `SELECT 1 FROM memberships mem JOIN users u ON u.id = mem."userId"
        WHERE mem."tenantId" = $1 AND mem.activo AND u.email = $2 LIMIT 1`,
      [m.tenantId, email],
    );
    if (yaMiembro.length) throw new BadRequestException({ motivoRechazo: 'YA_ES_MIEMBRO' });

    const repo = this.ds.getRepository(Invitation);
    // Una invitación vigente por correo y tenant: si ya hay una, se devuelve
    // esa en vez de generar tokens de más.
    const vigente = await repo
      .createQueryBuilder('i')
      .where('i.tenantId = :t AND i.email = :e AND i.aceptadaAt IS NULL AND i.expiraAt > now()', {
        t: m.tenantId,
        e: email,
      })
      .getOne();
    if (vigente) return { ...vigente, reutilizada: true };

    return repo.save(
      repo.create({
        tenantId: m.tenantId,
        email,
        rol: dto.rol ?? RolMembership.EMPLEADO,
        areaId: dto.areaId ?? null,
        zona: dto.zona ?? null,
        token: nuevoTokenInvitacion(),
        creadaPorMembershipId: m.id,
        creadaPorInternalUserId: null,
        expiraAt: vencimientoInvitacion(),
        aceptadaAt: null,
        aceptadaMembershipId: null,
      }),
    );
  }

  /** Anular = vence ahora. No se borra: queda quién invitó a quién. */
  @Patch('invitaciones/:id/anular')
  async anularInvitacion(@CurrentMembership() m: Membership, @Param('id', ParseUUIDPipe) id: string) {
    const repo = this.ds.getRepository(Invitation);
    const inv = await repo.findOne({ where: { id, tenantId: m.tenantId } });
    if (!inv) throw new NotFoundException('Invitación no encontrada');
    if (inv.aceptadaAt) throw new BadRequestException('Esa invitación ya fue usada');
    inv.expiraAt = new Date();
    return repo.save(inv);
  }
}
