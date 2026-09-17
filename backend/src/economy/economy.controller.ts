import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { IsBoolean, IsOptional } from 'class-validator';
import { DataSource } from 'typeorm';
import { CurrentMembership } from '../auth/current-membership.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantMembershipGuard } from '../auth/tenant-membership.guard';
import { PerfilConexion } from '../common/enums';
import { Membership, MembershipPrefs } from '../identity/identity.entities';
import { EconomyService } from './economy.service';

class ActualizarPrefsRankingDto {
  @IsOptional() @IsBoolean() verTablaCompleta?: boolean;
  @IsOptional() @IsBoolean() participaEnRanking?: boolean;
}

class CambiarJuegoDto {
  @IsBoolean() optInJuego!: boolean;
}

@Controller('tenants/:tenantId/economy')
@UseGuards(JwtAuthGuard, TenantMembershipGuard)
export class EconomyController {
  constructor(
    @InjectDataSource(PerfilConexion.APP) private readonly ds: DataSource,
    private readonly economy: EconomyService,
  ) {}

  /**
   * Saldo REAL, no el cache de `economy_balances` — mismo criterio que usa el
   * propio servicio para decidir si un canje puede pagarse. Un balance que se
   * pudiera desviar del log no serviría para nada.
   */
  @Get('saldo')
  async saldo(@CurrentMembership() m: Membership) {
    const oro = await this.economy.saldoOro(this.ds.manager, m.id);
    return { membershipId: m.id, oro };
  }

  /**
   * 16/09/26 — nivel, XP y umbrales del nivel. Ver `EconomyService.progreso()`.
   * Se devuelve aunque el juego esté apagado: la XP «solo sube y nunca baja»
   * (Maestro §3.3), apagar el juego no la borra, y la persona tiene derecho a
   * ver lo que ya ganó. Lo que sí deja de pasar con el juego apagado es
   * GANAR más (eso lo aplica `registrarMisionCerrada`, no esta ruta).
   */
  @Get('mi-progreso')
  async miProgreso(@CurrentMembership() m: Membership) {
    return this.economy.progreso(m.tenantId, m.id);
  }

  /**
   * 16/09/26 — R-03: "la participación gamificada es SIEMPRE opt-in". Hasta
   * hoy el interruptor de la app mostraba el valor real pero estaba
   * deshabilitado porque no existía esta ruta — un opt-out que no se puede
   * accionar no es un opt-out (reportado el 14/09 como la única función de
   * la lista que además incumplía una regla ratificada).
   *
   * Consecuencias de apagar (CH-2, decisión de Alim 25/08, ya construida en
   * `EconomyService`): deja de ganar Oro, el saldo sigue su decay normal de
   * 90 días, reactivar no restaura lo caducado. Aquí solo se cambia la
   * bandera y se registra cuándo; nada más. `optOutAt` queda en null al
   * volver a prender para que "desde cuándo está apagado" sea una sola
   * pregunta con una sola respuesta.
   */
  @Patch('juego')
  async cambiarJuego(@CurrentMembership() m: Membership, @Body() dto: CambiarJuegoDto) {
    const repo = this.ds.getRepository(Membership);
    const fila = await repo.findOneOrFail({ where: { id: m.id, tenantId: m.tenantId } });
    if (fila.optInJuego !== dto.optInJuego) {
      fila.optInJuego = dto.optInJuego;
      fila.optOutAt = dto.optInJuego ? null : new Date();
      await repo.save(fila);
    }
    return { membershipId: fila.id, optInJuego: fila.optInJuego, optOutAt: fila.optOutAt };
  }

