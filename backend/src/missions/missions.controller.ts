import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CurrentMembership } from '../auth/current-membership.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantMembershipGuard } from '../auth/tenant-membership.guard';
import { EstadoMision, PerfilConexion, TipoNotificacion } from '../common/enums';
import { EconomyService, EventoRechazado } from '../economy/economy.service';
import { Area, Membership } from '../identity/identity.entities';
import { NotificationsService } from '../notifications/notifications.service';
import { Mission } from './missions.entities';
import { CerrarMisionDto, CrearMisionDto } from './missions.dto';

/**
 * Superficie: app del empleado. Conexión `app` — el rol con menos privilegios
 * de los cuatro, y el único que este controlador usa.
 *
 * Todavía no cubre: edición de misión, cancelación, ni el hilo de mensajes
 * (`mission_thread_messages`, que además es tabla prohibida para gerencia/líder
 * por R-07 — aquí sí se podría leer/escribir porque el dueño de esta conexión
 * es el propio empleado, pero no lo escribí en esta pasada).
 */
@Controller('tenants/:tenantId/missions')
@UseGuards(JwtAuthGuard, TenantMembershipGuard)
export class MissionsController {
  constructor(
    @InjectDataSource(PerfilConexion.APP) private readonly ds: DataSource,
    private readonly economy: EconomyService,
    private readonly notificaciones: NotificationsService,
  ) {}

  /**
   * Pedido de Alim 14/09: "que se vean todas las misiones, como Asana, con
   * filtro para ver solo las propias" — antes solo devolvía lo mío + lo
   * abierto. `?propias=true` conserva el comportamiento viejo para quien lo
   * quiera; el default ahora es ver toda la carga de la empresa, para que
   * alguien libre pueda ofrecerse a una misión que no es suya.
   */
  @Get()
  async listar(@CurrentMembership() m: Membership, @Query('propias') propias?: string) {
    const repo = this.ds.getRepository(Mission);
    if (propias === 'true') {
      return repo.find({
        where: [
          { tenantId: m.tenantId, creadorMembershipId: m.id },
          { tenantId: m.tenantId, asignadoMembershipId: m.id },
          { tenantId: m.tenantId, aceptadaPorMembershipId: m.id },
        ],
        order: { createdAt: 'DESC' },
        take: 100,
      });
    }
    return repo.find({
      where: { tenantId: m.tenantId },
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }

  @Post()
  async crear(@CurrentMembership() m: Membership, @Body() dto: CrearMisionDto) {
    const repo = this.ds.getRepository(Mission);
    const areaId = dto.areaId ?? m.areaId;
    const mision = await repo.save(
      repo.create({
        tenantId: m.tenantId,
        titulo: dto.titulo,
        descripcion: dto.descripcion ?? null,
        creadorMembershipId: m.id,
        areaId,
        asignadoMembershipId: dto.asignadoMembershipId ?? null,
        enlaces: dto.enlaces ?? [],
        urgencia: dto.urgencia,
        importancia: dto.importancia,
        esfuerzo: dto.esfuerzo,
        fechaLimite: dto.fechaLimite ?? null,
        estado: EstadoMision.ABIERTA,
      }),
    );

    // Avisos, mejor esfuerzo: si esto falla, la misión ya se guardó — no vale
    // la pena tumbar la creación por un aviso que no llegó. Dos destinatarios
    // posibles, no excluyentes: el líder del área (siempre que exista un área
    // y tenga líder asignado) y la persona sugerida explícitamente.
    try {
      if (areaId) {
        const area = await this.ds.getRepository(Area).findOne({ where: { id: areaId } });
        if (area?.liderMembershipId && area.liderMembershipId !== m.id) {
          await this.notificaciones.emitir(this.notificaciones.manager, {
            tenantId: m.tenantId,
            membershipId: area.liderMembershipId,
            tipo: TipoNotificacion.MISION_CREADA,
            mensaje: `Nueva misión en tu área: "${mision.titulo}"`,
            refTipo: 'mission',
            refId: mision.id,
          });
        }
      }
      if (dto.asignadoMembershipId && dto.asignadoMembershipId !== m.id) {
        await this.notificaciones.emitir(this.notificaciones.manager, {
          tenantId: m.tenantId,
          membershipId: dto.asignadoMembershipId,
          tipo: TipoNotificacion.MISION_SUGERIDA,
          mensaje: `Te sugirieron para la misión "${mision.titulo}"`,
          refTipo: 'mission',
          refId: mision.id,
        });
      }
    } catch (e) {
      // best-effort — no se relanza
    }

    return mision;
  }

  @Post(':id/aceptar')
  async aceptar(
    @CurrentMembership() m: Membership,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const repo = this.ds.getRepository(Mission);
    const mision = await repo.findOne({ where: { id, tenantId: m.tenantId } });
    if (!mision) throw new NotFoundException('Misión no encontrada');
    if (mision.estado !== EstadoMision.ABIERTA) {
      throw new BadRequestException('La misión ya no está abierta');
    }
    mision.estado = EstadoMision.ACEPTADA;
    mision.aceptadaPorMembershipId = m.id;
    mision.aceptadaAt = new Date();
    const guardada = await repo.save(mision);

    if (mision.creadorMembershipId !== m.id) {
      try {
        await this.notificaciones.emitir(this.notificaciones.manager, {
          tenantId: m.tenantId,
          membershipId: mision.creadorMembershipId,
          tipo: TipoNotificacion.MISION_ACEPTADA,
          mensaje: `Alguien aceptó tu misión "${mision.titulo}"`,
          refTipo: 'mission',
          refId: mision.id,
        });
      } catch (e) { /* best-effort */ }
    }

    return guardada;
  }

  /**
   * Cierre de misión. El cálculo de XP/Oro vive en EconomyService, no aquí —
   * una regla económica escrita en un controlador es una sugerencia, no una
   * regla (ver el comentario original en el servicio).
   */
  @Post(':id/cerrar')
  async cerrar(
    @CurrentMembership() m: Membership,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CerrarMisionDto,
  ) {
    const repo = this.ds.getRepository(Mission);
    const mision = await repo.findOne({ where: { id, tenantId: m.tenantId } });
    if (!mision) throw new NotFoundException('Misión no encontrada');
    if (mision.estado === EstadoMision.CERRADA) {
      throw new BadRequestException('La misión ya está cerrada');
    }

    try {
      const resultado = await this.economy.registrarMisionCerrada(
        mision,
        m,
        dto.clientOccurredAt,
      );
      mision.estado = EstadoMision.CERRADA;
      mision.cerradaAt = new Date();
      await repo.save(mision);

      if (mision.creadorMembershipId !== m.id) {
        try {
          await this.notificaciones.emitir(this.notificaciones.manager, {
            tenantId: m.tenantId,
            membershipId: mision.creadorMembershipId,
            tipo: TipoNotificacion.MISION_CERRADA,
            mensaje: `Se cerró tu misión "${mision.titulo}" — ${resultado.oroOtorgado} Oro otorgado`,
            refTipo: 'mission',
            refId: mision.id,
          });
        } catch (e) { /* best-effort */ }
      }

      return resultado;
    } catch (e) {
      if (e instanceof EventoRechazado) {
        throw new BadRequestException({ motivoRechazo: e.motivo });
      }
      throw e;
    }
  }
}
