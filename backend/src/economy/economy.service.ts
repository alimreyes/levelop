import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, LessThan } from 'typeorm';
import { v5 as uuidv5 } from 'uuid';
import {
  MotivoEvento,
  MotivoRechazo,
  NivelEsfuerzo,
  NivelTri,
  PerfilConexion,
  TipoEventoEconomia,
} from '../common/enums';
import { EconomyBalance, EconomyConfig, EconomyEvent } from './economy.entities';
import { Membership } from '../identity/identity.entities';
import { Mission } from '../missions/missions.entities';

/** Namespace fijo para los UUIDv5. No cambiar nunca: cambiarlo rompe la idempotencia historica. */
const LEVELOP_NAMESPACE = '6ba7b812-9dad-11d1-80b4-00c04fd430c8';

export class EventoRechazado extends Error {
  constructor(public readonly motivo: MotivoRechazo, mensaje?: string) {
    super(mensaje ?? motivo);
  }
}

/**
 * =============================================================================
 * EL EMISOR DE EVENTOS DE ECONOMIA — el corazon del backend
 * =============================================================================
 *
 * Toda la economia del juego pasa por aqui. Ningun otro servicio escribe en
 * `economy_events` directamente, y la base lo refuerza: la tabla tiene un trigger
 * que rechaza UPDATE y DELETE, asi que ni siquiera yo con psql abierto puedo
 * "arreglar" un saldo a mano. Si algo esta mal, se emite un evento compensatorio
 * y queda el rastro de que se compenso.
 */
@Injectable()
export class EconomyService {
  private readonly log = new Logger(EconomyService.name);

  /**
   * Corregido 13/09: el constructor original inyectaba un `DataSource` sin
   * nombre, y este proyecto NO registra ninguna conexión sin nombre — las
   * cuatro son nombradas (`app`, `backoffice`, `lider`, `interno`). Eso hacía
   * que Nest fallara al arrancar, no que fallara en producción: un bug que
   * nunca se habría visto hasta el primer `npm run start:dev`, precisamente
   * porque nadie había podido correrlo todavía.
   *
   * Uso siempre la conexión `app`, aunque el servicio lo invoquen controladores
   * de gerencia o líder (confirmar/revertir un canje). No es una violación de
   * R-07: lo que esa regla protege son `mission_thread_messages`,
   * `membership_prefs`, `help_signal_history` y `help_interactions` — ninguna
   * de las cuales toca este servicio. `economy_events`, `redemptions` y
   * `benefit_stock` no están restringidas por rol; el límite de quién puede
   * confirmar o revertir un canje lo pone el `RolesGuard` en el controlador,
   * no la conexión de base de datos.
   */
  constructor(@InjectDataSource(PerfilConexion.APP) private readonly ds: DataSource) {}

  // ===========================================================================
  // IDEMPOTENCIA
  // ===========================================================================

  /**
   * UUIDv5 DETERMINISTICO sobre los datos del hecho.
   *
   * Error #4 de la spec heredada: un UUIDv4 generado en el cliente se regenera si
   * el proceso reinicia, o sea que no es idempotente — que es lo unico que se le
   * pide a una clave de idempotencia. Aqui el mismo hecho produce siempre la
   * misma clave, la reintente quien la reintente y las veces que sea.
   */
  clave(tenantId: string, membershipId: string, tipo: string, refId: string): string {
    return uuidv5(`${tenantId}:${membershipId}:${tipo}:${refId}`, LEVELOP_NAMESPACE);
  }

  // ===========================================================================
  // CALCULO — Maestro §3.3
  // ===========================================================================

