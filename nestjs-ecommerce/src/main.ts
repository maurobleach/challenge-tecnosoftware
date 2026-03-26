import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  app.enableCors({ origin: frontendUrl, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
