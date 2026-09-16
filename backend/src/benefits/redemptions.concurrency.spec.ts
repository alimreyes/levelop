import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { FamiliaBeneficio } from '../common/enums';
import { ENTIDADES } from '../config/typeorm.config';
import { EconomyService } from '../economy/economy.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RedemptionsService } from './redemptions.service';
import { BenefitCatalogItem, BenefitStock, Redemption } from './benefits.entities';
import { Membership, Tenant, User } from '../identity/identity.entities';
import { EconomyConfig } from '../economy/economy.entities';

/**
 * ✅ CORRIÓ Y PASA contra Postgres real (Railway), 13/09/26. El aviso anterior
 * decía que este archivo nunca se había ejecutado; ya no es cierto, así que se
 * retiró.
 *
 * Qué prueba: dos solicitudes de canje simultáneas contra un item con UN SOLO
 * cupo. El UPDATE atómico de `benefit_stock` en `solicitar()` es lo único que
 * puede garantizar que una gane y la otra reciba `CUPO_AGOTADO` — dos personas
 * canjeando el último cupo del mes al mismo tiempo no es un caso borde, es un
 * martes (comentario original del propio servicio).
 *
 * Y sirvió: la primera vez que corrió, GANARON LAS DOS. La guarda de cupo en
 * `redemptions.service.ts` estaba muerta desde el primer día — TypeORM devuelve
 * `[filas, cantidadAfectada]` para un UPDATE, así que `reserva.length === 0`
 * nunca era cierto. Detalle completo en el comentario de esa consulta y en el
 * README. Lo único que había impedido una sobreventa real era el CHECK de la
 * base.
 *
 * Si alguna vez vuelve a fallar, el bug está en `redemptions.service.ts`, no
 * aquí.
 */