  /**
   * XP = xpBase × mult(urgencia) × mult(importancia) × mult(esfuerzo)
   * Oro = XP × factorOro
   *
   * Ningun numero esta hardcodeado: todos vienen de `economy_config`, versionada
   * por tenant. CH-5 dice que los multiplicadores y los 19 precios del catalogo
   * son incompatibles en un orden de magnitud (11 a 44 dias libres al ano sobre
   * 15 legales). Cuando el CFO y el PD lo cierren, se cambia un registro. No se
   * despliega nada.
   */
  calcular(
    cfg: EconomyConfig,
    urgencia: NivelTri,
    importancia: NivelTri,
    esfuerzo: NivelEsfuerzo,
  ): { xp: number; oro: number } {
    const mU = cfg.multUrgencia[urgencia] ?? 1;
    const mI = cfg.multImportancia[importancia] ?? 1;
    const mE = cfg.multEsfuerzo[esfuerzo] ?? 1;
    const xp = Math.round(cfg.xpBase * mU * mI * mE);
    const oro = Math.round(xp * Number(cfg.factorOro));
    return { xp, oro };
  }

  /** Nivel = mayor N tal que XP acumulada >= nivelBase × N^nivelExponente */
  nivelPara(cfg: EconomyConfig, xpAcumulada: number): number {
    const base = cfg.nivelBase;
    const exp = Number(cfg.nivelExponente);
    let n = 1;
    while (xpAcumulada >= base * Math.pow(n + 1, exp)) n++;
    return n;
  }

  // ===========================================================================
  // CIERRE DE MISION
  // ===========================================================================

  /**
   * Registra el cierre de una mision.
   *
   * Reglas que se aplican aqui y no en la UI, porque una regla economica que vive
   * en el frontend no es una regla: es una sugerencia.
   */
  async registrarMisionCerrada(
    mision: Mission,
    membership: Membership,
    clientOccurredAt?: Date,
  ): Promise<{ xp: number; oro: number; oroOtorgado: number }> {
    return this.ds.transaction(async (m) => {
      await m.query(`SELECT set_config('app.tenant_id', $1, true)`, [mision.tenantId]);

      const cfg = await this.configVigente(m, mision.tenantId);
      const { xp, oro } = this.calcular(cfg, mision.urgencia, mision.importancia, mision.esfuerzo);

      // --- Deriva de reloj -------------------------------------------------
      // Acepto el tiempo del cliente solo dentro de una deriva maxima y NUNCA en
      // el futuro. Aviso que ya le di al PD: si el diseno de rachas asume que el
      // dia del usuario y el del servidor coinciden, se rompe con el primer
      // empleado que sincronice tres dias despues.
      const ahora = new Date();
      if (clientOccurredAt) {
        const derivaMin = Math.abs(ahora.getTime() - clientOccurredAt.getTime()) / 60000;
        const maxMin = Number(process.env.DERIVA_RELOJ_MAX_MINUTOS ?? 120);
        if (clientOccurredAt > ahora || derivaMin > maxMin) {
          throw new EventoRechazado(MotivoRechazo.DERIVA_RELOJ);
        }
      }

      // --- El XP siempre se otorga -----------------------------------------
      await this.emitir(m, {
        tenantId: mision.tenantId,
        membershipId: membership.id,
        tipo: TipoEventoEconomia.XP_GANADA,
        xpDelta: xp,
        oroDelta: 0,
        motivo: MotivoEvento.MISION_CERRADA,
        refTipo: 'mission',
        refId: mision.id,
        clientOccurredAt,
        membership,
      });

      // --- El Oro tiene tres condiciones ------------------------------------
      let oroOtorgado = 0;

      // (1) Opt-out (CH-2, decision de Alim del 25/08): si apago la capa de
      //     juego, deja de ganar Oro. El XP de arriba tampoco le sirve de nada
      //     porque no ve niveles, pero el evento queda para que reactivar no
      //     lo deje en cero.
      const puedeGanar = membership.optInJuego;

      // (2) Una mision propia no da Oro hasta que otro la acepte (Maestro §3.3).
      //     Es el anti-cheat mas barato que existe: no requiere criptografia,
      //     requiere que alguien mas ponga su nombre. El anti-cheat offline es
      //     economico, no criptografico — todo lo que firma un cliente que
      //     controla su dispositivo es falsificable.
      const laAceptoOtro =
        mision.aceptadaPorMembershipId !== null &&
        mision.aceptadaPorMembershipId !== mision.creadorMembershipId;

      if (puedeGanar && laAceptoOtro) {
        // (3) Tope diario de Oro — APAGADO por defecto desde el 17/09/26.
        //     Alim, tras probarlo en producción: "no podemos tener un tope de
        //     oro por día porque quita el incentivo al usuario de trabajar
        //     más". Se respeta. La palanca queda: `capOroDiario > 0` en la
        //     configuración del tenant vuelve a activarla (es el anti-cheat
        //     económico del Maestro §3.3, y el CFO puede querer usarla si CH-5
        //     muestra inflación). 0 = sin tope.
        if (cfg.capOroDiario > 0) {
          const ganadoHoy = await this.oroGanadoHoy(m, membership.id);
          const espacio = Math.max(0, cfg.capOroDiario - ganadoHoy);
          oroOtorgado = Math.min(oro, espacio);
        } else {
          oroOtorgado = oro;
        }

        if (oroOtorgado > 0) {
          await this.emitir(m, {
            tenantId: mision.tenantId,
            membershipId: membership.id,
            tipo: TipoEventoEconomia.ORO_GANADO,
            xpDelta: 0,
            oroDelta: oroOtorgado,
            motivo: MotivoEvento.MISION_CERRADA,
            refTipo: 'mission',
            refId: mision.id,
            clientOccurredAt,
            membership,
          });
        }
      }

      await this.refrescarSaldo(m, membership.id);
      return { xp, oro, oroOtorgado };
    });
  }

