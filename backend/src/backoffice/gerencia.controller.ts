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
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { trofeosPorArea } from '../badges/badges.catalogo';
import {
  IsBoolean,
  IsEmail,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  IsIn,
  Matches,
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
import {
  FamiliaBeneficio,
  NivelEsfuerzo,
  NivelTri,
  PerfilConexion,
  RolMembership,
  TipoNotificacion,
} from '../common/enums';
import { EconomyService } from '../economy/economy.service';
import { Area, Invitation, Membership } from '../identity/identity.entities';
import {
  normalizarEmail,
  nuevoTokenInvitacion,
  vencimientoInvitacion,
} from '../identity/invitations.util';
import { BenefitCatalogItem, BenefitPriceVersion, PartnerOffer } from '../benefits/benefits.entities';
import { NotificationsService } from '../notifications/notifications.service';
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
  /**
   * 19/09 — color de la marca del area. `null` explicito = volver al color
   * derivado de la posicion. El patron se valida aqui y no con un CHECK en la
   * base: ver la migracion `ColorDeArea`.
   */
  @ValidateIf((o) => o.color !== null)
  @IsOptional()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'El color debe ser #rrggbb' })
  color?: string | null;
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
  /** Obligatorio salvo en `aliados`, donde viene de la oferta de Levelop. */
  @IsOptional() @IsString() @MinLength(2) nombre?: string;
  @IsOptional() @IsString() descripcion?: string;
  @IsInt() @Min(1) precioOro!: number;
  /** 17/09: cupos por mes; ausente o null = sin límite. */
  @IsOptional() @IsInt() @Min(1) cuposMensuales?: number | null;
  /** 17/09: solo para `aliados` — la oferta de Levelop de la que nace el ítem. */
  @IsOptional() @IsUUID() partnerOfferId?: string;
  /** 17/09 (tarde): nivel mínimo para canjear; ausente o null = para todos. */
  @IsOptional() @IsInt() @Min(1) nivelMinimo?: number | null;
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

class ActualizarActivoDto {
  @IsBoolean() activo!: boolean;
}

class ActualizarCuposDto {
  /** null = sin límite. */
  @ValidateIf((o) => o.cuposMensuales !== null) @IsInt() @Min(1) cuposMensuales!: number | null;
}

class ActualizarZonasDto {
  /** Lista vacía = disponible en todas las zonas. */
  @IsArray() @IsString({ each: true }) @MaxLength(60, { each: true }) zonas!: string[];
}

class ActualizarConfigCanjesDto {
  /** 0 = los canjes confirmados no vencen. */
  @IsInt() @Min(0) diasParaUsarCanje!: number;
}

class ActualizarNivelDto {
  /** null = sin restricción de nivel. */
  @ValidateIf((o) => o.nivelMinimo !== null) @IsInt() @Min(1) nivelMinimo!: number | null;
}

class FiltroCanjesDto {
  @IsOptional() @IsIn(['dia', 'semana', 'mes', 'anio']) rango?: 'dia' | 'semana' | 'mes' | 'anio';
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
  constructor(
    @InjectDataSource(PerfilConexion.BACKOFFICE) private readonly ds: DataSource,
    private readonly notificaciones: NotificationsService,
    private readonly economia: EconomyService,
  ) {}

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

  /**
   * 24/09 — «Trofeos y medallas de equipo» (LVL-060 v2 §3): los trofeos que
   * ganó cada área. Son del área, no de nadie, y ya vienen con el piso de 4.
   * Las medallas PERSONALES no están acá ni pueden estar: este rol no tiene
   * SELECT sobre `member_badges` (R-07).
   */
  @Get('trofeos')
  async trofeos(@CurrentMembership() m: Membership) {
    return trofeosPorArea(this.ds, m.tenantId, null);
  }

  @Get('catalog')
  async catalogo(@CurrentMembership() m: Membership) {
    // 17/09: con los cupos del mes en curso, para que gerencia vea "8/12
    // disponibles" sin abrir otra pantalla. Sin fila del mes = todos quedan.
    return this.ds.query(
      `SELECT i.*,
              CASE
                WHEN s.id IS NOT NULL THEN GREATEST(0, s."cuposTotales" - s."cuposReservados" - s."cuposConsumidos")
                WHEN i."cuposMensuales" IS NOT NULL THEN i."cuposMensuales"
                ELSE NULL
              END AS "cuposDisponibles",
              CASE WHEN s.id IS NOT NULL THEN s."cuposTotales" ELSE i."cuposMensuales" END AS "cuposTotales",
              COALESCE(s."cuposReservados", 0)::int AS "cuposReservados",
              COALESCE(s."cuposConsumidos", 0)::int AS "cuposConsumidos"
         FROM benefit_catalog_items i
    LEFT JOIN benefit_stock s
           ON s."itemId" = i.id AND now() BETWEEN s."periodoInicio" AND s."periodoFin"
        WHERE i."tenantId" = $1
     ORDER BY i.familia, i.nombre`,
      [m.tenantId],
    );
  }

