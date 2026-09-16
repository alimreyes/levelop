import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v5 as uuidv5 } from 'uuid';
import {
  EstadoCanje,
  MotivoRechazo,
  PerfilConexion,
  ProviderCanje,
  TipoNotificacion,
} from '../common/enums';
import { EconomyService } from '../economy/economy.service';
import { Membership } from '../identity/identity.entities';
import { NotificationsService } from '../notifications/notifications.service';
import { BenefitCatalogItem, Redemption } from './benefits.entities';

const LEVELOP_NAMESPACE = '6ba7b812-9dad-11d1-80b4-00c04fd430c8';

export interface ResultadoCanje {
  ok: boolean;
  redemptionId?: string;
  motivo?: MotivoRechazo;
  saldoRestante?: number;
}

export class CanjeNoEncontradoError extends Error {
  constructor() {
    super('Canje no encontrado');
  }
}

/**
 * La transición pedida no aplica al estado actual del canje — confirmar algo
 * que no está RESERVADO, o revertir algo que nunca reservó cupo. No es un
 * error del sistema: es información que el controlador debe traducir a un
 * 400, no tragarse en silencio como hacían `confirmar()`/`revertir()` antes
 * del 14/09 (ver comentarios en ambos métodos).
 */
export class TransicionInvalidaError extends Error {}

/**
 * =============================================================================
 * CANJE — la maquina de estados
 * =============================================================================
 *
 * Este servicio existe en la forma que tiene por la auditoria que le hice a la
 * spec de Cashea el 06/08. Los tres errores que evita, explicitos:
 *
 *  1. La spec mantenia una transaccion de Postgres ABIERTA mientras llamaba a una
 *     API externa con 3 reintentos. Sostiene locks de fila durante segundos,
 *     agota el pool de conexiones y hace ROLLBACK sobre un log declarado
 *     append-only. Aqui: ninguna llamada externa ocurre dentro de la transaccion.
 *
 *  2. La spec debitaba primero y reservaba despues. Al reves. Si el cupo se agota
 *     en carrera, ya le quitaste el Oro a alguien por algo que no va a recibir.
 *     Aqui: se reserva el cupo primero, y si no hay, el Oro nunca se toca.
 *
 *  3. La spec trataba el timeout como fallo y devolvia el Oro. Si el tercero SI
 *     entrego, acabamos de emitir valor gratis. Por eso existe INDETERMINADO, y
 *     por eso existe la reconciliacion — aunque hoy, con provider MANUAL, ninguno
 *     de los dos se use nunca. El dia que exista un provider real, ya esta.
 */
@Injectable()
export class RedemptionsService {
  private readonly log = new Logger(RedemptionsService.name);

  /** Mismo arreglo y misma razón que en `EconomyService` — ver su constructor. */
  constructor(
    @InjectDataSource(PerfilConexion.APP) private readonly ds: DataSource,
    private readonly economy: EconomyService,
    private readonly notificaciones: NotificationsService,
  ) {}