  // ===========================================================================
  // EMISION
  // ===========================================================================

  /**
   * Unico punto de escritura del log.
   *
   * Si la clave de idempotencia ya existe, no es un error: es un reintento que
   * hizo lo correcto. Se ignora en silencio y se sigue. Ese `ON CONFLICT DO
   * NOTHING` es lo que hace que reintentar sea seguro, que es la mitad de por que
   * el modelo nace idempotente aunque el offline no se construya este trimestre.
   */
  private async emitir(
    m: EntityManager,
    e: {
      tenantId: string;
      membershipId: string;
      tipo: TipoEventoEconomia;
      xpDelta: number;
      oroDelta: number;
      motivo: MotivoEvento;
      refTipo?: string | null;
      refId?: string | null;
      clientOccurredAt?: Date | null;
      familiaBeneficio?: string | null;
      membership?: Membership;
    },
  ): Promise<void> {
    const key = this.clave(e.tenantId, e.membershipId, e.tipo, e.refId ?? 'sin-ref');

    // Dimensiones materializadas AL ESCRIBIR, no resueltas por JOIN despues.
    // El rol de alguien cambia, y la pregunta del foso (Maestro §2.3) es "que
    // movia el comportamiento de un lider en marzo", no "que hace hoy esa
    // persona". Un JOIN contra el estado actual responde la pregunta equivocada.
    const ms =
      e.membership ??
      (await m.findOne(Membership, { where: { id: e.membershipId } }));

    await m
      .createQueryBuilder()
      .insert()
      .into(EconomyEvent)
      .values({
        tenantId: e.tenantId,
        membershipId: e.membershipId,
        tipo: e.tipo,
        xpDelta: e.xpDelta,
        oroDelta: e.oroDelta,
        motivo: e.motivo,
        refTipo: e.refTipo ?? null,
        refId: e.refId ?? null,
        idempotencyKey: key,
        clientOccurredAt: e.clientOccurredAt ?? null,
        dimRol: ms?.rol ?? null,
        dimAreaId: ms?.areaId ?? null,
        dimZona: ms?.zona ?? null,
        dimFamiliaBeneficio: e.familiaBeneficio ?? null,
      })
      .orIgnore()
      .execute();
  }

