import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { EstadoTenant, RolMembership } from '../common/enums';

/**
 * 13/09/26 — CORRECCIÓN: `Membership` y `MembershipPrefs` se referencian mutuamente
 * (una tiene `prefs: MembershipPrefs`, la otra `membership: Membership`) en el MISMO
 * archivo. Con `emitDecoratorMetadata` activo (lo necesita TypeORM/NestJS), TypeScript
 * emite la clase real como valor de metadata en tiempo de ejecución — y como las clases
 * de JS no se "hoistean" (tienen temporal dead zone, igual que `let`/`const`), la que se
 * define primero en el archivo revienta al intentar referenciar a la que todavía no
 * existe: `ReferenceError: Cannot access 'MembershipPrefs' before initialization`. Es
 * exactamente el error que le salió a Alim corriendo `npm run migration:run` — el primer
 * comando que de verdad ejecutaba este código.
 *
 * Arreglo estándar de TypeORM para este caso: envolver el TIPO (no el decorador, que ya
 * usa una función flecha diferida) en `Relation<T>`. En tiempo de compilación sigue
 * siendo el tipo real; en tiempo de ejecución, `Relation<T>` no genera una referencia de
 * clase, así que no importa el orden de declaración.
 */

/**
 * IDENTIDAD Y MULTI-TENANCY
 *
 * El bug que arreglamos aqui: la spec heredada tenia `national_id VARCHAR(20)
 * UNIQUE` GLOBAL, lo que impedia que una persona trabajara en dos empresas
 * cliente. El CEO decidio el 06/08 que el titular de la cuenta es el empleador y
 * que el empleado puede pertenecer a varios tenants.
 *
 * La solucion: la identidad global vive en `users` (por email), y la relacion
 * persona-empresa vive en `memberships`, con UNIQUE por (tenant, user). El rol,
 * la zona y el opt-out son propiedades de la MEMBRESIA, no de la persona: alguien
 * puede ser lider en una empresa y empleado en otra.
 */

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  nombre!: string;

  /** CH-18: bloquea alianzas B2B formales en Venezuela. El campo existe aunque el RIF todavia no. */
  @Column({ type: 'text', nullable: true })
  rif!: string | null;

  @Column({ type: 'text' })
  zonaDefault!: string;

  @Column({ type: 'text', default: EstadoTenant.ONBOARDING })
  estado!: EstadoTenant;

  /**
   * Gate de lanzamiento (Maestro §4.3, decision del CEO). Un workspace NO esta
   * lanzado sin 3 Intrarrecompensas de tiempo activas y al menos un canje
   * confirmado. Es un gate medible, no un paso de onboarding: esta columna la
   * llena el sistema cuando la condicion se cumple, nadie la marca a mano.
   */
  @Column({ type: 'timestamptz', nullable: true })
  lanzadoAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @OneToMany(() => Membership, (m) => m.tenant)
  memberships!: Membership[];
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * La identidad global es el email. NO hay national_id / cedula en este esquema.
   * Se retiro con C-007: al desaparecer el canje monetario desaparecio la unica
   * razon para pedirla. Si algun dia vuelve, vuelve cifrada, por tenant, y jamas
   * como UNIQUE global.
   */
  @Index({ unique: true })
  @Column({ type: 'text' })
  email!: string;

  @Column({ type: 'text', select: false })
  passwordHash!: string;

  @Column({ type: 'text' })
  nombre!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @OneToMany(() => Membership, (m) => m.user)
  memberships!: Membership[];
}

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'text' })
  nombre!: string;

  @Column({ type: 'uuid', nullable: true })
  liderMembershipId!: string | null;

  /**
   * 19/09/26 — color de la marca del area. NULL = se deriva de la posicion del
   * area contra la paleta fija de `LevelopAPI.colorArea`. Ver la migracion
   * `ColorDeArea` sobre por que el default es una regla y no un valor.
   */
  @Column({ type: 'text', nullable: true })
  color!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}

