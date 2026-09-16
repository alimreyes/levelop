import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  /**
   * CORS.
   *
   * `credentials` va en false a propósito y no es un descuido: el JWT viaja en
   * el header `Authorization`, no en una cookie, así que el navegador no
   * necesita mandar credenciales. Dejarlo en true obligaría a listar orígenes
   * exactos (el comodín es inválido con credenciales) sin ganar nada.
   *
   * Si `CORS_ORIGIN` está definido, manda esa lista y solo esa. Si no está
   * —desarrollo— se refleja el origen que venga, incluido el `null` que manda
   * Chrome cuando el HTML se abre como archivo local (`file://`), que es
   * exactamente como Alim está probando los 4 prototipos hoy. **En producción
   * hay que definir `CORS_ORIGIN`**; está anotado en `.env.example`.
   */
  const origenes = process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()).filter(Boolean);
  app.enableCors({
    origin: origenes && origenes.length ? origenes : true,
    credentials: false,
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  new Logger('bootstrap').log(`Levelop backend escuchando en :${port}`);
}

bootstrap();