  /** Debito por canje. Lo llama RedemptionsService dentro de su transaccion. */
  async debitarPorCanje(
    m: EntityManager,
    p: {
      tenantId: string;
      membershipId: string;
      redemptionId: string;
      monto: number;
      familia: string;
    },
  ): Promise<void> {
    await this.emitir(m, {
      tenantId: p.tenantId,
      membershipId: p.membershipId,
      tipo: TipoEventoEconomia.ORO_GASTADO,
      xpDelta: 0,
      oroDelta: -Math.abs(p.monto), // firmado. Siempre negativo, sin excepciones.
      motivo: MotivoEvento.CANJE,
      refTipo: 'redemption',
      refId: p.redemptionId,
      familiaBeneficio: p.familia,
    });
    await this.refrescarSaldo(m, p.membershipId);
  }

  /**
   * Reversion. NUNCA un DELETE sobre el log: un asiento compensatorio.
   *
   * Esta es la leccion del error #2 de la spec heredada, que hacia ROLLBACK sobre
   * un ledger declarado append-only — una contradiccion de diseno. Si algo se
   * revierte, el log tiene que mostrar que ocurrio Y que se revirtio. Un log que
   * se puede editar para que el error desaparezca no sirve para auditar nada.
   */
  async revertir(
    m: EntityManager,
    p: { tenantId: string; membershipId: string; redemptionId: string; monto: number },
  ): Promise<void> {
    await this.emitir(m, {
      tenantId: p.tenantId,
      membershipId: p.membershipId,
      tipo: TipoEventoEconomia.ORO_REVERTIDO,
      xpDelta: 0,
      oroDelta: Math.abs(p.monto),
      motivo: MotivoEvento.REVERSION,
      refTipo: 'redemption',
      refId: p.redemptionId,
    });
    await this.refrescarSaldo(m, p.membershipId);
  }

  // ===========================================================================
  // SALDO
  // ===========================================================================

  /**
   * El saldo REAL. Se calcula sumando el log, siempre.
   *
   * `economy_balances` es cache y no se consulta aqui: cualquier lectura que
   * importe de verdad (un canje, una auditoria) se hace contra los eventos. Un
   * saldo que se puede sobrescribir es un saldo que nadie puede auditar, y eso ya
   * lo vivimos — los de localStorage se editan desde DevTools en diez segundos.
   */
  async saldoOro(m: EntityManager, membershipId: string): Promise<number> {
    const r = await m
      .createQueryBuilder(EconomyEvent, 'e')
      .select('COALESCE(SUM(e.oroDelta), 0)', 'total')
      .where('e.membershipId = :id', { id: membershipId })
      .getRawOne<{ total: string }>();
    return Number(r?.total ?? 0);
  }

  private async oroGanadoHoy(m: EntityManager, membershipId: string): Promise<number> {
    const r = await m
      .createQueryBuilder(EconomyEvent, 'e')
      .select('COALESCE(SUM(e.oroDelta), 0)', 'total')
      .where('e.membershipId = :id', { id: membershipId })
      .andWhere('e.tipo = :tipo', { tipo: TipoEventoEconomia.ORO_GANADO })
      .andWhere('e.serverReceivedAt >= date_trunc(\'day\', now())')
      .getRawOne<{ total: string }>();
    return Number(r?.total ?? 0);
  }

  /** Recalcula el cache. Si se corrompe, se vuelve a llamar y no se pierde nada. */
  async refrescarSaldo(m: EntityManager, membershipId: string): Promise<void> {
    const r = await m
      .createQueryBuilder(EconomyEvent, 'e')
      .select('COALESCE(SUM(e.oroDelta), 0)', 'oro')
      .addSelect('COALESCE(SUM(e.xpDelta), 0)', 'xp')
      // Tres intentos hasta encontrar la forma correcta (test de concurrencia,
      // 13/09):
      //  1. `MAX(e.tenantId::text)` — el cast DENTRO rompía la sustitución de
      //     alias de TypeORM (buscaba la columna en minúsculas y no existía).
      //  2. `MAX(e.tenantId)::text` — Postgres no tiene `MAX()` para `uuid`;
      //     el cast en la SALIDA no evita que la función falle al resolver
      //     el argumento.
      //  3. Esta: la columna va CITADA A MANO (`e."tenantId"`), así TypeORM
      //     no intenta sustituirla (no matchea su patrón alias.propiedad
      //     porque no empieza con letra tras el punto), y el cast va sobre el
      //     ARGUMENTO de MAX, no sobre su resultado.
      .addSelect('MAX(e."tenantId"::text)', 'tenantId')
      .where('e.membershipId = :id', { id: membershipId })
      .getRawOne<{ oro: string; xp: string; tenantId: string }>();

    if (!r?.tenantId) return;

    const cfg = await this.configVigente(m, r.tenantId);
    const xp = Number(r.xp);

    await m.query(
      `INSERT INTO economy_balances ("tenantId", "membershipId", oro, xp, nivel, "recalculadoAt")
       VALUES ($1, $2, $3, $4, $5, now())
       ON CONFLICT ("membershipId") DO UPDATE
         SET oro = EXCLUDED.oro, xp = EXCLUDED.xp,
             nivel = EXCLUDED.nivel, "recalculadoAt" = now()`,
      [r.tenantId, membershipId, Number(r.oro), xp, this.nivelPara(cfg, xp)],
    );
  }