@Entity('memberships')
@Unique('uq_membership_tenant_user', ['tenantId', 'userId'])
export class Membership {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'text', default: RolMembership.EMPLEADO })
  rol!: RolMembership;

  @Column({ type: 'uuid', nullable: true })
  areaId!: string | null;

  /**
   * La zona la fija RRHH, NO el empleado (Maestro §9). Filtra el catalogo:
   * mostrarle a alguien de Maracaibo un gimnasio que solo existe en Caracas
   * es una burla, y ademas nos hace parecer que no conocemos el pais.
   */
  @Column({ type: 'text' })
  zona!: string;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  /**
   * R-03: la participacion gamificada es SIEMPRE opt-in.
   *
   * CH-2 (decision de Alim, 25/08): si el usuario apaga la capa de juego, DEJA
   * DE GANAR ORO. Su saldo acumulado sigue el decay normal de 90 dias, sin trato
   * especial, y reactivar no restaura lo que caduco mientras estuvo apagado.
   *
   * Nota mia, registrada y no rebatida (C-010): sostengo que esto crea un
   * incentivo para que un empleador presione el opt-out y asi reduzca lo
   * devengado. Se decidio en contra de mi posicion y lo construyo como se
   * decidio. Lo dejo como un booleano y no como una rama estructural
   * precisamente para que revertirlo, si aparece evidencia, sea barato.
   */
  @Column({ type: 'boolean', default: true })
  optInJuego!: boolean;

  /**
   * 07/10/26 — el personaje elegido. NULL = todavia no eligio.
   *
   * Vive en la membresia y no en el usuario porque es la identidad DENTRO de
   * una empresa, como la zona y el rol: quien trabaja en dos lugares puede ser
   * Mago en uno y Dragon en el otro.
   *
   * Visible entre companeros, como cualquier avatar. `personajeCambiadoAt`, en
   * cambio, no sale de su dueno: cuando alguien cambio de personaje es un dato
   * de comportamiento sin accion posible, y eso es lo que R-07 deja afuera.
   */
  @Column({ type: 'text', nullable: true })
  personaje!: string | null;

  /** Unica fuente del bloqueo: el plazo se calcula, no se guarda. */
  @Column({ type: 'timestamptz', nullable: true })
  personajeCambiadoAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  optOutAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Tenant, (t) => t.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant!: Relation<Tenant>;

  @ManyToOne(() => User, (u) => u.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: Relation<User>;

  @OneToOne(() => MembershipPrefs, (p) => p.membership)
  prefs!: Relation<MembershipPrefs>;
}

/**
 * Preferencias privadas de la persona.
 *
 * 🔒 R-07: NINGUNA superficie de gerencia tiene SELECT sobre esta tabla. Ni el
 * BackOffice de gerencia ni el de Lider de Area. Ver los GRANTs de la migracion.
 *
 * Aqui vive, entre otras cosas, el descarte de la invitacion al 1-a-1. El Maestro
 * §6.1 lo dice sin ambiguedad: "si descarta la invitacion al 1-a-1, el lider no
 * se entera — un aviso cuyo rechazo se reporta no es una invitacion". Por eso el
 * descarte NO se persiste como evento asociado a la invitacion, donde el lider
 * podria verlo: vive aqui, donde su conexion no llega.
 */