describe('RedemptionsService — condición de carrera del cupo', () => {
  let ds: DataSource;
  let economy: EconomyService;
  let redemptions: RedemptionsService;
  let tenantId: string;
  let itemId: string;
  let m1: Membership;
  let m2: Membership;
  let userIds: string[];

  // Único por corrida: la primera vez que corrió esto, un timeout dejó filas a
  // medio insertar y la siguiente corrida chocó con "users_email_key" porque
  // el email estaba hardcodeado. Con un sufijo aleatorio, correr el test dos
  // veces seguidas —o que la corrida anterior haya fallado a medias— nunca
  // vuelve a chocar contra basura de una corrida previa.
  const runId = randomUUID().slice(0, 8);

  beforeAll(async () => {
    // 30s en vez de los 5s por defecto de Jest: la conexión pública de Railway
    // (proxy TCP sobre internet, no la red privada) tarda más que eso solo en
    // el handshake, antes de contar las ~7 escrituras secuenciales de abajo.
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
      ds.getRepository(Tenant).create({ nombre: 'Test Concurrencia', zonaDefault: 'Caracas' }),
    );
    tenantId = tenant.id;

    await ds.getRepository(EconomyConfig).save(
      ds.getRepository(EconomyConfig).create({ tenantId, vigenteDesde: new Date() }),
    );

    const item = await ds.getRepository(BenefitCatalogItem).save(
      ds.getRepository(BenefitCatalogItem).create({
        tenantId,
        familia: FamiliaBeneficio.IMPULSOS,
        nombre: 'Cupo único de prueba',
        precioOro: 10,
        zonas: [],
        activo: true,
      }),
    );
    itemId = item.id;

    // UN SOLO cupo — el punto entero del test.
    await ds.getRepository(BenefitStock).save(
      ds.getRepository(BenefitStock).create({
        tenantId,
        itemId,
        cuposTotales: 1,
        cuposReservados: 0,
        cuposConsumidos: 0,
        periodoInicio: new Date(Date.now() - 86400000),
        periodoFin: new Date(Date.now() + 86400000),
      }),
    );

    // Dos personas con saldo suficiente.
    const [u1, u2] = await Promise.all([
      ds.getRepository(User).save(
        ds.getRepository(User).create({
          email: `a-${runId}@test.com`,
          passwordHash: 'x',
          nombre: 'A',
        }),
      ),
      ds.getRepository(User).save(
        ds.getRepository(User).create({
          email: `b-${runId}@test.com`,
          passwordHash: 'x',
          nombre: 'B',
        }),
      ),
    ]);
    userIds = [u1.id, u2.id];
    [m1, m2] = await Promise.all([
      ds.getRepository(Membership).save(
        ds.getRepository(Membership).create({ tenantId, userId: u1.id, zona: 'Caracas' }),
      ),
      ds.getRepository(Membership).save(
        ds.getRepository(Membership).create({ tenantId, userId: u2.id, zona: 'Caracas' }),
      ),
    ]);

    // Saldo de 10 Oro cada uno vía ajuste directo del cache — para este test no
    // importa el origen del Oro, solo que alcance para el precio del item.
    // `idempotencyKey` es tipo `uuid` en la base — un string con prefijo como
    // "seed-<algo>" no es un UUID válido y Postgres lo rechaza. Genero UUIDs
    // reales; para este seed no importa que no sean determinísticos (v5), solo
    // que sean únicos.
    await ds.query(
      `INSERT INTO economy_events ("tenantId","membershipId",tipo,"xpDelta","oroDelta",motivo,"idempotencyKey")
       VALUES ($1,$2,'ORO_GANADO',0,10,'AJUSTE_ADMIN',$3), ($1,$4,'ORO_GANADO',0,10,'AJUSTE_ADMIN',$5)`,
      [tenantId, m1.id, randomUUID(), m2.id, randomUUID()],
    );
  }, 30000);

  afterAll(async () => {
    // Limpieza PARCIAL, a propósito. `economy_events` es append-only (trigger
    // de la migración inicial) — y como `memberships`/`tenants` tienen FK
    // `ON DELETE CASCADE` HACIA `economy_events`, borrar el tenant o sus
    // membresías dispara ese cascade, que dispara el trigger, que lanza
    // excepción igual que un DELETE directo. No es un bug: es la misma regla
    // de auditabilidad cumpliéndose incluso contra mi propio código de
    // limpieza. Por eso NO borro tenant/memberships/users/economy_config —
    // se quedan como fixtures de prueba inofensivos (cada corrida usa un
    // `runId` distinto, así que nunca chocan entre sí). Solo limpio lo que no
    // toca la cadena de cascade hacia el ledger.
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

  it('de dos solicitudes simultáneas por el último cupo, exactamente una gana', async () => {
    const [r1, r2] = await Promise.all([
      redemptions.solicitar({ membership: m1, itemId }),
      redemptions.solicitar({ membership: m2, itemId }),
    ]);

    const resultados = [r1, r2];
    const exitosos = resultados.filter((r) => r.ok);
    const rechazados = resultados.filter((r) => !r.ok);

    expect(exitosos).toHaveLength(1);
    expect(rechazados).toHaveLength(1);
    expect(rechazados[0].motivo).toBe('CUPO_AGOTADO');

    const stock = await ds.getRepository(BenefitStock).findOneOrFail({ where: { itemId } });
    expect(stock.cuposReservados).toBe(1); // nunca 2 — ahí es donde vivía el bug de la spec heredada

    // Esta comprobación es la que de verdad importa, y la aprendí a la mala:
    // el bug del 13/09 (la guarda de cupo muerta) dejaba DOS canjes vivos
    // contra un solo cupo, y aun así `cuposReservados` seguía valiendo 1 —
    // así que las tres comprobaciones de arriba habrían pasado igual. Un cupo
    // reservado tiene que corresponder a exactamente un canje, y eso es lo
    // que hay que afirmar.
    const canjes = await ds
      .getRepository(Redemption)
      .find({ where: { itemId, tenantId } });
    expect(canjes).toHaveLength(1);
  });
});
