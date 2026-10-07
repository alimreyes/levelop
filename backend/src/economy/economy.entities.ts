import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { MotivoEvento, TipoEventoEconomia } from '../common/enums';

/**
 * EL EVENT STORE DE LA ECONOMIA — la pieza central de todo el backend.
 *
 * Append-only, idempotente y dimensional desde el dia uno. Es a la vez:
 *   - la concesion que el CEO me dio el 06/08 (el modelo de eventos nace
 *     append-only aunque no construyamos offline, para que el offline sea despues
 *     una decision de UI y no una reescritura), y
 *   - el foso de datos propietario del Maestro §2.3: "que beneficio mueve que
 *     comportamiento, por rol y por empresa, medido en el tiempo".
 *
 * REGLA DURA: el saldo de Oro de una persona NUNCA es una columna que se edita.
 * Es SUM(oroDelta). Un numero que se puede sobrescribir es un numero que nadie
 * puede auditar, y eso ya lo vivimos: los saldos de localStorage se editan desde
 * DevTools en diez segundos. Por eso el ledger arranca en cero (corte contable).
 */
@Entity('economy_events')
@Unique('uq_economy_idempotency', ['tenantId', 'idempotencyKey'])
@Index('ix_economy_membership_fecha', ['membershipId', 'serverReceivedAt'])
@Index('ix_economy_tenant_tipo', ['tenantId', 'tipo'])
export class EconomyEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ type: 'uuid' })
  membershipId!: string;

  @Column({ type: 'text' })
  tipo!: TipoEventoEconomia;

  /**
   * FIRMADOS. Este es el arreglo del error #1 que encontre en la spec heredada:
   * tenia `EARN`/`BURN` con `amount` siempre positivo, o sea un journal de una
   * sola pierna donde el signo dependia de interpretar el tipo.
   *
   * Ya no necesitamos doble entrada contable — el Oro es puntaje, no dinero
   * (C-008) — pero SI necesitamos que el saldo sea una suma y no una
   * interpretacion que cambie segun quien escriba el WHERE.
   */
  @Column({ type: 'int', default: 0 })
  xpDelta!: number;

  @Column({ type: 'int', default: 0 })
  oroDelta!: number;

  @Column({ type: 'text' })
  motivo!: MotivoEvento;

  @Column({ type: 'text', nullable: true })
  refTipo!: string | null;

  @Column({ type: 'uuid', nullable: true })
  refId!: string | null;

  /**
   * UUIDv5 DETERMINISTICO, no v4 generado en cliente.
   *
   * Error #4 de la spec heredada: un UUIDv4 generado en el cliente se regenera si
   * el proceso reinicia, o sea que no es idempotente — que es exactamente lo
   * unico que se le pide a una clave de idempotencia. Se calcula v5 sobre
   * (tenant, membership, tipo, refId) para que el mismo hecho produzca siempre la
   * misma clave.
   *
   * Y el UNIQUE es por (tenantId, idempotencyKey), NO global: era el otro medio
   * error del #4. Con un UNIQUE global, un cliente puede envenenar el espacio de
   * claves de otro.
   */
  @Column({ type: 'uuid' })
  idempotencyKey!: string;

  /**
   * Los dos tiempos, separados a proposito.
   *
   * Acepto el tiempo del cliente solo dentro de una deriva maxima declarada y
   * nunca en el futuro. Aviso que ya le di al PD: si el diseno de rachas asume
   * que el dia del usuario y el dia del servidor coinciden, se rompe con el
   * primer empleado que sincronice tres dias despues.
   */
  @Column({ type: 'timestamptz', nullable: true })
  clientOccurredAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  serverReceivedAt!: Date;

  @Column({ type: 'bigint', nullable: true })
  sessionSeq!: string | null;

  // --- Dimensiones analiticas, materializadas al escribir ---------------------
  // Se copian en el momento del evento en vez de resolverse por JOIN despues,
  // porque el rol de alguien cambia y la pregunta que queremos responder es "que
  // movia el comportamiento de un lider en marzo", no "que hace hoy esa persona".

  @Column({ type: 'text', nullable: true })
  dimRol!: string | null;

  @Column({ type: 'uuid', nullable: true })
  dimAreaId!: string | null;

  @Column({ type: 'text', nullable: true })
  dimZona!: string | null;

  @Column({ type: 'text', nullable: true })
  dimFamiliaBeneficio!: string | null;
}

