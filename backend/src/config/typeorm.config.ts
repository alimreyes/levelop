import { DataSource, DataSourceOptions } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import { PerfilConexion } from '../common/enums';
import {
  Area,
  InternalUser,
  Invitation,
  Membership,
  MembershipPrefs,
  Tenant,
  User,
} from '../identity/identity.entities';
import {
  Mission,
  MissionCollaborator,
  MissionThreadMessage,
} from '../missions/missions.entities';
import {
  EconomyBalance,
  EconomyConfig,
  EconomyEvent,
} from '../economy/economy.entities';
import {
  BenefitCatalogItem,
  BenefitPriceVersion,
  BenefitStock,
  Redemption,
  RedemptionOutbox,
} from '../benefits/benefits.entities';
import {
  HelpInteraction,
  HelpSignal,
  HelpSignalHistory,
} from '../help/help.entities';
import { Notification } from '../notifications/notifications.entities';

loadEnv();

export const ENTIDADES = [
  Tenant, User, Membership, Area, MembershipPrefs, InternalUser, Invitation,
  Mission, MissionCollaborator, MissionThreadMessage,
  EconomyEvent, EconomyBalance, EconomyConfig,
  BenefitCatalogItem, BenefitPriceVersion, BenefitStock, Redemption, RedemptionOutbox,
  HelpSignal, HelpSignalHistory, HelpInteraction,
  Notification,
];

/**
 * `synchronize` NUNCA se enciende, ni en desarrollo.
 *
 * Fue la causa raiz del error que reventó el entorno anterior: TypeORM intento
 * migrar la tabla `tasks` de camelCase a snake_case sobre filas existentes y
 * fallo por un NOT NULL en `due_date`. Nunca se confirmo si el reset se ejecuto
 * antes de que se perdiera la laptop. Migraciones explicitas desde el dia uno.
 */
const BASE: Partial<DataSourceOptions> = {
  type: 'postgres',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  entities: ENTIDADES,
};

/**
 * =============================================================================
 * LOS CUATRO DATASOURCES — R-07 ESTRUCTURAL
 * =============================================================================
 *
 * Cada superficie se conecta con un rol de Postgres distinto. No es paranoia: es
 * lo que el CEO pidio cuando dijo que R-07 tiene que ser "imposible por el modelo
 * de datos, no una promesa escrita dentro del panel".
 *
 * La diferencia practica: con una sola conexion, que el BackOffice no muestre los
 * hilos de mision depende de que nadie escriba un `find()` de mas. Con cuatro, si
 * alguien lo escribe, Postgres devuelve un error de permisos y el bug se muere en
 * desarrollo en vez de convertirse en una filtracion en produccion.
 *
 * Regla para quien toque este codigo (yo incluido, dentro de tres meses):
 * un modulo de gerencia NUNCA inyecta el DataSource de la app "porque es mas
 * comodo". Si un endpoint de gerencia necesita un dato que su rol no puede leer,
 * la respuesta correcta es preguntarse si R-07 lo prohibe — casi siempre si.
 */
function url(perfil: PerfilConexion): string {
  const mapa: Record<PerfilConexion, string | undefined> = {
    [PerfilConexion.APP]: process.env.DB_ROLE_APP_URL,
    [PerfilConexion.BACKOFFICE]: process.env.DB_ROLE_BACKOFFICE_URL,
    [PerfilConexion.LIDER]: process.env.DB_ROLE_LIDER_URL,
    [PerfilConexion.INTERNO]: process.env.DB_ROLE_INTERNO_URL,
  };
  const u = mapa[perfil] ?? process.env.DATABASE_URL;
  if (!u) throw new Error(`Falta la URL de conexion para el perfil ${perfil}`);
  return u;
}

/**
 * SSL hacia Postgres (16/09/26, para el primer despliegue en Railway):
 * en producción va encendido (Railway lo soporta en su proxy público), pero
 * si el Postgres es alcanzado por la red interna de Railway y el servidor no
 * ofrece SSL, la conexión falla con "The server does not support SSL
 * connections". `DB_SSL=false` lo apaga sin tocar código. En local nunca va.
 */
function ssl(): false | { rejectUnauthorized: boolean } {
  if (process.env.DB_SSL === 'false') return false;
  if (process.env.DB_SSL === 'true') return { rejectUnauthorized: false };
  return process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false;
}

export function opcionesPara(perfil: PerfilConexion): DataSourceOptions {
  return {
    ...(BASE as DataSourceOptions),
    name: perfil,
    url: url(perfil),
    ssl: ssl(),
  } as DataSourceOptions;
}

/**
 * DataSource de migraciones — usa el rol dueno, no los cuatro restringidos.
 * Es el unico que puede crear y alterar tablas, y es el que usa la CLI.
 */
export default new DataSource({
  ...(BASE as DataSourceOptions),
  url: process.env.DATABASE_URL,
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'levelop_migrations',
  ssl: ssl(),
} as DataSourceOptions);
