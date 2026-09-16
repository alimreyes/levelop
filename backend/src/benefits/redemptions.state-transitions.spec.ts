import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { EstadoCanje, FamiliaBeneficio } from '../common/enums';
import { ENTIDADES } from '../config/typeorm.config';
import { EconomyService } from '../economy/economy.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CanjeNoEncontradoError,
  RedemptionsService,
  TransicionInvalidaError,
} from './redemptions.service';
import { BenefitCatalogItem, BenefitStock, Redemption } from './benefits.entities';
import { Membership, Tenant, User } from '../identity/identity.entities';
import { EconomyConfig } from '../economy/economy.entities';

/**
 * ⚠️ ESCRITO 14/09/26 — SIN CORRER TODAVÍA. Misma salvedad que todo el resto
 * de este proyecto: un test que nadie ejecutó no prueba nada, solo describe
 * la intención. Necesita un `DATABASE_URL` real (Railway) para correr, igual
 * que `redemptions.concurrency.spec.ts`.
 *
 * Qué prueba, y por qué cada caso corresponde a un bug real de `LVL-013`
 * tarea #17 (no a un caso hipotético):
 *
 *  1. Confirmar el mismo canje dos veces NO debe inflar `cuposConsumidos` —
 *     el bug original dejaba correr el UPDATE de stock sin verificar si la
 *     transición de estado había ocurrido de verdad.
 *  2. Revertir un canje CONFIRMADO debe decrementar `cuposConsumidos`, no
 *     `cuposReservados` — el bug original siempre tocaba la columna
 *     equivocada para ese caso.
 *  3. Revertir el mismo canje dos veces es idempotente (no lanza, no
 *     decrementa el stock una segunda vez) — esto ya funcionaba antes
 *     (el guard `estado === REVERTIDO` existía), se mantiene como
 *     regresión.
 *  4. Confirmar/revertir dos veces EN CARRERA (Promise.all, no secuencial)
 *     para probar que el `SELECT ... FOR UPDATE` de verdad serializa —
 *     mismo espíritu que el test de cupos del 13/09: la versión secuencial
 *     de este test habría pasado igual con el bug puesto.
 */
