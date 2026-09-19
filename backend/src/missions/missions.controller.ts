import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { Mission, MissionCollaborator, MissionThreadMessage } from './missions.entities';
import { CerrarMisionDto, CrearMisionDto } from './missions.dto';

class MensajeHiloDto {
  @IsString() @MinLength(1) @MaxLength(2000) cuerpo!: string;
}

class ColaboradorDto {
  @IsUUID() membershipId!: string;
}

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
    const filas =
      propias === 'true'
        ? await repo.find({
            where: [
              { tenantId: m.tenantId, creadorMembershipId: m.id },
              { tenantId: m.tenantId, asignadoMembershipId: m.id },
              { tenantId: m.tenantId, aceptadaPorMembershipId: m.id },
            ],
            order: { createdAt: 'DESC' },
            take: 100,
          })
        : await repo.find({
            where: { tenantId: m.tenantId },
            order: { createdAt: 'DESC' },
            take: 200,
          });

    // 17/09 (pedido de Alim): "mostrar cuánto Oro y Experiencia da cada una
    // de las misiones". Se calcula con la MISMA fórmula y la MISMA
    // configuración que paga el cierre — una consulta de config, no N. Es
    // una estimación honesta: el Oro real al cerrar depende además de que la
    // haya aceptado otra persona (anti-cheat §3.3) y del juego encendido.
    const cfg = await this.economy.configDe(m.tenantId);
    return filas.map((mi) => {
      const r = this.economy.calcular(cfg, mi.urgencia, mi.importancia, mi.esfuerzo);
      return { ...mi, xpEstimada: r.xp, oroEstimado: r.oro };
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

  // ===========================================================================
  // HILO DE LA MISIÓN (19/09/26) — puntos 2 y 3 de «Cosas para conectar ahora»
  // ===========================================================================

  /**
   * El hilo de una misión, con el nombre de quien escribió cada mensaje.
   *
   * QUIÉN PUEDE LEERLO: cualquiera de la empresa, por decisión de Alim del
   * 19/09. Es coherente con cómo quedaron las misiones el 14/09 — todo el mundo
   * ve toda la carga de trabajo para poder ofrecerse a ayudar — y un hilo que
   * solo pueden leer los tres nombres que ya están en la misión no sirve para
   * que un cuarto se entere de que puede aportar.
   *
   * QUIÉN NO: gerencia y el líder de área, y no porque esta ruta los filtre.
   * `mission_thread_messages` es tabla prohibida para sus roles de Postgres
   * desde la migración inicial. Esta ruta corre sobre la conexión `app`, cuyo
   * dueño es el propio empleado. Si alguien —yo incluido— escribiera mañana un
   * `find()` de esta tabla dentro de un controlador de gerencia, la base
   * devolvería un error de permisos en vez de datos.
   *
   * El JOIN a `users` trae solo `nombre`: lo mismo que ya se ve en el listado
   * de compañeros. No hay email ni rol ni nada de economía.
   */
  @Get(':id/hilo')
  async hilo(@CurrentMembership() m: Membership, @Param('id', ParseUUIDPipe) id: string) {
    await this.misionDelTenant(m, id);
    return this.ds.query(
      `SELECT t.id, t."membershipId", t.cuerpo, t."createdAt", u.nombre AS autor
         FROM mission_thread_messages t
         JOIN memberships mem ON mem.id = t."membershipId"
         JOIN users u         ON u.id = mem."userId"
        WHERE t."missionId" = $1 AND t."tenantId" = $2
     ORDER BY t."createdAt" ASC`,
      [id, m.tenantId],
    );
  }

  /**
   * Escribir en el hilo. Solo en misiones vivas: en una cerrada el hilo queda
   * de solo lectura, porque una conversación que sigue creciendo después de
   * que el trabajo terminó ya no es sobre el trabajo.
   *
   * MENCIONES: se detectan los `@nombre` del cuerpo y se resuelven contra los
   * compañeros activos del tenant. El aviso que sale lleva quién mencionó y en
   * qué misión, NUNCA el texto del mensaje — ver el comentario de
   * `TipoNotificacion.MENCION` sobre por qué esa distinción importa.
   *
   * La resolución es por nombre completo o por primer nombre, sin acentos y sin
   * distinguir mayúsculas, y si un primer nombre es ambiguo (dos Marías) no se
   * notifica a ninguna: mandarle el aviso a la persona equivocada es peor que
   * no mandarlo, porque el que escribió cree que avisó.
   */
  @Post(':id/hilo')
  async escribirEnHilo(
    @CurrentMembership() m: Membership,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MensajeHiloDto,
  ) {
    const mision = await this.misionDelTenant(m, id);
    if (mision.estado === EstadoMision.CERRADA || mision.estado === EstadoMision.CANCELADA) {
      throw new BadRequestException('Esta misión ya está cerrada: el hilo queda solo para leer');
    }

    const repo = this.ds.getRepository(MissionThreadMessage);
    const msg = await repo.save(
      repo.create({
        tenantId: m.tenantId,
        missionId: id,
        membershipId: m.id,
        cuerpo: dto.cuerpo.trim(),
      }),
    );

    try {
      const mencionados = await this.resolverMenciones(m, dto.cuerpo);
      const yo = await this.nombreDe(m.id);
      for (const destino of mencionados) {
        if (destino === m.id) continue;
        await this.notificaciones.emitir(this.notificaciones.manager, {
          tenantId: m.tenantId,
          membershipId: destino,
          tipo: TipoNotificacion.MENCION,
          mensaje: `${yo} te mencionó en "${mision.titulo}"`,
          refTipo: 'mission',
          refId: id,
        });
      }
    } catch (e) {
      // best-effort: el mensaje ya se guardó, un aviso que no salió no lo borra
    }

    return msg;
  }

  /**
   * Borrar un mensaje. El propio, no el ajeno — ni siquiera gerencia puede
   * limpiar la conversación de otro, y de hecho gerencia no puede ni leerla.
   *
   * Sin ventana de tiempo: Alim pidió que se pudiera borrar, y ponerle un
   * cronómetro de cinco minutos a eso convierte «lo borré» en «llegaste tarde».
   *
   * Es un DELETE real, no un `borradoAt`. Dejar el texto en la base después de
   * que alguien lo borró sería guardarse lo que pidió eliminar. El GRANT que lo
   * permite se concedió en `1758400000000-HilosYColaboradores`, acotado a esta
   * tabla y a la conexión de la app.
   */
  @Delete(':id/hilo/:msgId')
  async borrarMensaje(
    @CurrentMembership() m: Membership,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('msgId', ParseUUIDPipe) msgId: string,
  ) {
    const r = await this.ds.query(
      `DELETE FROM mission_thread_messages
        WHERE id = $1 AND "missionId" = $2 AND "tenantId" = $3 AND "membershipId" = $4`,
      [msgId, id, m.tenantId, m.id],
    );
    // TypeORM devuelve [filas, cantidad] en un DELETE, igual que en un UPDATE.
    // El bug del 13/09 fue exactamente leer mal esta forma; aquí se lee bien.
    const borradas = Array.isArray(r) ? Number(r[1] ?? 0) : 0;
    if (!borradas) {
      throw new ForbiddenException('Solo puedes borrar tus propios mensajes');
    }
    return { ok: true };
  }

  // ===========================================================================
  // COLABORADORES DE LA MISIÓN (19/09/26) — «quién más está en cada misión»
  // ===========================================================================

  /**
   * Hasta hoy una misión tenía creador, sugerido y quien la aceptó, y nada más.
   * `mission_collaborators` existía desde el 01/09 y solo la llenaba el script
   * de la empresa de ejemplo, por base directa — o sea que en un cliente real
   * «quién trabaja con quién» estaba vacío y el panel del líder no tenía de
   * dónde sacar la colaboración.
   */
  @Get(':id/colaboradores')
  async colaboradores(@CurrentMembership() m: Membership, @Param('id', ParseUUIDPipe) id: string) {
    await this.misionDelTenant(m, id);
    return this.ds.query(
      `SELECT c.id, c."membershipId", u.nombre, a.nombre AS "areaNombre", c."createdAt"
         FROM mission_collaborators c
         JOIN memberships mem ON mem.id = c."membershipId"
         JOIN users u         ON u.id = mem."userId"
    LEFT JOIN areas a         ON a.id = mem."areaId"
        WHERE c."missionId" = $1 AND c."tenantId" = $2
     ORDER BY c."createdAt" ASC`,
      [id, m.tenantId],
    );
  }

  /**
   * Sumarse o sumar a alguien. Cualquiera de la empresa puede, igual que
   * cualquiera puede aceptar una misión abierta: el punto de mostrar toda la
   * carga es que alguien con tiempo se pueda meter.
   *
   * La UNIQUE `(missionId, membershipId)` impide el duplicado; se traduce a un
   * "ya está" en vez de un 500, porque sumar dos veces a la misma persona no es
   * un error del que haya que avisar con alarma.
   */
  @Post(':id/colaboradores')
  async agregarColaborador(
    @CurrentMembership() m: Membership,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ColaboradorDto,
  ) {
    const mision = await this.misionDelTenant(m, id);

    const esDelTenant = await this.ds.query(
      `SELECT 1 FROM memberships WHERE id = $1 AND "tenantId" = $2 AND activo`,
      [dto.membershipId, m.tenantId],
    );
    if (!esDelTenant.length) throw new NotFoundException('Esa persona no está en la empresa');

    const filas = await this.ds.query(
      `INSERT INTO mission_collaborators ("tenantId", "missionId", "membershipId")
       VALUES ($1, $2, $3)
       ON CONFLICT ("missionId", "membershipId") DO NOTHING
       RETURNING id`,
      [m.tenantId, id, dto.membershipId],
    );
    const nuevo = filas.length > 0;

    if (nuevo && dto.membershipId !== m.id) {
      try {
        const yo = await this.nombreDe(m.id);
        await this.notificaciones.emitir(this.notificaciones.manager, {
          tenantId: m.tenantId,
          membershipId: dto.membershipId,
          tipo: TipoNotificacion.COLABORADOR_AGREGADO,
          mensaje: `${yo} te sumó a la misión "${mision.titulo}"`,
          refTipo: 'mission',
          refId: id,
        });
      } catch (e) { /* best-effort */ }
    }

    return { ok: true, nuevo };
  }

  /** Quitar a alguien. Sin restricción de quién: sumar y quitar son simétricos. */
  @Delete(':id/colaboradores/:membershipId')
  async quitarColaborador(
    @CurrentMembership() m: Membership,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('membershipId', ParseUUIDPipe) membershipId: string,
  ) {
    await this.ds.getRepository(MissionCollaborator).delete({
      tenantId: m.tenantId,
      missionId: id,
      membershipId,
    });
    return { ok: true };
  }

  // ===========================================================================

  /** Una misión de MI tenant, o 404. Nunca se confía en el id que llega. */
  private async misionDelTenant(m: Membership, id: string): Promise<Mission> {
    const mision = await this.ds
      .getRepository(Mission)
      .findOne({ where: { id, tenantId: m.tenantId } });
    if (!mision) throw new NotFoundException('Esa misión no existe');
    return mision;
  }

  private async nombreDe(membershipId: string): Promise<string> {
    const r = await this.ds.query(
      `SELECT u.nombre FROM memberships mem JOIN users u ON u.id = mem."userId" WHERE mem.id = $1`,
      [membershipId],
    );
    return r?.[0]?.nombre ?? 'Alguien';
  }

  /**
   * `@nombre` → membresías. Ver la nota de `escribirEnHilo()` sobre por qué un
   * primer nombre ambiguo no notifica a nadie.
   */
  private async resolverMenciones(m: Membership, cuerpo: string): Promise<string[]> {
    const crudas = [...cuerpo.matchAll(/@([\p{L}][\p{L}\d_.'-]*(?:\s+[\p{L}][\p{L}\d_.'-]*)?)/gu)]
      .map((x) => x[1].trim())
      .filter(Boolean);
    if (!crudas.length) return [];

    const gente: Array<{ membershipId: string; nombre: string }> = await this.ds.query(
      `SELECT mem.id AS "membershipId", u.nombre
         FROM memberships mem JOIN users u ON u.id = mem."userId"
        WHERE mem."tenantId" = $1 AND mem.activo`,
      [m.tenantId],
    );

    const norm = (t: string) =>
      t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

    const encontrados = new Set<string>();
    for (const cruda of crudas) {
      const q = norm(cruda);
      // Nombre completo primero: es inequívoco cuando acierta.
      const exactos = gente.filter((g) => norm(g.nombre) === q);
      if (exactos.length === 1) {
        encontrados.add(exactos[0].membershipId);
        continue;
      }
      // Después el primer nombre, y solo si no hay dos personas que lo compartan.
      const porPrimero = gente.filter((g) => norm(g.nombre).split(/\s+/)[0] === q.split(/\s+/)[0]);
      if (porPrimero.length === 1) encontrados.add(porPrimero[0].membershipId);
    }
    return [...encontrados];
  }
}