  @Post('catalog')
  async crearItem(@CurrentMembership() m: Membership, @Body() dto: CrearItemCatalogoDto) {
    const repo = this.ds.getRepository(BenefitCatalogItem);

    // 17/09 — Aliados: nombre y descripción vienen de la oferta de Levelop,
    // gerencia solo elige cuál activar (y a qué precio en Oro).
    let nombre = dto.nombre?.trim() ?? '';
    let descripcion = dto.descripcion ?? null;
    let zonas: string[] = [];
    let partnerOfferId: string | null = null;
    if (dto.familia === FamiliaBeneficio.ALIADOS) {
      if (!dto.partnerOfferId) throw new BadRequestException('Un beneficio de aliados nace de una oferta de Levelop');
      const oferta = await this.ds.getRepository(PartnerOffer).findOne({ where: { id: dto.partnerOfferId, activo: true } });
      if (!oferta) throw new NotFoundException('Esa oferta de aliado no existe o ya no está activa');
      const repetido = await repo.findOne({ where: { tenantId: m.tenantId, partnerOfferId: oferta.id } });
      if (repetido) throw new BadRequestException({ motivoRechazo: 'ALIADO_YA_ACTIVADO' });
      nombre = oferta.nombre;
      descripcion = oferta.descripcion;
      zonas = oferta.zonas;
      partnerOfferId = oferta.id;
    } else if (nombre.length < 2) {
      throw new BadRequestException('Falta el nombre (mínimo 2 caracteres)');
    }

    const item = await repo.save(
      repo.create({
        tenantId: m.tenantId,
        familia: dto.familia,
        nombre,
        descripcion,
        precioOro: dto.precioOro,
        requiereAprobacion: dto.requiereAprobacion ?? true,
        cuposMensuales: dto.cuposMensuales ?? null,
        nivelMinimo: dto.nivelMinimo ?? null,
        partnerOfferId,
        zonas,
        activo: true,
      }),
    );

    // 17/09 (pedido de Alim): "cuando se suba un nuevo beneficio debe salir
    // una notificación para los usuarios". Un aviso por membresía activa,
    // mejor esfuerzo. Va por la conexión `app` del servicio de avisos (la de
    // gerencia no escribe en `notifications`, y no hace falta que lo haga).
    try {
      const gente: Array<{ id: string }> = await this.ds.query(
        `SELECT id FROM memberships WHERE "tenantId" = $1 AND activo`,
        [m.tenantId],
      );
      const mgr = this.notificaciones.manager;
      for (const g of gente) {
        await this.notificaciones.emitir(mgr, {
          tenantId: m.tenantId,
          membershipId: g.id,
          tipo: TipoNotificacion.BENEFICIO_NUEVO,
          mensaje: `Nuevo en la Tienda: ${item.nombre} — ${item.precioOro} de Oro`,
          refTipo: 'catalog_item',
          refId: item.id,
        });
      }
    } catch (e) { /* best-effort */ }

    return item;
  }

  /** 17/09: prender/apagar un beneficio. Apagado = sale de la Tienda (el catálogo del empleado filtra `activo`). */
  @Patch('catalog/:id/activo')
  async cambiarActivo(
    @CurrentMembership() m: Membership,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarActivoDto,
  ) {
    const repo = this.ds.getRepository(BenefitCatalogItem);
    const item = await repo.findOne({ where: { id, tenantId: m.tenantId } });
    if (!item) throw new NotFoundException('Ítem no encontrado');
    item.activo = dto.activo;
    return repo.save(item);
  }

