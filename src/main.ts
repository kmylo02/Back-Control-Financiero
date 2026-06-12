import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();

  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (_req: any, res: any) => {
    res.json({ status: 'ok', ts: new Date().toISOString(), v: '1.3.0' });
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application running on: http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();