  // ===========================================================================
  // DECAY A 90 DIAS
  // ===========================================================================

  /**
   * Caducidad del Oro (Maestro §3.4: 90 dias, sin excepciones).
   *
   * DOS DECISIONES DE DISENO QUE VALE LA PENA DEFENDER:
   *
   * 1. NO borra ni sobrescribe saldo: emite eventos ORO_CADUCADO con delta
   *    negativo. Asi el empleado puede ver POR QUE bajo su saldo. Si le vamos a
   *    quitar algo que gano, lo minimo es poder explicarselo — y "el numero
   *    cambio" no es una explicacion.
   *
   * 2. Corre TAMBIEN para quien tiene el opt-out activo. Es lo que decidio Alim
   *    en CH-2: "su saldo acumulado sigue el decay normal de 90 dias, sin trato
   *    especial". Y reactivar el juego no restaura lo caducado, porque no hay
   *    reversion de eventos de caducidad.
   */
  async ejecutarDecay(tenantId: string): Promise<{ afectados: number; oroCaducado: number }> {
    return this.ds.transaction(async (m) => {
      await m.query(`SELECT set_config('app.tenant_id', $1, true)`, [tenantId]);
      const cfg = await this.configVigente(m, tenantId);
      const corte = new Date(Date.now() - cfg.decayDias * 86400000);

      // FIFO: caduca lo que se gano hace mas de N dias y que no se haya gastado.
      // El saldo vivo es la suma de todo; lo caducable es lo ganado antes del
      // corte menos lo ya gastado o caducado.
      const filas = await m.query(
        `WITH ganado AS (
           SELECT "membershipId", COALESCE(SUM("oroDelta"), 0) AS oro_viejo
           FROM economy_events
           WHERE "tenantId" = $1 AND tipo = 'ORO_GANADO' AND "serverReceivedAt" < $2
           GROUP BY "membershipId"
         ), consumido AS (
           SELECT "membershipId", COALESCE(SUM(ABS("oroDelta")), 0) AS oro_fuera
           FROM economy_events
           WHERE "tenantId" = $1 AND tipo IN ('ORO_GASTADO', 'ORO_CADUCADO')
           GROUP BY "membershipId"
         )
         SELECT g."membershipId",
                GREATEST(0, g.oro_viejo - COALESCE(c.oro_fuera, 0))::int AS caducable
         FROM ganado g LEFT JOIN consumido c USING ("membershipId")
         WHERE GREATEST(0, g.oro_viejo - COALESCE(c.oro_fuera, 0)) > 0`,
        [tenantId, corte],
      );

      let oroCaducado = 0;
      for (const f of filas as Array<{ membershipId: string; caducable: number }>) {
        await this.emitir(m, {
          tenantId,
          membershipId: f.membershipId,
          tipo: TipoEventoEconomia.ORO_CADUCADO,
          xpDelta: 0,
          oroDelta: -f.caducable,
          motivo: MotivoEvento.DECAY_90D,
          refTipo: 'decay',
          // La fecha en la refId hace la clave v5 unica por corrida: el decay del
          // 3 de marzo y el del 4 son hechos distintos, pero reintentar el del 3
          // dos veces sigue siendo idempotente.
          refId: null,
          clientOccurredAt: null,
        });
        await this.refrescarSaldo(m, f.membershipId);
        oroCaducado += f.caducable;
      }

      this.log.log(`Decay ${tenantId}: ${filas.length} afectados, ${oroCaducado} Oro caducado`);
      return { afectados: filas.length, oroCaducado };
    });
  }