  /**
   * Solicitar un canje.
   *
   * ORDEN DE OPERACIONES — este orden es la spec, no una preferencia de estilo:
   *   1. Validar todo lo barato, sin tocar nada
   *   2. Reservar el cupo (atomico, sin lock largo)
   *   3. Debitar el Oro
   *   4. Marcar RESERVADO
   *   ── 2, 3 y 4 en UNA transaccion corta, sin llamadas externas dentro ──
   *   5. Fuera de la transaccion: el provider entrega
   */
  async solicitar(p: {
    membership: Membership;
    itemId: string;
    idempotencyKeyCliente?: string;
  }): Promise<ResultadoCanje> {
    const { membership, itemId } = p;

    // La clave es determinista sobre (tenant, persona, item, dia). Si el cliente
    // reintenta —o si el usuario da doble clic, que es lo que pasa de verdad— se
    // resuelve al mismo canje en vez de crear dos.
    const dia = new Date().toISOString().slice(0, 10);
    const idem =
      p.idempotencyKeyCliente ??
      uuidv5(`${membership.tenantId}:${membership.id}:${itemId}:${dia}`, LEVELOP_NAMESPACE);

    return this.ds.transaction(async (m) => {
      await m.query(`SELECT set_config('app.tenant_id', $1, true)`, [membership.tenantId]);

      // --- 1 · Validaciones baratas, sin efectos secundarios ----------------

      // Reintento: si ya existe con esta clave, devuelvo el mismo canje. Un
      // reintento correcto no es un error.
      const yaExiste = await m.findOne(Redemption, {
        where: { tenantId: membership.tenantId, idempotencyKey: idem },
      });
      if (yaExiste) {
        return { ok: yaExiste.estado !== EstadoCanje.RECHAZADO, redemptionId: yaExiste.id };
      }

      if (!membership.optInJuego) {
        return this.rechazo(MotivoRechazo.OPT_OUT_ACTIVO);
      }

      const item = await m.findOne(BenefitCatalogItem, {
        where: { id: itemId, tenantId: membership.tenantId },
      });
      if (!item || !item.activo) {
        return this.rechazo(MotivoRechazo.ITEM_INACTIVO);
      }

      // Filtro por zona. Mostrarle a alguien de Maracaibo un gimnasio que solo
      // existe en Caracas es una burla; dejarselo canjear seria peor.
      if (item.zonas.length > 0 && !item.zonas.includes(membership.zona)) {
        return this.rechazo(MotivoRechazo.ZONA_NO_APLICA);
      }

      // --- Precio congelado (A-17, regla permanente) -------------------------
      // El precio no cambia sobre un saldo vivo. Se aplica el que regia cuando el
      // Oro fue ganado, no el de hoy. Como el Oro caduca a 90 dias y el precio se
      // congela 90 dias, son el mismo numero: el CFO ya lo habia notado y por eso
      // esto cuesta una consulta, no un subsistema.
      const precio = await this.precioCongelado(m, item, membership.id);

      const saldo = await this.economy.saldoOro(m, membership.id);
      if (saldo < precio) {
        return this.rechazo(MotivoRechazo.SALDO_INSUFICIENTE);
      }

      // --- 2 · Reservar el cupo ---------------------------------------------
      // Atomico y sin lock largo. Si dos personas canjean el ultimo cupo al mismo
      // tiempo, una gana y la otra recibe CUPO_AGOTADO — el sexto estado de fallo
      // que agregue en la mesa del MVP y que sostengo que sera el mas frecuente
      // de todos. No es un caso borde: es un martes.
      // ⚠️ LEER ANTES DE TOCAR ESTA CONSULTA — bug encontrado el 13/09 por el
      // test de concurrencia, y es el que justifica que ese test exista.
      //
      // Esto estaba escrito como `m.query("UPDATE ... RETURNING id")` y luego
      // `if (reserva.length === 0) return CUPO_AGOTADO`. **Esa guarda nunca se
      // cumplia.** TypeORM, para un comando UPDATE, no devuelve las filas:
      // devuelve `[filas, cantidadAfectada]` — un array de DOS elementos,
      // siempre. Con cero filas afectadas, `reserva` valia `[[], 0]`, cuya
      // longitud es 2. Resultado: dos personas obtenian el mismo ultimo cupo,
      // ambas pagaban su Oro, y solo una reserva quedaba registrada.
      //
      // Lo unico que impidio una sobreventa real fue el CHECK de la base
      // (`ck_cupos_no_sobreventa`). El cinturon aguanto porque los tirantes
      // fallaron — y esa es exactamente la razon por la que la contencion vive
      // en la base y no solo en este archivo.
      //
      // El arreglo: envolver el UPDATE en un CTE para que el comando de nivel
      // superior sea un SELECT. Asi TypeORM devuelve las filas de verdad y
      // `.length` significa lo que aparenta significar.
      const reserva = await m.query(
        `WITH reserva AS (
           UPDATE benefit_stock
              SET "cuposReservados" = "cuposReservados" + 1, "updatedAt" = now()
            WHERE "itemId" = $1 AND "tenantId" = $2
              AND now() BETWEEN "periodoInicio" AND "periodoFin"
              AND "cuposReservados" + "cuposConsumidos" < "cuposTotales"
            RETURNING id
         )
         SELECT id FROM reserva`,
        [itemId, membership.tenantId],
      );
      if (!Array.isArray(reserva) || reserva.length === 0) {
        return this.rechazo(MotivoRechazo.CUPO_AGOTADO);
      }

      // --- 3 y 4 · Debitar y registrar ---------------------------------------
      const canje = await m.save(
        m.create(Redemption, {
          tenantId: membership.tenantId,
          membershipId: membership.id,
          itemId,
          precioOroAplicado: precio,
          estado: EstadoCanje.RESERVADO,
          provider: ProviderCanje.MANUAL,
          idempotencyKey: idem,
        }),
      );

      await this.economy.debitarPorCanje(m, {
        tenantId: membership.tenantId,
        membershipId: membership.id,
        redemptionId: canje.id,
        monto: precio,
        familia: item.familia,
      });

      // --- Auto-confirmación (pedido de Alim 14/09) --------------------------
      // No todo canje necesita que alguien lo apruebe: un café de cortesía se
      // entrega solo, una reunión con gerencia sí necesita confirmación humana
      // del otro lado. Si el ítem no la requiere, el canje pasa a CONFIRMADO
      // aquí mismo, en la misma transacción — no llamo al método público
      // `confirmar()` porque su `SELECT ... FOR UPDATE` está pensado para una
      // llamada HTTP separada, potencialmente en carrera con otra; aquí no
      // hace falta, el canje se acaba de crear en esta misma transacción y
      // nadie más lo conoce todavía.
      if (!item.requiereAprobacion) {
        canje.estado = EstadoCanje.CONFIRMADO;
        await m.save(canje);
        await m.query(
          `UPDATE benefit_stock
              SET "cuposReservados" = GREATEST(0, "cuposReservados" - 1),
                  "cuposConsumidos" = "cuposConsumidos" + 1, "updatedAt" = now()
            WHERE "itemId" = $1`,
          [itemId],
        );
      }

      // Outbox: hoy queda vacio porque MANUAL no llama a nadie. El patron nace
      // igual para que el dia que exista un provider real no haya que reescribir
      // esta transaccion, que es justo donde la spec heredada se rompia.
      // (Ninguna llamada externa aqui dentro. Ninguna. Nunca.)

      const saldoRestante = await this.economy.saldoOro(m, membership.id);
      return { ok: true, redemptionId: canje.id, saldoRestante };
    });
  }