  /**
   * 17/09: cupos por mes ("agregar un máximo o disponibilidad"). Guarda el
   * valor en el ítem y, si ya existe la fila de este mes, la ajusta también —
   * sin bajar por debajo de lo ya reservado+consumido (la CHECK de la base lo
   * impediría igual; aquí se explica en vez de fallar). null = sin límite.
   */
  @Put('catalog/:id/cupos')
  async cambiarCupos(
    @CurrentMembership() m: Membership,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarCuposDto,
  ) {
    return this.ds.transaction(async (tx) => {
      const item = await tx.findOne(BenefitCatalogItem, { where: { id, tenantId: m.tenantId } });
      if (!item) throw new NotFoundException('Ítem no encontrado');
      item.cuposMensuales = dto.cuposMensuales;
      await tx.save(item);
      if (dto.cuposMensuales !== null) {
        const usados = await tx.query(
          `SELECT ("cuposReservados" + "cuposConsumidos")::int AS usados FROM benefit_stock
            WHERE "itemId" = $1 AND now() BETWEEN "periodoInicio" AND "periodoFin" LIMIT 1`,
          [id],
        );
        if (usados.length && usados[0].usados > dto.cuposMensuales) {
          throw new BadRequestException(
            `Este mes ya se usaron ${usados[0].usados} cupos; el máximo no puede ser menor que eso hasta el mes que viene`,
          );
        }
        await tx.query(
          `INSERT INTO benefit_stock ("tenantId", "itemId", "cuposTotales", "cuposReservados", "cuposConsumidos", "periodoInicio", "periodoFin")
           VALUES ($1, $2, $3, 0, 0, date_trunc('month', now()), date_trunc('month', now()) + interval '1 month' - interval '1 second')
           ON CONFLICT ("itemId", "periodoInicio") DO UPDATE SET "cuposTotales" = EXCLUDED."cuposTotales", "updatedAt" = now()`,
          [m.tenantId, id, dto.cuposMensuales],
        );
        // Si había una fila vigente de otro período (p. ej. la del script demo,
        // que no arranca el día 1), también se ajusta.
        await tx.query(
          `UPDATE benefit_stock SET "cuposTotales" = $2, "updatedAt" = now()
            WHERE "itemId" = $1 AND now() BETWEEN "periodoInicio" AND "periodoFin"`,
          [id, dto.cuposMensuales],
        );
      }
      return item;
    });
  }

  /**
   * 17/09 (tarde) — desde qué nivel se puede canjear un ítem. null = para todos.
   *
   * No valida contra un nivel máximo porque no existe uno: la fórmula de nivel
   * es una potencia sin techo. Sí es responsabilidad de la pantalla mostrar la
   * tabla de `GET niveles` al lado, para que nadie ponga "nivel 9" sin saber
   * que son ~110 misiones.
   */
  @Put('catalog/:id/nivel')
  async cambiarNivel(
    @CurrentMembership() m: Membership,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarNivelDto,
  ) {
    const repo = this.ds.getRepository(BenefitCatalogItem);
    const item = await repo.findOne({ where: { id, tenantId: m.tenantId } });
    if (!item) throw new NotFoundException('Ítem no encontrado');
    item.nivelMinimo = dto.nivelMinimo;
    return repo.save(item);
  }

  /**
   * La escalera de niveles del tenant, traducida a algo que se pueda decidir.
   *
   * Gerencia no tiene por qué saber qué es `nivelBase × N^nivelExponente`. Lo
   * que necesita para elegir desde qué nivel abrir un beneficio es cuántas
   * misiones hay que cerrar para llegar ahí, así que eso es lo que devuelve:
   * el umbral de XP y su equivalencia en misiones típicas (urgencia media,
   * importancia media, esfuerzo medio) según la configuración vigente. Si el
   * CFO cambia la fórmula, la tabla cambia sola y la recomendación con ella.
   *
   * `cuantaGente` no va aquí a propósito: sería "cuántas personas están en
   * nivel 3", un dato de desempeño agregado que gerencia ya tiene por área en
   * su propia sección, con el piso de 4. Repetirlo acá, junto a un control
   * que se aplica por persona, es el tipo de mezcla que R-07 existe para
   * evitar.
   */
  @Get('niveles')
  async niveles(@CurrentMembership() m: Membership) {
    const cfg = await this.economia.configDe(m.tenantId);
    const xpMisionTipica = this.economia.calcular(
      cfg,
      NivelTri.MEDIA,
      NivelTri.MEDIA,
      NivelEsfuerzo.MEDIO,
    ).xp;
    const filas = [];
    for (let n = 1; n <= 8; n++) {
      const xp = this.economia.umbralXp(cfg, n);
      filas.push({
        nivel: n,
        xpMinima: xp,
        misionesTipicas: xpMisionTipica > 0 ? Math.round(xp / xpMisionTipica) : null,
      });
    }
    return { xpMisionTipica, niveles: filas };
  }