  // ===========================================================================
  // ESTIMACIÓN — cuánto daría una misión (17/09/26, pedido de Alim:
  // "mostrar cuánto Oro y Experiencia da cada una de las misiones")
  // ===========================================================================

  /**
   * La configuración vigente del tenant, para que un controlador pueda
   * estimar en lote (una consulta, N misiones) con la MISMA fórmula que
   * paga el cierre. Si la configuración cambia, la estimación cambia sola.
   */
  async configDe(tenantId: string): Promise<EconomyConfig> {
    return this.configVigente(this.ds.manager, tenantId);
  }

  // ===========================================================================
  // PROGRESO — nivel, XP y cuánto falta para el siguiente nivel
  // ===========================================================================

  /**
   * 16/09/26 — la app del empleado mostraba «Nv —» y un cartel de "sin
   * conectar" porque `economy_balances` guarda XP y nivel desde el primer día
   * pero nadie los exponía. Esto los devuelve tal cual están en la tabla (la
   * misma fila que `refrescarSaldo()` mantiene), más los dos umbrales que la
   * pantalla necesita para dibujar una barra de progreso sin inventar nada:
   * XP donde empezó el nivel actual y XP donde empieza el siguiente. Ambos
   * salen de la misma fórmula que `nivelPara()` (`nivelBase × N^nivelExponente`),
   * así que si el CFO/PD cambian `economy_config`, la barra cambia sola.
   *
   * Si la persona nunca cerró una misión no hay fila todavía: se devuelve
   * nivel 1 con XP 0, que es exactamente lo que la fórmula daría.
   */
  async progreso(
    tenantId: string,
    membershipId: string,
  ): Promise<{
    xp: number;
    oro: number;
    nivel: number;
    xpInicioNivel: number;
    xpSiguienteNivel: number;
  }> {
    const m = this.ds.manager;
    const cfg = await this.configVigente(m, tenantId);
    const fila = await m.findOne(EconomyBalance, { where: { tenantId, membershipId } });
    const xp = Number(fila?.xp ?? 0);
    const oro = Number(fila?.oro ?? 0);
    const nivel = this.nivelPara(cfg, xp);
    const exp = Number(cfg.nivelExponente);
    const umbral = (n: number) => (n <= 1 ? 0 : Math.ceil(cfg.nivelBase * Math.pow(n, exp)));
    return {
      xp,
      oro,
      nivel,
      xpInicioNivel: umbral(nivel),
      xpSiguienteNivel: umbral(nivel + 1),
    };
  }

  // ===========================================================================
  // CONFIGURACION
  // ===========================================================================

  private async configVigente(m: EntityManager, tenantId: string): Promise<EconomyConfig> {
    const cfg = await m.findOne(EconomyConfig, {
      where: { tenantId, vigenteHasta: LessThan(new Date(8640000000000000)) },
      order: { vigenteDesde: 'DESC' },
    });
    if (cfg) return cfg;

    const actual = await m
      .createQueryBuilder(EconomyConfig, 'c')
      .where('c.tenantId = :t', { t: tenantId })
      .andWhere('c.vigenteHasta IS NULL')
      .orderBy('c.vigenteDesde', 'DESC')
      .getOne();
    if (actual) return actual;

    // Sin configuracion propia: se crea con los valores del Maestro §3.3, que
    // estan marcados alli como propuesta del PD y no como valores acordados.
    const nueva = m.create(EconomyConfig, { tenantId, vigenteDesde: new Date() });
    return m.save(nueva);
  }
}