  /**
   * Confirmar la entrega. `ManualFulfillment`: RRHH aprueba, entrega fuera de
   * banda y adjunta evidencia. Es el unico provider real y va a serlo por un buen
   * rato — el cobro y la entrega van a ser manuales y feos todo el trimestre, y
   * el CEO ya dijo que esta bien.
   *
   * ⚠️ ARREGLADO EL 14/09 — misma familia de bug que el de `solicitar()`
   * (`LVL-013`, tarea #17). El UPDATE original SÍ tenía la guarda de estado
   * (`AND estado = RESERVADO`), pero **nadie verificaba si esa guarda había
   * bloqueado algo**: el UPDATE de `benefit_stock` de abajo corría siempre,
   * sin condición. Confirmar dos veces el mismo canje (doble clic real, no
   * hipotético) inflaba `cuposConsumidos` la segunda vez aunque el canje ya
   * no cambiara de estado. Y si el `redemptionId` no existía o era de otro
   * tenant, el método devolvía éxito silencioso — el controlador nunca se
   * enteraba de que no pasó nada.
   *
   * El arreglo, mismo patrón que `solicitar()`: `SELECT ... FOR UPDATE`
   * dentro de un CTE bloquea la fila antes de decidir nada, así que dos
   * confirmaciones concurrentes sobre el mismo canje no pueden las dos pasar
   * de aquí — la segunda encuentra cero filas porque la primera ya movió el
   * estado. Solo si de verdad hubo transición se toca `benefit_stock`.
   */
  async confirmar(p: {
    tenantId: string;
    redemptionId: string;
    confirmadoPor: string;
    evidenciaUrl?: string;
  }): Promise<void> {
    await this.ds.transaction(async (m) => {
      await m.query(`SELECT set_config('app.tenant_id', $1, true)`, [p.tenantId]);

      // OJO: el comando de nivel superior de esta query es el SELECT final del
      // CTE — no un UPDATE/DELETE — así que TypeORM devuelve las FILAS
      // directamente, nunca `[filas, cantidadAfectada]`. Desestructurar con
      // `const [filas] = ...` aquí sería el mismo bug de siempre pero al
      // revés: tomaría la primera FILA como si fuera el arreglo completo.
      // Ver `solicitar()` unas líneas arriba, que ya hace esto bien.
      const filas = await m.query(
        `WITH previo AS (
           SELECT id, "itemId", "membershipId"
             FROM redemptions
            WHERE id = $1 AND "tenantId" = $2 AND estado = $3
            FOR UPDATE
         ), actualizado AS (
           UPDATE redemptions r
              SET estado = $4, "confirmadoPorMembershipId" = $5,
                  "evidenciaUrl" = $6, "updatedAt" = now()
             FROM previo
            WHERE r.id = previo.id
           RETURNING r.id, previo."itemId", previo."membershipId"
         )
         SELECT id, "itemId", "membershipId" FROM actualizado`,
        [
          p.redemptionId,
          p.tenantId,
          EstadoCanje.RESERVADO,
          EstadoCanje.CONFIRMADO,
          p.confirmadoPor,
          p.evidenciaUrl ?? null,
        ],
      );

      if (!filas || filas.length === 0) {
        const actual = await m.findOne(Redemption, {
          where: { id: p.redemptionId, tenantId: p.tenantId },
        });
        if (!actual) throw new CanjeNoEncontradoError();
        throw new TransicionInvalidaError(
          `No se puede confirmar un canje en estado "${actual.estado}" — solo aplica desde RESERVADO`,
        );
      }

      await m.query(
        `UPDATE benefit_stock
            SET "cuposReservados" = GREATEST(0, "cuposReservados" - 1),
                "cuposConsumidos" = "cuposConsumidos" + 1, "updatedAt" = now()
          WHERE "itemId" = $1`,
        [filas[0].itemId],
      );

      // Aviso 14/09 (pedido de Alim, #2): quien solicitó el canje se entera de
      // que ya se lo confirmaron, sin tener que estar refrescando la pantalla.
      if (filas[0].membershipId !== p.confirmadoPor) {
        try {
          await this.notificaciones.emitir(m, {
            tenantId: p.tenantId,
            membershipId: filas[0].membershipId,
            tipo: TipoNotificacion.CANJE_CONFIRMADO,
            mensaje: 'Tu canje fue confirmado',
            refTipo: 'redemption',
            refId: filas[0].id,
          });
        } catch (e) { /* best-effort */ }
      }
    });
  }