@Entity('membership_prefs')
export class MembershipPrefs {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'uuid' })
  membershipId!: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;

  /** El empleado silencia sugerencias hasta esta fecha. Su lider nunca lo sabe. */
  @Column({ type: 'timestamptz', nullable: true })
  ocultaSugerenciasHasta!: Date | null;

  /** Ranking: ±3 por defecto (Maestro §4.3). La tabla completa es opt-in explicito. */
  @Column({ type: 'boolean', default: false })
  verTablaCompleta!: boolean;

  /**
   * Añadido 14/09 — NO es una enmienda de R-07 (el ranking del §4.3 nunca
   * estuvo bajo esa regla: R-07 protege superficies de GESTIÓN, y el ranking
   * vive en la app del empleado, entre pares, nunca en gerencia/líder). Es
   * un control más granular que `verTablaCompleta`, pedido por Alim: la
   * persona puede seguir jugando (ganar Oro, XP) sin aparecer en el ranking
   * de nadie ni ver el suyo. `true` por defecto porque el ranking mismo ya
   * es un opt-in de facto — quien nunca lo toca participa con el ±3 estándar,
   * como dice el Maestro.
   */
  @Column({ type: 'boolean', default: true })
  participaEnRanking!: boolean;

  /**
   * 17/09/26 — el beneficio que la persona marco como "lo quiero". Uno a la
   * vez; marcar otro reemplaza al anterior.
   *
   * Vive aqui y no en `memberships` por la misma razon que el resto de esta
   * tabla: `membership_prefs` es una de las tres que gerencia, lider y la
   * vista interna NO pueden leer. Que alguien este ahorrando para "Medio dia
   * libre" no es un dato de gestion, y dejarlo donde una superficie de gestion
   * pueda alcanzarlo seria confiar en que nadie escriba el SELECT equivocado.
   * Aqui no hace falta confiar.
   */
  @Column({ type: 'uuid', nullable: true })
  objetivoItemId!: string | null;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @OneToOne(() => Membership, (m) => m.prefs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'membershipId' })
  membership!: Relation<Membership>;
}

/**
 * INVITACIONES — cómo entra una persona a una empresa (16/09/26).
 *
 * Hasta hoy no existía registro: los usuarios de prueba se sembraban con
 * scripts. Este es el único camino de alta que construyo, y es por
 * invitación a propósito:
 *
 *  - Levelop (equipo interno) da de alta la EMPRESA y emite la primera
 *    invitación (rol `admin_tenant`) para el dueño/gerente. Venta directa,
 *    Programa Fundadores: no hay auto-registro público de empresas.
 *  - Gerencia/admin de la empresa invita a su gente: correo + rol + área +
 *    zona. La persona abre el link, pone su nombre y su contraseña, y queda
 *    como membresía activa. La contraseña la escribe ella — nunca pasa por
 *    gerencia ni por Levelop.
 *  - Si el correo YA existe como usuario (trabaja en otra empresa cliente),
 *    la invitación no crea otro usuario: le pide su contraseña de siempre y
 *    le agrega la membresía. Es la decisión del 06/08 (una persona, varias
 *    empresas) llevada al alta.
 *
 * El `token` es la invitación entera: quien lo tiene puede aceptarla. Por eso
 * es aleatorio (24 bytes), único, caduca (14 días) y se consume una sola vez
 * (`aceptadaAt`). Anular = adelantar `expiraAt` a ahora; no se borra, para
 * que quede el rastro de quién invitó a quién.
 */
@Entity('invitations')
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ type: 'text' })
  email!: string;

  @Column({ type: 'text', default: RolMembership.EMPLEADO })
  rol!: RolMembership;

  @Column({ type: 'uuid', nullable: true })
  areaId!: string | null;

  /** Si viene null se usa `tenants.zonaDefault` al aceptar. */
  @Column({ type: 'text', nullable: true })
  zona!: string | null;

  @Index({ unique: true })
  @Column({ type: 'text' })
  token!: string;

  /** Quién invitó: una membresía de gerencia, o el equipo Levelop (interno). Uno de los dos. */
  @Column({ type: 'uuid', nullable: true })
  creadaPorMembershipId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  creadaPorInternalUserId!: string | null;

  @Column({ type: 'timestamptz' })
  expiraAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  aceptadaAt!: Date | null;

  @Column({ type: 'uuid', nullable: true })
  aceptadaMembershipId!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}

/** El equipo Levelop. Nunca son miembros de un tenant: ven la vista interna, no un cliente. */
@Entity('internal_users')
export class InternalUser {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'text' })
  email!: string;

  @Column({ type: 'text', select: false })
  passwordHash!: string;

  @Column({ type: 'text' })
  nombre!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