  /**
   * 19/09 (CAMBIOS 1.1 · Tienda 2) — las zonas que existen DE VERDAD en la
   * empresa: las de sus colaboradores activos, con cuánta gente hay en cada una.
   *
   * Alim pidió que al elegir zonas para un beneficio aparezcan «únicamente las
   * zonas con colaboradores activos para así evitar confusiones», y tenía razón
   * por una razón que va más allá de la confusión: una zona sin gente no es una
   * opción rara, es una opción que garantiza que nadie pueda canjear ese
   * beneficio. Ofrecerla es ofrecer una forma de equivocarse.
   *
   * Sale de `memberships`, no de una tabla de zonas, porque no existe tal tabla:
   * la zona es un texto por membresía que fija RRHH. Eso significa que
   * «Maracaibo» y «maracaibo» son dos zonas distintas — lo agrupo por el texto
   * tal cual, sin normalizar, porque normalizar acá escondería un problema de
   * datos en vez de mostrarlo.
   */
  @Get('zonas')
  async zonas(@CurrentMembership() m: Membership) {
    return this.ds.query(
      `SELECT zona, count(*)::int AS personas
         FROM memberships
        WHERE "tenantId" = $1 AND activo AND zona IS NOT NULL AND zona <> ''
     GROUP BY zona
     ORDER BY personas DESC, zona ASC`,
      [m.tenantId],
    );
  }

  /**
   * 19/09 — en qué zonas se puede canjear un ítem. Lista vacía = todas.
   *
   * No valido que las zonas existan contra la lista de arriba, y es a
   * propósito: una empresa puede querer dejar preparado un beneficio para una
   * sucursal que abre el mes que viene. Lo que sí hace la pantalla es ofrecer
   * solo las que tienen gente, que es donde se evita el error real.
   */
  @Put('catalog/:id/zonas')
  async cambiarZonas(
    @CurrentMembership() m: Membership,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarZonasDto,
  ) {
    const repo = this.ds.getRepository(BenefitCatalogItem);
    const item = await repo.findOne({ where: { id, tenantId: m.tenantId } });
    if (!item) throw new NotFoundException('Ítem no encontrado');
    item.zonas = [...new Set(dto.zonas.map((z) => z.trim()).filter(Boolean))];
    return repo.save(item);
  }

  /**
   * 19/09 — el plazo para usar un canje confirmado. Ver la migración
   * `VencimientoDeCanjes` sobre por qué este concepto no existía y qué reglas
   * trae. `0` apaga el vencimiento sin borrar el mecanismo.
   *
   * Escribe sobre la configuración VIGENTE en vez de crear una versión nueva.
   * `economy_config` está versionada para los números que afectan cuánto valió
   * el Oro que alguien ya ganó (multiplicadores, precios), donde reescribir la
   * historia sería falsear un saldo. Este plazo no es de esos: no cambia nada
   * de lo ya ganado, solo desde cuándo cuenta el reloj de aquí en adelante.
   */
  @Put('config/canjes')
  async configCanjes(@CurrentMembership() m: Membership, @Body() dto: ActualizarConfigCanjesDto) {
    const r = await this.ds.query(
      `UPDATE economy_config SET "diasParaUsarCanje" = $2
        WHERE "tenantId" = $1 AND "vigenteHasta" IS NULL
       RETURNING "diasParaUsarCanje"`,
      [m.tenantId, dto.diasParaUsarCanje],
    );
    if (!r?.length) throw new NotFoundException('Esta empresa todavía no tiene configuración económica');
    return { diasParaUsarCanje: r[0].diasParaUsarCanje };
  }

  @Get('config/canjes')
  async verConfigCanjes(@CurrentMembership() m: Membership) {
    const r = await this.ds.query(
      `SELECT "diasParaUsarCanje" FROM economy_config
        WHERE "tenantId" = $1 AND "vigenteHasta" IS NULL
     ORDER BY "vigenteDesde" DESC LIMIT 1`,
      [m.tenantId],
    );
    return { diasParaUsarCanje: r?.[0]?.diasParaUsarCanje ?? 30 };
  }

  /** 17/09: ofertas de aliados de Levelop disponibles para activar, con marca de cuáles ya están en el catálogo. */
  @Get('aliados')
  async aliados(@CurrentMembership() m: Membership) {
    return this.ds.query(
      `SELECT o.*, (i.id IS NOT NULL) AS "activada", i.id AS "itemId"
         FROM partner_offers o
    LEFT JOIN benefit_catalog_items i ON i."partnerOfferId" = o.id AND i."tenantId" = $1
        WHERE o.activo
     ORDER BY o.nombre`,
      [m.tenantId],
    );
  }