  /**
   * Revertir. Devuelve el cupo y el Oro con un asiento compensatorio.
   *
   * NUNCA un DELETE sobre el log de economia. Si algo se revierte, el registro
   * tiene que mostrar que ocurrio Y que se revirtio. Un log donde el error puede
   * desaparecer no sirve para auditar nada, y auditar es la unica razon por la
   * que existe.
   *
   * ⚠️ ARREGLADO EL 14/09 (`LVL-013`, tarea #17). El bug original: la resta de
   * cupo tocaba **siempre** `cuposReservados`, sin mirar en qué estado estaba
   * el canje. Si ya había pasado por `confirmar()`, el cupo vivía en
   * `cuposConsumidos`, no en `cuposReservados` — revertir un canje CONFIRMADO
   * vaciaba de más la columna equivocada y dejaba `cuposConsumidos` inflado
   * (nunca bajaba), un desajuste silencioso entre las dos columnas del stock.
   *
   * El asiento de Oro (`economy.revertir`) ya era idempotente por su clave
   * determinista — eso no tenía bug. Lo que faltaba era (a) decidir la
   * columna correcta según el estado real del canje, y (b) hacerlo de forma
   * atómica: mismo patrón `SELECT ... FOR UPDATE` dentro de un CTE que en
   * `confirmar()`, así dos revertir() concurrentes sobre el mismo canje no
   * pueden ambos pasar — el segundo encuentra cero filas.
   */
  async revertir(p: { tenantId: string; redemptionId: string; motivo: string }): Promise<void> {
    await this.ds.transaction(async (m) => {
      await m.query(`SELECT set_config('app.tenant_id', $1, true)`, [p.tenantId]);

      // Mismo aviso que en confirmar(): el nivel superior es un SELECT, así
      // que las filas vienen directas — nada de desestructurar `[filas]`.
      const filas = await m.query(
        `WITH previo AS (
           SELECT id, estado, "itemId", "membershipId", "precioOroAplicado"
             FROM redemptions
            WHERE id = $1 AND "tenantId" = $2
              AND estado IN ($3, $4, $5)
            FOR UPDATE
         ), actualizado AS (
           UPDATE redemptions r
              SET estado = $6, "updatedAt" = now()
             FROM previo
            WHERE r.id = previo.id
           RETURNING r.id, previo.estado AS "estadoAnterior", previo."itemId",
                     previo."membershipId", previo."precioOroAplicado"
         )
         SELECT id, "estadoAnterior", "itemId", "membershipId", "precioOroAplicado"
           FROM actualizado`,
        [
          p.redemptionId,
          p.tenantId,
          EstadoCanje.RESERVADO,
          EstadoCanje.CONFIRMADO,
          EstadoCanje.INDETERMINADO,
          EstadoCanje.REVERTIDO,
        ],
      );

      if (!filas || filas.length === 0) {
        // Tres motivos posibles, y hay que distinguirlos — no todos son error:
        const actual = await m.findOne(Redemption, {
          where: { id: p.redemptionId, tenantId: p.tenantId },
        });
        if (!actual) throw new CanjeNoEncontradoError();
        if (actual.estado === EstadoCanje.REVERTIDO) return; // reintento idempotente, no es error
        throw new TransicionInvalidaError(
          `No se puede revertir un canje en estado "${actual.estado}" — nunca reservó cupo`,
        );
      }

      const fila = filas[0];

      await this.economy.revertir(m, {
        tenantId: p.tenantId,
        membershipId: fila.membershipId,
        redemptionId: fila.id,
        monto: fila.precioOroAplicado,
      });

      // La columna a decrementar depende de dónde vivía el cupo. `columna` sale
      // de un ternario sobre un enum interno, nunca de input del usuario — no
      // hay riesgo de inyección al interpolarla en el nombre de columna.
      const columna =
        fila.estadoAnterior === EstadoCanje.CONFIRMADO ? 'cuposConsumidos' : 'cuposReservados';
      await m.query(
        `UPDATE benefit_stock
            SET "${columna}" = GREATEST(0, "${columna}" - 1), "updatedAt" = now()
          WHERE "itemId" = $1`,
        [fila.itemId],
      );

      this.log.warn(`Canje ${fila.id} revertido (estaba ${fila.estadoAnterior}): ${p.motivo}`);

      try {
        await this.notificaciones.emitir(m, {
          tenantId: p.tenantId,
          membershipId: fila.membershipId,
          tipo: TipoNotificacion.CANJE_REVERTIDO,
          mensaje: `Tu canje fue revertido: ${p.motivo}`,
          refTipo: 'redemption',
          refId: fila.id,
        });
      } catch (e) { /* best-effort */ }
    });
  }

  // ===========================================================================

  private rechazo(motivo: MotivoRechazo): ResultadoCanje {
    // Motivos TIPIFICADOS, no un 409 generico. Se los debo al PD desde el 06/08:
    // con un solo codigo tiene que escribir copy vago, y en un sistema donde el
    // Oro vale algo, un mensaje vago se lee como "me robaron".
    return { ok: false, motivo };
  }

  private async precioCongelado(
    m: import('typeorm').EntityManager,
    item: BenefitCatalogItem,
    membershipId: string,
  ): Promise<number> {
    // El precio que regia cuando la persona gano su Oro mas antiguo aun vivo.
    const r = await m.query(
      `SELECT v."precioOro"
         FROM benefit_price_versions v
        WHERE v."itemId" = $1
          AND v."vigenteDesde" <= COALESCE(
                (SELECT MIN(e."serverReceivedAt") FROM economy_events e
                  WHERE e."membershipId" = $2 AND e.tipo = 'ORO_GANADO'
                    AND e."serverReceivedAt" > now() - interval '90 days'),
                now())
        ORDER BY v."vigenteDesde" DESC
        LIMIT 1`,
      [item.id, membershipId],
    );
    return r?.[0]?.precioOro ?? item.precioOro;
  }
}
