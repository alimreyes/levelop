/**
 * Enums del dominio de Levelop.
 *
 * Todos en un solo archivo a proposito: la leccion del handoff anterior fue que
 * dos convenciones distintas conviviendo (carpetas planas vs. modulares, enums
 * en ingles vs. en espanol) nunca compilaron juntas. Aqui hay una sola fuente.
 *
 * Convencion decidida y documentada: valores en espanol, porque el frontend que
 * ya existe los usa asi y traducirlos ahora es cambiar dos lados por nada.
 */

// --- Identidad y tenancy -----------------------------------------------------

export enum RolMembership {
  EMPLEADO = 'empleado',
  LIDER_AREA = 'lider_area',
  GERENCIA = 'gerencia',
  ADMIN_TENANT = 'admin_tenant',
}

export enum EstadoTenant {
  ONBOARDING = 'onboarding',
  ACTIVO = 'activo',
  SUSPENDIDO = 'suspendido',
}

// --- Misiones ----------------------------------------------------------------

export enum NivelTri {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
}

export enum NivelEsfuerzo {
  BAJO = 'bajo',
  MEDIO = 'medio',
  ALTO = 'alto',
}

export enum EstadoMision {
  BORRADOR = 'borrador',
  ABIERTA = 'abierta',
  ACEPTADA = 'aceptada',
  EN_PROGRESO = 'en_progreso',
  ENTREGADA = 'entregada',
  CERRADA = 'cerrada',
  CANCELADA = 'cancelada',
}

// --- Economia ----------------------------------------------------------------

export enum TipoEventoEconomia {
  XP_GANADA = 'XP_GANADA',
  ORO_GANADO = 'ORO_GANADO',
  ORO_GASTADO = 'ORO_GASTADO',
  ORO_CADUCADO = 'ORO_CADUCADO',
  ORO_REVERTIDO = 'ORO_REVERTIDO',
}

export enum MotivoEvento {
  MISION_CERRADA = 'MISION_CERRADA',
  CANJE = 'CANJE',
  DECAY_90D = 'DECAY_90D',
  REVERSION = 'REVERSION',
  AJUSTE_ADMIN = 'AJUSTE_ADMIN',
}

/**
 * Motivos de rechazo TIPIFICADOS.
 *
 * Se los debo al PD desde el 06/08 (canal CTO-PD, MSG-003). Yo iba a devolver un
 * 409 generico para todo, y su argumento me cambio el diseno: con un codigo unico
 * el PD tiene que escribir copy vago, y en un sistema donde el Oro vale algo, un
 * mensaje vago se lee como "me robaron".
 */
export enum MotivoRechazo {
  DUPLICADO = 'DUPLICADO',
  CAP_DIARIO = 'CAP_DIARIO',
  DERIVA_RELOJ = 'DERIVA_RELOJ',
  TENANT_INVALIDO = 'TENANT_INVALIDO',
  SALDO_INSUFICIENTE = 'SALDO_INSUFICIENTE',
  CUPO_AGOTADO = 'CUPO_AGOTADO',
  ZONA_NO_APLICA = 'ZONA_NO_APLICA',
  ITEM_INACTIVO = 'ITEM_INACTIVO',
  OPT_OUT_ACTIVO = 'OPT_OUT_ACTIVO',
}

// --- Beneficios y canje ------------------------------------------------------

export enum FamiliaBeneficio {
  TIEMPO = 'tiempo',
  IMPULSOS = 'impulsos',
  CONSUMO = 'consumo',
  ALIADOS = 'aliados',
}

/**
 * Maquina de estados del canje. Seis estados de fallo, no cinco: CUPO_AGOTADO
 * en carrera lo agregue yo en la mesa del MVP y sostengo que sera el mas
 * frecuente de todos. Dos personas canjeando el ultimo cupo del mes al mismo
 * tiempo no es un caso borde, es un martes.
 */
export enum EstadoCanje {
  SOLICITADO = 'SOLICITADO',
  RESERVADO = 'RESERVADO',
  CONFIRMADO = 'CONFIRMADO',
  RECHAZADO = 'RECHAZADO',
  /** No sabemos si ocurrio. No es error ni exito. Solo aplica a providers externos. */
  INDETERMINADO = 'INDETERMINADO',
  REVERTIDO = 'REVERTIDO',
}

export enum ProviderCanje {
  /** Unico provider real hoy: RRHH aprueba, entrega fuera de banda, adjunta evidencia. */
  MANUAL = 'MANUAL',
}

// --- «Quien necesita una mano» (excepcion a R-07, Maestro §6.1) --------------

/**
 * Seis patrones. Uno se llama SISTEMA_NO_SABE a proposito: cuando todo cae a la
 * vez, el panel se declara incompetente en vez de inventar un diagnostico.
 *
 * Salvaguarda 1: esto es una lista de PATRONES, no de personas. El panel no dice
 * "Rafael va mal"; dice "entrega tarde pero le aprueban todo — sus fechas estan
 * mal puestas", y propone revisar las fechas, no al tipo.
 */
export enum PatronAyuda {
  FECHAS_MAL_PUESTAS = 'FECHAS_MAL_PUESTAS',
  CARGA_DESBALANCEADA = 'CARGA_DESBALANCEADA',
  TRABAJA_SOLO = 'TRABAJA_SOLO',
  BLOQUEADO_POR_TERCEROS = 'BLOQUEADO_POR_TERCEROS',
  ARRANQUE_LENTO_TRAS_PAUSA = 'ARRANQUE_LENTO_TRAS_PAUSA',
  SISTEMA_NO_SABE = 'SISTEMA_NO_SABE',
}

export enum TipoInteraccionAyuda {
  CONVERSO = 'CONVERSO',
  AJUSTO_CARGA = 'AJUSTO_CARGA',
  AJUSTO_FECHAS = 'AJUSTO_FECHAS',
  SIN_ACCION = 'SIN_ACCION',
}

// --- Notificaciones ------------------------------------------------------------

/**
 * MVP por polling, no WebSocket — no hay infraestructura de tiempo real todavia
 * y no vale la pena montarla antes de saber si el patron de aviso (que dispara,
 * a quien) es el correcto. `GET /notifications` se puede llamar cada N segundos
 * desde el frontend; el dia que haga falta push real, la tabla no cambia, solo
 * como se entera el cliente de que hay una fila nueva.
 */
export enum TipoNotificacion {
  MISION_CREADA = 'MISION_CREADA',
  MISION_SUGERIDA = 'MISION_SUGERIDA',
  MISION_ACEPTADA = 'MISION_ACEPTADA',
  MISION_CERRADA = 'MISION_CERRADA',
  CANJE_CONFIRMADO = 'CANJE_CONFIRMADO',
  CANJE_REVERTIDO = 'CANJE_REVERTIDO',
  /** 17/09/26 — gerencia publicó un beneficio nuevo; le llega a toda la empresa. */
  BENEFICIO_NUEVO = 'BENEFICIO_NUEVO',
}

// --- Perfiles de conexion (R-07 estructural) ---------------------------------

/**
 * Cada superficie se conecta con un rol de Postgres distinto. Ver
 * `config/typeorm.config.ts` y la migracion inicial.
 */
export enum PerfilConexion {
  APP = 'app',
  BACKOFFICE = 'backoffice',
  LIDER = 'lider',
  INTERNO = 'interno',
}