  /**
   * 17/09 (pedido de Alim): "Desempeño por área" con métricas que sí digan
   * algo a gerencia: promedio de días por tarea, tareas por día, % de
   * atrasos. Agregado por área sobre `missions` (sin nombres). Se respeta el
   * piso de 4 miembros activos del acuerdo del 03/09 (`mostrarDesempeno` de
   * `v_resumen_area`): un área de 2 personas identifica casi tan bien como el
   * nombre.
   */
  @Get('areas/metricas')
  async metricasAreas(@CurrentMembership() m: Membership) {
    return this.ds.query(
      `WITH cerradas AS (
         SELECT "areaId",
                count(*)::int AS cerradas_30d,
                AVG(EXTRACT(EPOCH FROM ("cerradaAt" - "createdAt")) / 86400.0)::numeric(10,1) AS dias_promedio,
                (count(*) FILTER (WHERE "fechaLimite" IS NOT NULL AND "cerradaAt" > "fechaLimite"))::int AS atrasadas_30d,
                (count(*) FILTER (WHERE "fechaLimite" IS NOT NULL))::int AS con_fecha_30d
           FROM missions
          WHERE "tenantId" = $1 AND estado = 'cerrada' AND "cerradaAt" > now() - interval '30 days'
          GROUP BY "areaId"
       ), abiertas AS (
         SELECT "areaId",
                count(*)::int AS abiertas,
                (count(*) FILTER (WHERE "fechaLimite" IS NOT NULL AND "fechaLimite" < now()))::int AS vencidas
           FROM missions
          WHERE "tenantId" = $1 AND estado NOT IN ('cerrada', 'cancelada')
          GROUP BY "areaId"
       )
       SELECT r."areaId", r."nombreArea", r."miembrosActivos", r."mostrarDesempeno",
              COALESCE(c.cerradas_30d, 0)                                   AS "cerradas30d",
              ROUND(COALESCE(c.cerradas_30d, 0) / 30.0, 2)                  AS "tareasPorDia",
              c.dias_promedio                                               AS "diasPromedioPorTarea",
              CASE WHEN COALESCE(c.con_fecha_30d, 0) > 0
                   THEN ROUND(100.0 * c.atrasadas_30d / c.con_fecha_30d, 0) ELSE NULL END AS "pctAtrasadas",
              COALESCE(a.abiertas, 0)                                       AS "abiertas",
              COALESCE(a.vencidas, 0)                                       AS "vencidasAbiertas"
         FROM v_resumen_area r
    LEFT JOIN cerradas c ON c."areaId" = r."areaId"
    LEFT JOIN abiertas a ON a."areaId" = r."areaId"
        WHERE r."tenantId" = $1
     ORDER BY r."nombreArea"`,
      [m.tenantId],
    );
  }

  /**
   * 17/09: canjes confirmados por categoría en un rango (día / semana / mes /
   * año), para el gráfico de torta. Sale de `v_canjes_diarios`: agregado, sin
   * identidad. Default: mes.
   */
  @Get('canjes')
  async canjesPorRango(@CurrentMembership() m: Membership, @Query() f: FiltroCanjesDto) {
    const intervalo = { dia: '1 day', semana: '7 days', mes: '30 days', anio: '365 days' }[f.rango ?? 'mes'];
    const filas = await this.ds.query(
      `SELECT familia, sum(total)::int AS total, sum(oro_total)::int AS "oroTotal"
         FROM v_canjes_diarios
        WHERE "tenantId" = $1 AND dia >= now() - $2::interval
        GROUP BY familia ORDER BY total DESC`,
      [m.tenantId, intervalo],
    );
    return { rango: f.rango ?? 'mes', categorias: filas };
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

  /**
   * 19/09 — además de las áreas, su `indice`: la posición estable del área
   * dentro de la empresa, por fecha de creación. Es lo que el frontend usa
   * para derivar el color cuando `color` está vacío, y por eso lo calcula el
   * servidor y no la pantalla: si cada superficie ordenara por su cuenta, dos
   * pantallas pintarían la misma área de dos colores distintos.
   */
  @Get('areas')
  async areas(@CurrentMembership() m: Membership) {
    return this.ds.query(
      `SELECT a.*, (row_number() OVER (ORDER BY a."createdAt", a.id) - 1)::int AS indice
         FROM areas a
        WHERE a."tenantId" = $1
     ORDER BY a."createdAt", a.id`,
      [m.tenantId],
    );
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
      if (dto.color !== undefined) area.color = dto.color;
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
