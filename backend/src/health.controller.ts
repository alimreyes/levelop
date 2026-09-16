import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PerfilConexion } from './common/enums';

/**
 * `GET /api/v1/health` — para Railway (healthcheck del despliegue) y para
 * saber de un vistazo si el backend está arriba y llega a Postgres. Sin
 * auth a propósito: no devuelve nada que no sea "estoy vivo". No expone
 * versión de Node, variables, ni nombres de tablas.
 */
@Controller('health')
export class HealthController {
  constructor(@InjectDataSource(PerfilConexion.APP) private readonly ds: DataSource) {}

  @Get()
  async health() {
    let db = 'ok';
    try {
      await this.ds.query('SELECT 1');
    } catch {
      db = 'sin conexion';
    }
    return { ok: db === 'ok', db, at: new Date().toISOString() };
  }
}
