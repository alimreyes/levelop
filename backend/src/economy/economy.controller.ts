import { BadRequestException, Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { DataSource, In } from 'typeorm';
import { CurrentMembership } from '../auth/current-membership.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantMembershipGuard } from '../auth/tenant-membership.guard';
import { BenefitCatalogItem } from '../benefits/benefits.entities';
import { EstadoMision, PerfilConexion } from '../common/enums';
import { Membership, MembershipPrefs } from '../identity/identity.entities';
import { Mission } from '../missions/missions.entities';
import { EconomyService } from './economy.service';

class ActualizarPrefsRankingDto {
  @IsOptional() @IsBoolean() verTablaCompleta?: boolean;
  @IsOptional() @IsBoolean() participaEnRanking?: boolean;
}

class CambiarJuegoDto {
  @IsBoolean() optInJuego!: boolean;
}

/** `itemId: null` borra el objetivo. Uno a la vez, a propósito. */
class FijarObjetivoDto {
  @IsOptional() @IsUUID() itemId?: string | null;
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

  // ===========================================================================
  // LOTES DE ORO Y QUÉ SE VENCE (17/09/26, punto 6 de «Cosas para conectar»)
  // ===========================================================================

  /**
   * "Tenés 320. Se te vencen 40 el 21-09 y 90 el 03-10."
   *
   * La caducidad a 90 días existe desde el primer día (Maestro §3.4) y hasta
   * hoy la persona se enteraba de ella cuando el número bajaba. Avisar antes no
   * es una cortesía: es la diferencia entre una regla y una sorpresa.
   */
  @Get('lotes')
  async lotes(@CurrentMembership() m: Membership) {
    return this.economy.lotesDeOro(m.tenantId, m.id);
  }

  // ===========================================================================
  // OBJETIVO — "lo quiero" y cuánto falta (17/09/26, punto 9)
  // ===========================================================================

  /**
   * El beneficio que la persona marcó, cuánto le falta, y en cuántas misiones
   * como las que ya tiene abiertas lo alcanza.
   *
   * El promedio sale de SUS misiones abiertas reales pasadas por la misma
   * fórmula que paga el cierre, no de un número inventado ni de un promedio de
   * la empresa. Si no tiene ninguna abierta no hay estimación y se dice que no
   * la hay, en vez de rellenar con un valor plausible: un plan basado en una
   * cifra fabricada es peor que no dar plan.
   *
   * Solo lo ve la persona. `membership_prefs` no es legible por gerencia, líder
   * ni la vista interna — ver la nota en la entidad.
   */
  @Get('objetivo')
  async objetivo(@CurrentMembership() m: Membership) {
    const prefs = await this.ds
      .getRepository(MembershipPrefs)
      .findOne({ where: { membershipId: m.id } });
    if (!prefs?.objetivoItemId) return { objetivo: null };

    const item = await this.ds
      .getRepository(BenefitCatalogItem)
      .findOne({ where: { id: prefs.objetivoItemId, tenantId: m.tenantId } });
    if (!item) return { objetivo: null };

    const saldo = await this.economy.saldoOro(this.ds.manager, m.id);
    const faltante = Math.max(0, item.precioOro - saldo);

    // Misiones abiertas suyas: las que le asignaron, las que aceptó y las que
    // creó para sí misma. Solo estados vivos — una cerrada ya no va a pagar.
    const vivas = [EstadoMision.ABIERTA, EstadoMision.ACEPTADA, EstadoMision.EN_PROGRESO];
    const mias = await this.ds.getRepository(Mission).find({
      where: [
        { tenantId: m.tenantId, asignadoMembershipId: m.id, estado: In(vivas) },
        { tenantId: m.tenantId, aceptadaPorMembershipId: m.id, estado: In(vivas) },
      ],
      take: 100,
    });

    let oroPromedio: number | null = null;
    let misionesQueFaltan: number | null = null;
    if (mias.length > 0) {
      const cfg = await this.economy.configDe(m.tenantId);
      const total = mias.reduce(
        (a, mi) => a + this.economy.calcular(cfg, mi.urgencia, mi.importancia, mi.esfuerzo).oro,
        0,
      );
      oroPromedio = Math.round(total / mias.length);
      misionesQueFaltan =
        faltante === 0 ? 0 : oroPromedio > 0 ? Math.ceil(faltante / oroPromedio) : null;
    }

    return {
      objetivo: {
        itemId: item.id,
        nombre: item.nombre,
        familia: item.familia,
        precioOro: item.precioOro,
        saldo,
        faltante,
        oroPromedioPorMision: oroPromedio,
        misionesQueFaltan,
        misionesAbiertas: mias.length,
      },
    };
  }

  @Patch('objetivo')
  async fijarObjetivo(@CurrentMembership() m: Membership, @Body() dto: FijarObjetivoDto) {
    const repo = this.ds.getRepository(MembershipPrefs);
    let prefs = await repo.findOne({ where: { membershipId: m.id } });
    if (!prefs) prefs = repo.create({ membershipId: m.id, tenantId: m.tenantId });

    if (!dto.itemId) {
      prefs.objetivoItemId = null;
      await repo.save(prefs);
      return { objetivo: null };
    }

    // Se valida que el ítem exista, esté activo y sea de su zona. Marcar como
    // objetivo algo que nunca va a poder canjear es prometerle a alguien un
    // premio que no existe.
    const item = await this.ds
      .getRepository(BenefitCatalogItem)
      .findOne({ where: { id: dto.itemId, tenantId: m.tenantId } });
    if (!item || !item.activo) throw new BadRequestException({ motivoRechazo: 'ITEM_INACTIVO' });
    if (item.zonas.length > 0 && !item.zonas.includes(m.zona)) {
      throw new BadRequestException({ motivoRechazo: 'ZONA_NO_APLICA' });
    }

    prefs.objetivoItemId = item.id;
    await repo.save(prefs);
    return this.objetivo(m);
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