/**
 * Cache de saldos. NO es la fuente de verdad.
 *
 * Existe solo para no sumar el log entero en cada request. Es reconstruible: si
 * se corrompe, se recalcula desde `economy_events` y no se pierde nada. Cualquier
 * lectura que importe de verdad (un canje, una auditoria) se hace contra el log.
 */
@Entity('economy_balances')
@Unique('uq_balance_membership', ['membershipId'])
export class EconomyBalance {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'uuid' })
  membershipId!: string;

  @Column({ type: 'int', default: 0 })
  oro!: number;

  @Column({ type: 'int', default: 0 })
  xp!: number;

  @Column({ type: 'int', default: 1 })
  nivel!: number;

  @Column({ type: 'timestamptz' })
  recalculadoAt!: Date;
}

/**
 * Configuracion economica POR TENANT y VERSIONADA.
 *
 * Ningun numero de la economia va hardcodeado, y esto es deliberado: CH-5 dice
 * que los 19 precios del catalogo y estos multiplicadores son incompatibles en un
 * orden de magnitud (11 a 44 dias libres al ano sobre 15 legales). Cuando el CFO
 * y el PD cierren CH-5, se cambia un registro — no se despliega.
 *
 * Formula vigente (Maestro §3.3, marcada ahi como propuesta del PD, no acordada):
 *   XP    = xpBase × mult(urgencia) × mult(importancia) × mult(esfuerzo)
 *   Oro   = XP × factorOro
 *   Nivel = mayor N tal que XP acumulada >= nivelBase × N^nivelExponente
 */
@Entity('economy_config')
export class EconomyConfig {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'int', default: 40 })
  xpBase!: number;

  @Column({ type: 'numeric', precision: 4, scale: 2, default: 0.4 })
  factorOro!: string;

  @Column({ type: 'jsonb', default: () => `'{"baja":1.0,"media":1.4,"alta":1.9}'` })
  multUrgencia!: Record<string, number>;

  @Column({ type: 'jsonb', default: () => `'{"baja":1.0,"media":1.4,"alta":1.9}'` })
  multImportancia!: Record<string, number>;

  @Column({ type: 'jsonb', default: () => `'{"bajo":0.8,"medio":1.2,"alto":1.7}'` })
  multEsfuerzo!: Record<string, number>;

  @Column({ type: 'int', default: 280 })
  nivelBase!: number;

  @Column({ type: 'numeric', precision: 4, scale: 2, default: 1.62 })
  nivelExponente!: string;

  /** Tope de 150 Oro/dia (Maestro §3.3). Anti-cheat economico, no criptografico. */
  @Column({ type: 'int', default: 150 })
  capOroDiario!: number;

  /** Caducidad a 90 dias, sin excepciones (Maestro §3.4). */
  @Column({ type: 'int', default: 90 })
  decayDias!: number;

  /**
   * 19/09/26 — dias para USAR un canje ya confirmado. 0 = sin vencimiento.
   *
   * Ojo con no confundirlo con `decayDias`: aquel es cuanto dura el ORO sin
   * gastar; este es cuanto dura el BENEFICIO ya comprado sin usar. Son dos
   * relojes distintos sobre dos cosas distintas, y mezclarlos seria cobrarle
   * dos veces la misma demora a la misma persona.
   */
  @Column({ type: 'int', default: 30 })
  diasParaUsarCanje!: number;

  /**
   * 07/10/26 — dias de bloqueo para volver a cambiar de personaje. 0 = libre.
   *
   * El documento de Alim dice «cada 30 dias» y «esperar 15 dias» en el mismo
   * parrafo; se lo pregunte (LVL-064 §8.1). Mientras no responda, el default es
   * 30 y cambiarlo cuesta un UPDATE.
   */
  @Column({ type: 'int', default: 30 })
  diasBloqueoPersonaje!: number;

  @Column({ type: 'timestamptz' })
  vigenteDesde!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  vigenteHasta!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
