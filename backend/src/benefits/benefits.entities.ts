import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import {
  EstadoCanje,
  FamiliaBeneficio,
  MotivoRechazo,
  ProviderCanje,
} from '../common/enums';

/**
 * CATALOGO, CUPOS Y CANJE — AQUI SI HAY DINERO REAL.
 *
 * R-04 enmendada el 25/08: el pasivo financiero NO vive en el Oro (que es
 * puntaje), vive en el INVENTARIO. Como lo dijo el CFO aceptando la correccion
 * de Alim: "puse el pasivo sobre la unidad (el Oro) en vez de sobre el inventario
 * (el cupo, la entrada de cine). Es el mismo dinero, en la cuenta equivocada."
 *
 * Todo lo de este archivo requiere revision conjunta CFO + CTO antes de cambiarse.
 */

@Entity('benefit_catalog_items')
export class BenefitCatalogItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'text' })
  familia!: FamiliaBeneficio;

  @Column({ type: 'text' })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string | null;

  /** El dueno/gerente lo puede cambiar (A-9, decision de Alim del 25/08). */
  @Column({ type: 'int' })
  precioOro!: number;

  /**
   * Lo calcula Levelop. El CFO retiro las bandas duras que el mismo habia
   * propuesto, con una razon que vale la pena conservar: "si nosotros calculamos
   * la recomendacion, la inteligencia del producto esta en la recomendacion, no
   * en quien teclea el numero final". Y ningun dueno de PyME firma un software
   * que le dice cuanto vale su propio dia libre.
   */
  @Column({ type: 'int', nullable: true })
  precioOroRecomendado!: number | null;

  /**
   * 🔒 NUNCA visible para el empleado. Existe solo para que el CFO pueda calcular
   * el precio relativo: un 2x1 al cine no puede costar lo mismo en Oro que un 30%
   * en Adidas si sus costos difieren.
   */
  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  costoUsdReferencia!: string | null;

  /** Filtro por zona (Maestro §4.3). Vacio = disponible en todas. */
  @Column({ type: 'text', array: true, default: () => "'{}'" })
  zonas!: string[];

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  /**
   * Añadido 14/09 (pedido de Alim tras la primera prueba real): no todo
   * canje necesita que alguien lo apruebe. Un café de cortesía se entrega
   * solo; una reunión con gerencia sí necesita que alguien la confirme del
   * otro lado. `true` (default, seguro) = pasa por RESERVADO y espera
   * `confirmar()`. `false` = `solicitar()` lo deja CONFIRMADO de una vez —
   * ver el comentario en `RedemptionsService.solicitar()`.
   */
  @Column({ type: 'boolean', default: true })
  requiereAprobacion!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}

/**
 * Historial de precios — sostiene la ventana de congelamiento de 90 dias (A-17).
 *
 * Costo de ingenieria: practicamente cero, y el CFO ya lo habia notado. Como el
 * Oro caduca a 90 dias y el precio se congela 90 dias, SON EL MISMO NUMERO. Un
 * canje aplica el precio que regia cuando el Oro fue ganado, no el de hoy. Una
 * tabla mas, cero logica nueva.
 *
 * Regla permanente del sistema desde A-17, para todo cliente, no solo para los 5
 * Fundadores: el precio no cambia sobre un saldo vivo.
 */
@Entity('benefit_price_versions')
export class BenefitPriceVersion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ type: 'uuid' })
  itemId!: string;

  @Column({ type: 'int' })
  precioOro!: number;

  @Column({ type: 'timestamptz' })
  vigenteDesde!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  vigenteHasta!: Date | null;

  @Column({ type: 'uuid', nullable: true })
  creadoPorMembershipId!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}

/**
 * Cupos: LA CONTENCION REAL DEL PRODUCTO.
 *
 * Del glosario del Maestro: "una unidad de beneficio precontratada. Es finita —
 * ahi esta la contencion real del producto". Sin cupos finitos, el Oro no vale
 * nada porque todo esta siempre disponible.
 */
@Entity('benefit_stock')
export class BenefitStock {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ type: 'uuid' })
  itemId!: string;

  @Column({ type: 'int', default: 0 })
  cuposTotales!: number;

  @Column({ type: 'int', default: 0 })
  cuposReservados!: number;

  @Column({ type: 'int', default: 0 })
  cuposConsumidos!: number;

  @Column({ type: 'timestamptz' })
  periodoInicio!: Date;

  @Column({ type: 'timestamptz' })
  periodoFin!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}

/**
 * Canje. Maquina de estados con SEIS estados de fallo.
 *
 * El sexto (CUPO_AGOTADO en carrera) lo agregue yo en la mesa del MVP y sostengo
 * que sera el mas frecuente de todos: dos personas canjeando el ultimo cupo del
 * mes al mismo tiempo no es un caso borde, es un martes.
 *
 * INDETERMINADO existe aunque hoy no tengamos ningun provider externo. Es la
 * leccion mas cara de la auditoria de Cashea: un timeout NO es un fallo. Si el
 * tercero si entrego y nosotros devolvemos el Oro, emitimos valor gratis. Hoy
 * ese estado no se usa nunca; el dia que exista un provider real, ya esta.
 */
@Entity('redemptions')
@Unique('uq_redemption_idempotency', ['tenantId', 'idempotencyKey'])
export class Redemption {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ type: 'uuid' })
  membershipId!: string;

  @Index()
  @Column({ type: 'uuid' })
  itemId!: string;

  /** Congelado al momento del canje, resuelto contra benefit_price_versions. */
  @Column({ type: 'int' })
  precioOroAplicado!: number;

  @Index()
  @Column({ type: 'text', default: EstadoCanje.SOLICITADO })
  estado!: EstadoCanje;

  @Column({ type: 'text', nullable: true })
  motivoRechazo!: MotivoRechazo | null;

  @Column({ type: 'text', default: ProviderCanje.MANUAL })
  provider!: ProviderCanje;

  /** `ManualFulfillment`: RRHH aprueba, paga fuera de banda y adjunta evidencia. */
  @Column({ type: 'text', nullable: true })
  evidenciaUrl!: string | null;

  @Column({ type: 'uuid', nullable: true })
  confirmadoPorMembershipId!: string | null;

  @Column({ type: 'uuid' })
  idempotencyKey!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}

/**
 * Outbox. HOY ESTA VACIA Y ESO ESTA BIEN.
 *
 * El patron nace igual porque el error mas grave de la spec heredada fue mantener
 * una transaccion de Postgres abierta mientras se llamaba a una API externa con 3
 * reintentos: sostiene locks de fila durante segundos, agota el pool de
 * conexiones y hace ROLLBACK sobre un log declarado append-only.
 *
 * Regla que no se rompe: NINGUNA llamada a un tercero ocurre dentro de una
 * transaccion. Se escribe aqui, se confirma la transaccion, y un worker aparte
 * entrega. Cuando exista un provider real, ya no hay nada que rediseniar.
 */
@Entity('redemption_outbox')
export class RedemptionOutbox {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ type: 'uuid' })
  redemptionId!: string;

  @Column({ type: 'text' })
  operacion!: string;

  @Column({ type: 'jsonb' })
  payload!: Record<string, unknown>;

  @Index()
  @Column({ type: 'boolean', default: false })
  procesado!: boolean;

  @Column({ type: 'int', default: 0 })
  intentos!: number;

  @Column({ type: 'text', nullable: true })
  ultimoError!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  procesadoAt!: Date | null;
}
