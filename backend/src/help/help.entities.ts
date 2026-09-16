import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { PatronAyuda, TipoInteraccionAyuda } from '../common/enums';

/**
 * =============================================================================
 * «QUIEN NECESITA UNA MANO» — la unica excepcion autorizada a R-07
 * =============================================================================
 *
 * R-07 (Maestro §6): ninguna superficie de gerencia muestra un dato cuyo unico
 * uso posible sea senalar a una persona. Este panel es su UNICA excepcion, y esa
 * excepcion es CONDICIONAL: si pierde cualquiera de las cinco salvaguardas de
 * §6.1, deja de estar cubierta y vuelve a caer bajo R-07.
 *
 * -----------------------------------------------------------------------------
 * ENMIENDA DE ALIM DEL 01/09 A LA SALVAGUARDA 5
 * -----------------------------------------------------------------------------
 * La salvaguarda 5 original decia: "No hay historial. Si el patron se corrige la
 * tarjeta desaparece sin rastro. Un registro de quien ha aparecido en la lista
 * seria un expediente."
 *
 * Alim, 01/09, textual: "debemos tener historial, sino la funcion se cae."
 *
 * Tiene razon en el problema: sin ninguna persistencia el lider no sabe si ya
 * hablo con la persona, no puede distinguir "mejoro" de "sigue igual pero la
 * ventana de 3 semanas rodo", y no puede ver si su intervencion sirvio — que es
 * el proposito entero del panel.
 *
 * Lo construyo. Pero lo construyo con tres contenciones que preservan la razon
 * por la que la salvaguarda existia, porque lo que convierte un historial en un
 * expediente NO es que persista: es que sea ASIMETRICO, PERPETUO y AJENO.
 *
 *   1. SIMETRICO   — la persona ve exactamente el mismo historial que su lider,
 *                    por el mismo endpoint. Un registro que el interesado puede
 *                    leer completo no es un expediente secreto: es su propio
 *                    registro. (Extiende la salvaguarda 4, que ya exigia esto
 *                    para las tarjetas vivas.)
 *   2. CADUCA      — retencion dura de 90 dias, el mismo numero que todo lo demas
 *                    en el sistema (decay del Oro, ventana de precio). Suficiente
 *                    para continuidad; insuficiente para construir un legajo
 *                    anual. Se borra solo, no depende de que alguien se acuerde.
 *   3. CIEGO PARA  — el rol de Postgres del BackOffice de gerencia NO tiene SELECT
 *      GERENCIA      sobre estas tablas. Solo el lider del area y la propia
 *                    persona. Gerencia nunca ve esto, ni agregado.
 *
 * Riesgo que queda vivo y que dejo escrito, porque construirlo no me quita la
 * objecion: aun con las tres contenciones, un historial de 90 dias sobre "esta
 * persona fue senalada por bajo ritmo" es material utilizable en una disputa
 * laboral (LOTTT). El dictamen legal sigue abierto en LVL-015. Si el abogado dice
 * que esto es prueba en contra del cliente, hay que volver aqui.
 *
 * Registrado ante la EA para enmienda formal del Maestro §6.1. R-07 requiere
 * firma de CEO + PD para cambiarse; Alim decide por encima de la regla, que es su
 * potestad, pero no puede quedar como divergencia no documentada — ese es
 * exactamente el patron C-006 que costo 18 dias con el precio de $79.
 */

