import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();

  // Swagger solo si se habilita explícitamente (SWAGGER_ENABLED=true): expone toda la superficie de la API.
  if (process.env.SWAGGER_ENABLED === 'true') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Control Financiero API')
      .setVersion('1.4.0')
      .addBearerAuth()
      .addSecurityRequirements('bearer')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', async (_req: any, res: any) => {
    const conn = app.get<Connection>(getConnectionToken());
    const dbOk = conn.readyState === 1;
    const payload = {
      status: dbOk ? 'ok' : 'degraded',
      db: dbOk ? 'connected' : 'disconnected',
      uptime: Math.floor(process.uptime()),
      ts: new Date().toISOString(),
      v: '1.4.0',
    };
    res.status(dbOk ? 200 : 503).json(payload);
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application running on: http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();
