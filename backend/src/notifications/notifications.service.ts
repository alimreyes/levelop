import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { PerfilConexion, TipoNotificacion } from '../common/enums';
import { Notification } from './notifications.entities';

/**
 * Emisor de notificaciones — MVP por polling, ver `TipoNotificacion` en
 * `common/enums.ts` para el porqué de no-WebSocket-todavía.
 *
 * `emitir()` toma un `EntityManager`, no un repo fijo, a propósito: cuando se
 * llama desde dentro de una transacción existente (p. ej.
 * `RedemptionsService.confirmar()`), pasar el `m` de esa transacción hace que
 * la notificación viva o muera con el mismo commit que el evento que la
 * origina — nunca queda una notificación de "tu canje fue confirmado" si el
 * `UPDATE` que lo confirmó terminó revertido por otra razón. Cuando no hay
 * una transacción abierta (p. ej. `MissionsController.crear()`, que hace un
 * `repo.save()` simple), se le pasa `this.ds.manager`, que es un
 * `EntityManager` válido para una escritura suelta.
 */
@Injectable()
export class NotificationsService {
  constructor(@InjectDataSource(PerfilConexion.APP) private readonly ds: DataSource) {}

  get manager(): EntityManager {
    return this.ds.manager;
  }

  async emitir(
    m: EntityManager,
    p: {
      tenantId: string;
      membershipId: string;
      tipo: TipoNotificacion;
      mensaje: string;
      refTipo?: string;
      refId?: string;
    },
  ): Promise<void> {
    await m.getRepository(Notification).save(
      m.getRepository(Notification).create({
        tenantId: p.tenantId,
        membershipId: p.membershipId,
        tipo: p.tipo,
        mensaje: p.mensaje,
        refTipo: p.refTipo ?? null,
        refId: p.refId ?? null,
        leida: false,
      }),
    );
  }

  async listar(
    tenantId: string,
    membershipId: string,
    soloNoLeidas: boolean,
  ): Promise<Notification[]> {
    const where: Record<string, unknown> = { tenantId, membershipId };
    if (soloNoLeidas) where.leida = false;
    return this.ds.getRepository(Notification).find({
      where,
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async marcarLeida(tenantId: string, membershipId: string, id: string): Promise<void> {
    // Scoped por tenantId Y membershipId a la vez — nadie puede marcar como
    // leída una notificación ajena adivinando el UUID.
    await this.ds.query(
      `UPDATE notifications SET leida = true
        WHERE id = $1 AND "tenantId" = $2 AND "membershipId" = $3`,
      [id, tenantId, membershipId],
    );
  }
}