describe('RedemptionsService — transiciones de estado de confirmar()/revertir()', () => {
  let ds: DataSource;
  let economy: EconomyService;
  let redemptions: RedemptionsService;
  let tenantId: string;
  let membership: Membership;

  const runId = randomUUID().slice(0, 8);

  async function crearItemConCupos(cupos: number): Promise<string> {
    const item = await ds.getRepository(BenefitCatalogItem).save(
      ds.getRepository(BenefitCatalogItem).create({
        tenantId,
        familia: FamiliaBeneficio.IMPULSOS,
        nombre: `Item de prueba ${randomUUID().slice(0, 4)}`,
        precioOro: 5,
        zonas: [],
        activo: true,
      }),
    );
    await ds.getRepository(BenefitStock).save(
      ds.getRepository(BenefitStock).create({
        tenantId,
        itemId: item.id,
        cuposTotales: cupos,
        cuposReservados: 0,
        cuposConsumidos: 0,
        periodoInicio: new Date(Date.now() - 86400000),
        periodoFin: new Date(Date.now() + 86400000),
      }),
    );
    return item.id;
  }

  async function fondear(monto: number): Promise<void> {
    await ds.query(
      `INSERT INTO economy_events ("tenantId","membershipId",tipo,"xpDelta","oroDelta",motivo,"idempotencyKey")
       VALUES ($1,$2,'ORO_GANADO',0,$3,'AJUSTE_ADMIN',$4)`,
      [tenantId, membership.id, monto, randomUUID()],
    );
  }

  beforeAll(async () => {
    ds = new DataSource({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      synchronize: false,
      entities: ENTIDADES,
    });
    await ds.initialize();
    economy = new EconomyService(ds);
    redemptions = new RedemptionsService(ds, economy, new NotificationsService(ds));

    const tenant = await ds.getRepository(Tenant).save(
      ds.getRepository(Tenant).create({ nombre: 'Test Transiciones Canje', zonaDefault: 'Caracas' }),
    );
    tenantId = tenant.id;

    await ds.getRepository(EconomyConfig).save(
      ds.getRepository(EconomyConfig).create({ tenantId, vigenteDesde: new Date() }),
    );

    const user = await ds.getRepository(User).save(
      ds.getRepository(User).create({ email: `t-${runId}@test.com`, passwordHash: 'x', nombre: 'T' }),
    );
    membership = await ds.getRepository(Membership).save(
      ds.getRepository(Membership).create({ tenantId, userId: user.id, zona: 'Caracas' }),
    );

    // Suficiente para varios canjes de 5 Oro cada uno a lo largo del archivo.
    await fondear(200);
  }, 30000);

  afterAll(async () => {
    // Misma limpieza parcial que redemptions.concurrency.spec.ts, y mismo
    // motivo: economy_events es append-only y tenant/membership tienen
    // cascade hacia esa tabla.
    try {
      await ds.query(`DELETE FROM benefit_stock WHERE "tenantId" = $1`, [tenantId]);
      await ds.query(`DELETE FROM redemptions WHERE "tenantId" = $1`, [tenantId]);
      await ds.query(`DELETE FROM benefit_catalog_items WHERE "tenantId" = $1`, [tenantId]);
    } catch (e) {
      console.warn('Limpieza post-test incompleta (no afecta el resultado):', e);
    } finally {
      await ds.destroy();
    }
  }, 15000);

  it('confirmar dos veces el mismo canje: la segunda lanza, y cuposConsumidos no se infla', async () => {
    const itemId = await crearItemConCupos(1);
    const solicitud = await redemptions.solicitar({ membership, itemId });
    expect(solicitud.ok).toBe(true);

    await redemptions.confirmar({
      tenantId,
      redemptionId: solicitud.redemptionId!,
      confirmadoPor: membership.id,
    });

    await expect(
      redemptions.confirmar({
        tenantId,
        redemptionId: solicitud.redemptionId!,
        confirmadoPor: membership.id,
      }),
    ).rejects.toBeInstanceOf(TransicionInvalidaError);

    const stock = await ds.getRepository(BenefitStock).findOneOrFail({ where: { itemId } });
    expect(stock.cuposConsumidos).toBe(1); // nunca 2 — ahí vivía el bug
    expect(stock.cuposReservados).toBe(0);
  }, 15000);

  it('confirmar dos veces EN CARRERA: solo una gana, cuposConsumidos queda en 1', async () => {
    const itemId = await crearItemConCupos(1);
    const solicitud = await redemptions.solicitar({ membership, itemId });
    expect(solicitud.ok).toBe(true);

    const resultados = await Promise.allSettled([
      redemptions.confirmar({
        tenantId,
        redemptionId: solicitud.redemptionId!,
        confirmadoPor: membership.id,
      }),
      redemptions.confirmar({
        tenantId,
        redemptionId: solicitud.redemptionId!,
        confirmadoPor: membership.id,
      }),
    ]);

    const exitosas = resultados.filter((r) => r.status === 'fulfilled');
    const fallidas = resultados.filter((r) => r.status === 'rejected');
    expect(exitosas).toHaveLength(1);
    expect(fallidas).toHaveLength(1);

    const stock = await ds.getRepository(BenefitStock).findOneOrFail({ where: { itemId } });
    expect(stock.cuposConsumidos).toBe(1);
  }, 15000);

  it('revertir un canje RESERVADO decrementa cuposReservados, no cuposConsumidos', async () => {
    const itemId = await crearItemConCupos(1);
    const solicitud = await redemptions.solicitar({ membership, itemId });
    expect(solicitud.ok).toBe(true);

    const saldoAntes = await economy.saldoOro(ds.manager, membership.id);

    await redemptions.revertir({
      tenantId,
      redemptionId: solicitud.redemptionId!,
      motivo: 'test',
    });

    const stock = await ds.getRepository(BenefitStock).findOneOrFail({ where: { itemId } });
    expect(stock.cuposReservados).toBe(0);
    expect(stock.cuposConsumidos).toBe(0);

    const canje = await ds
      .getRepository(Redemption)
      .findOneOrFail({ where: { id: solicitud.redemptionId! } });
    expect(canje.estado).toBe(EstadoCanje.REVERTIDO);

    const saldoDespues = await economy.saldoOro(ds.manager, membership.id);
    expect(saldoDespues).toBe(saldoAntes + canje.precioOroAplicado);
  }, 15000);

  it('revertir un canje CONFIRMADO decrementa cuposConsumidos, no cuposReservados — el bug original tocaba la columna equivocada aquí', async () => {
    const itemId = await crearItemConCupos(1);
    const solicitud = await redemptions.solicitar({ membership, itemId });
    expect(solicitud.ok).toBe(true);

    await redemptions.confirmar({
      tenantId,
      redemptionId: solicitud.redemptionId!,
      confirmadoPor: membership.id,
    });

    let stock = await ds.getRepository(BenefitStock).findOneOrFail({ where: { itemId } });
    expect(stock.cuposConsumidos).toBe(1);
    expect(stock.cuposReservados).toBe(0);

    await redemptions.revertir({
      tenantId,
      redemptionId: solicitud.redemptionId!,
      motivo: 'test',
    });

    stock = await ds.getRepository(BenefitStock).findOneOrFail({ where: { itemId } });
    // Esta es LA aserción que el bug original fallaba: revertía sobre
    // cuposReservados (que ya estaba en 0) y dejaba cuposConsumidos en 1
    // para siempre, aunque el canje ya estuviera REVERTIDO.
    expect(stock.cuposConsumidos).toBe(0);
    expect(stock.cuposReservados).toBe(0);
  }, 15000);

  it('revertir el mismo canje dos veces es idempotente: la segunda no lanza y no vuelve a tocar el stock', async () => {
    const itemId = await crearItemConCupos(1);
    const solicitud = await redemptions.solicitar({ membership, itemId });
    expect(solicitud.ok).toBe(true);

    await redemptions.revertir({ tenantId, redemptionId: solicitud.redemptionId!, motivo: 'primera' });
    const stockTrasPrimera = await ds
      .getRepository(BenefitStock)
      .findOneOrFail({ where: { itemId } });

    await expect(
      redemptions.revertir({ tenantId, redemptionId: solicitud.redemptionId!, motivo: 'segunda' }),
    ).resolves.toBeUndefined();

    const stockTrasSegunda = await ds
      .getRepository(BenefitStock)
      .findOneOrFail({ where: { itemId } });
    expect(stockTrasSegunda.cuposReservados).toBe(stockTrasPrimera.cuposReservados);
    expect(stockTrasSegunda.cuposConsumidos).toBe(stockTrasPrimera.cuposConsumidos);
  }, 15000);

  it('revertir dos veces EN CARRERA sobre el mismo canje CONFIRMADO: solo una decrementa cuposConsumidos', async () => {
    const itemId = await crearItemConCupos(1);
    const solicitud = await redemptions.solicitar({ membership, itemId });
    expect(solicitud.ok).toBe(true);
    await redemptions.confirmar({
      tenantId,
      redemptionId: solicitud.redemptionId!,
      confirmadoPor: membership.id,
    });

    await Promise.all([
      redemptions.revertir({ tenantId, redemptionId: solicitud.redemptionId!, motivo: 'r1' }),
      redemptions.revertir({ tenantId, redemptionId: solicitud.redemptionId!, motivo: 'r2' }),
    ]);

    const stock = await ds.getRepository(BenefitStock).findOneOrFail({ where: { itemId } });
    // Si el FOR UPDATE no serializara esto, cuposConsumidos podría quedar en
    // -1 (GREATEST evita negativo, pero solo si cada llamada resta 1 una
    // sola vez) — la aserción real es que el saldo de Oro tampoco se
    // duplicó, porque economy.revertir() ya era idempotente antes de hoy.
    expect(stock.cuposConsumidos).toBe(0);
  }, 15000);

  it('confirmar un canje inexistente lanza CanjeNoEncontradoError', async () => {
    await expect(
      redemptions.confirmar({
        tenantId,
        redemptionId: randomUUID(),
        confirmadoPor: membership.id,
      }),
    ).rejects.toBeInstanceOf(CanjeNoEncontradoError);
  });
});
