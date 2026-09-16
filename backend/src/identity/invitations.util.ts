import { randomBytes } from 'crypto';

/** Días de vida de un link de invitación. Después, hay que emitir otro. */
export const INVITACION_DIAS = 14;

/**
 * 24 bytes aleatorios en base64url → 32 caracteres sin `+`, `/` ni `=`, así
 * el token viaja en una URL sin codificar. Lo genera el servidor, nunca el
 * cliente — misma razón que las claves de idempotencia: lo que genera el
 * cliente no es de fiar como credencial.
 */
export function nuevoTokenInvitacion(): string {
  return randomBytes(24).toString('base64url');
}

export function vencimientoInvitacion(): Date {
  return new Date(Date.now() + INVITACION_DIAS * 24 * 3600 * 1000);
}

/** Correo normalizado: la tabla tiene CHECK email = lower(email). */
export function normalizarEmail(email: string): string {
  return String(email || '').trim().toLowerCase();
}