  /**
   * Ranking — Maestro §4.3: "±3 por defecto, tabla completa opt-in". NO es
   * una superficie de gestión (eso es lo que R-07 restringe); es entre
   * pares, dentro de la app del empleado, y siempre respeta:
   *  - `optInJuego` de la membresía (R-03: apagar el juego apaga también las
   *    tablas — no es un chequeo nuevo, es la regla de CH-2 aplicada aquí).
   *  - `participaEnRanking` de sus prefs (14/09, pedido de Alim): opt-out
   *    granular — sigue jugando, no aparece en el ranking de nadie, y no ve
   *    ninguno tampoco.
   *  - `verTablaCompleta` de sus prefs: si es `false` (default), solo ve
   *    ±3 posiciones alrededor de la suya, no la tabla entera.
   */
  @Get('ranking')
  async ranking(@CurrentMembership() m: Membership, @Query('ambito') ambito?: string) {
    // 17/09: `?ambito=area` limita la tabla a la propia área (pedido de Alim:
    // "ver el Ranking tanto global como por área"). Mismas reglas de
    // participación; solo cambia el conjunto. Sin área asignada = global.
    const porArea = ambito === 'area' && !!m.areaId;
    const prefs = await this.ds
      .getRepository(MembershipPrefs)
      .findOne({ where: { membershipId: m.id } });

    // 16/09: la app necesita saber el estado de los dos interruptores para
    // dibujarlos — se devuelven junto con la tabla en vez de obligar a una
    // segunda llamada (y no existe un GET de prefs por separado).
    const prefsOut = {
      verTablaCompleta: prefs?.verTablaCompleta ?? false,
      participaEnRanking: prefs?.participaEnRanking ?? true,
      ambito: porArea ? 'area' : 'global',
      tieneArea: !!m.areaId,
    };

    if (!m.optInJuego || (prefs && prefs.participaEnRanking === false)) {
      return { participo: false, tabla: [], prefs: prefsOut };
    }

    const filas: Array<{
      membershipId: string;
      nombre: string;
      xp: number;
      oro: number;
      nivel: number;
      posicion: number;
    }> = await this.ds.query(
      `WITH base AS (
         SELECT mem.id AS "membershipId", u.nombre,
                COALESCE(eb.xp, 0)::int AS xp, COALESCE(eb.oro, 0)::int AS oro,
                COALESCE(eb.nivel, 1)::int AS nivel
           FROM memberships mem
           JOIN users u ON u.id = mem."userId"
           LEFT JOIN economy_balances eb ON eb."membershipId" = mem.id
           LEFT JOIN membership_prefs mp ON mp."membershipId" = mem.id
          WHERE mem."tenantId" = $1 AND mem.activo AND mem."optInJuego"
            AND COALESCE(mp."participaEnRanking", true)
            AND ($2::uuid IS NULL OR mem."areaId" = $2::uuid)
       )
       SELECT *, RANK() OVER (ORDER BY xp DESC)::int AS posicion FROM base
       ORDER BY posicion`,
      [m.tenantId, porArea ? m.areaId : null],
    );

    const miFila = filas.find((f) => f.membershipId === m.id);
    const verTablaCompleta = prefs?.verTablaCompleta ?? false;

    if (verTablaCompleta || !miFila) {
      return { participo: true, miPosicion: miFila?.posicion ?? null, tabla: filas, prefs: prefsOut };
    }

    // ±3 alrededor de la posición propia, ordenado por posición — el default
    // del Maestro §4.3, pensado para no exponer el fondo de la tabla a nadie
    // sin que lo pida explícitamente.
    const idx = filas.findIndex((f) => f.membershipId === m.id);
    const tabla = filas.slice(Math.max(0, idx - 3), idx + 4);
    return { participo: true, miPosicion: miFila.posicion, tabla, prefs: prefsOut };
  }

  @Patch('ranking/prefs')
  async actualizarPrefsRanking(
    @CurrentMembership() m: Membership,
    @Body() dto: ActualizarPrefsRankingDto,
  ) {
    const repo = this.ds.getRepository(MembershipPrefs);
    let prefs = await repo.findOne({ where: { membershipId: m.id } });
    if (!prefs) {
      prefs = repo.create({ membershipId: m.id, tenantId: m.tenantId });
    }
    if (dto.verTablaCompleta !== undefined) prefs.verTablaCompleta = dto.verTablaCompleta;
    if (dto.participaEnRanking !== undefined) prefs.participaEnRanking = dto.participaEnRanking;
    return repo.save(prefs);
  }
}