@Entity('help_signals')
@Unique('uq_help_signal_vigente', ['tenantId', 'membershipId', 'patron'])
@Index('ix_help_signal_area', ['tenantId', 'areaId'])
export class HelpSignal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ type: 'uuid' })
  areaId!: string;

  @Column({ type: 'uuid' })
  membershipId!: string;

  /**
   * Salvaguarda 1: esto es una lista de PATRONES, no de personas. Uno de los seis
   * se llama SISTEMA_NO_SABE: cuando todo cae a la vez, el panel se declara
   * incompetente y dice "no lleves este panel a esa reunion" en vez de inventar
   * un diagnostico sobre alguien.
   */
  @Column({ type: 'text' })
  patron!: PatronAyuda;

  /**
   * Salvaguarda 2, implementada como ausencia.
   *
   * Este es el UNICO campo por el que la tabla se puede ordenar. Cinco semanas es
   * mas urgente que tres, y eso no es un juicio sobre nadie.
   *
   * 🔒 NO EXISTE, Y NO SE AGREGA, ninguna columna de score, severidad, ranking,
   * posicion ni gravedad. No es que la UI no la muestre: el dato no existe y no
   * se puede calcular desde esta tabla. Si alguien alguna vez necesita "ordenar
   * de peor a mejor", tiene que agregar una columna — y ese commit es visible en
   * la revision, que es exactamente el punto.
   */
  @Column({ type: 'date' })
  detectadoDesde!: string;

  @Column({ type: 'date' })
  ultimaEvaluacion!: string;

  /**
   * 🔒 Tampoco existe `estado`, `cerrado`, `archivado` ni `deletedAt`. Cuando el
   * patron se corrige, la fila se BORRA de esta tabla (DELETE real) y, si la
   * enmienda de Alim lo permite, se archiva en `help_signal_history` con su
   * caducidad propia. Esta tabla solo contiene lo VIGENTE.
   */

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}

/**
 * HISTORIAL — la enmienda del 01/09.
 *
 * Guarda patrones ya cerrados y lo que el lider hizo al respecto. Es lo que
 * permite responder "¿ya hable con esta persona?" y "¿sirvio de algo?", que era
 * el problema real que Alim levanto.
 *
 * Tres contenciones, implementadas y no solo prometidas:
 *   - `visibleParaPersona` es SIEMPRE true. La columna existe para que el codigo
 *     que la lee tenga que mirarla, no para poder ponerla en false. No hay
 *     endpoint que la escriba en false y el CHECK de la migracion lo impide.
 *   - `expiraAt` se llena en el INSERT con now() + 90 dias. Un job diario borra
 *     lo vencido. La retencion no depende de que alguien se acuerde de limpiar.
 *   - El rol de Postgres del BackOffice de gerencia no tiene SELECT aqui.
 */
@Entity('help_signal_history')
@Index('ix_help_hist_membership', ['tenantId', 'membershipId'])
@Index('ix_help_hist_expira', ['expiraAt'])
export class HelpSignalHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ type: 'uuid' })
  areaId!: string;

  @Column({ type: 'uuid' })
  membershipId!: string;

  @Column({ type: 'text' })
  patron!: PatronAyuda;

  @Column({ type: 'date' })
  detectadoDesde!: string;

  @Column({ type: 'date' })
  cerradoEl!: string;

  /**
   * Por que dejo de estar vigente. Distingue "mejoro" de "la ventana rodo", que
   * es justo lo que el lider no podia saber sin historial.
   */
  @Column({ type: 'text' })
  motivoCierre!: string;

  /**
   * Contencion 1 — SIMETRIA. Siempre true, con CHECK en la base de datos.
   * Si la persona no puede leerlo, es un expediente. Si puede, es su registro.
   */
  @Column({ type: 'boolean', default: true })
  visibleParaPersona!: boolean;

  /** Contencion 2 — CADUCIDAD DURA. 90 dias, el mismo numero que todo el sistema. */
  @Index()
  @Column({ type: 'timestamptz' })
  expiraAt!: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}

/**
 * Lo que el LIDER hizo, no lo que el sistema detecto.
 *
 * Esta es la parte del historial que resuelve el problema de Alim sin registrar
 * nada sobre el desempeno de nadie: es la bitacora de acciones del lider. Se lee
 * como una lista de pendientes propios, no como un legajo de un tercero.
 *
 * Mismas tres contenciones: simetrica, caduca a 90 dias, invisible para gerencia.
 */
@Entity('help_interactions')
@Index('ix_help_inter_expira', ['expiraAt'])
export class HelpInteraction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ type: 'uuid' })
  membershipId!: string;

  @Column({ type: 'uuid' })
  liderMembershipId!: string;

  @Column({ type: 'text' })
  patron!: PatronAyuda;

  @Column({ type: 'text' })
  tipo!: TipoInteraccionAyuda;

  @Column({ type: 'text', nullable: true })
  nota!: string | null;

  @Column({ type: 'boolean', default: true })
  visibleParaPersona!: boolean;

  @Index()
  @Column({ type: 'timestamptz' })
  expiraAt!: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
