import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfilConexion } from './common/enums';
import { opcionesPara } from './config/typeorm.config';
import { EconomyService } from './economy/economy.service';
import { EconomyController } from './economy/economy.controller';
import { RedemptionsService } from './benefits/redemptions.service';
import { RedemptionsController } from './benefits/redemptions.controller';
import { MissionsController } from './missions/missions.controller';
import { AuthModule } from './auth/auth.module';
import { GerenciaController } from './backoffice/gerencia.controller';
import { LiderController } from './backoffice/lider.controller';
import { InternoController } from './backoffice/interno.controller';
import { NotificationsService } from './notifications/notifications.service';
import { NotificationsController } from './notifications/notifications.controller';
import { MembersController } from './identity/members.controller';
import { HealthController } from './health.controller';

/**
 * Los cuatro DataSources registrados como conexiones con nombre.
 *
 * Un modulo pide la conexion de su superficie con
 * `@InjectDataSource(PerfilConexion.BACKOFFICE)`, y esa conexion no puede leer lo
 * que R-07 le prohibe. Ver `config/typeorm.config.ts` y la migracion inicial.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(opcionesPara(PerfilConexion.APP)),
    TypeOrmModule.forRoot(opcionesPara(PerfilConexion.BACKOFFICE)),
    TypeOrmModule.forRoot(opcionesPara(PerfilConexion.LIDER)),
    TypeOrmModule.forRoot(opcionesPara(PerfilConexion.INTERNO)),
    AuthModule,
  ],
  controllers: [
    MissionsController,
    EconomyController,
    RedemptionsController,
    GerenciaController,
    LiderController,
    InternoController,
    NotificationsController,
    MembersController,
    HealthController,
  ],
  providers: [EconomyService, RedemptionsService, NotificationsService],
  exports: [EconomyService, RedemptionsService, NotificationsService],
})
export class AppModule {}
