import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security
  app.use(helmet());
  app.use(cookieParser());
  
  // CORS - Allow both web and mobile frontends
  const allowedOrigins = [
    'http://localhost:3001', // Web frontend
    'http://localhost:19006', // Mobile frontend (Expo)
    process.env.FRONTEND_URL,
  ].filter((origin): origin is string => Boolean(origin));

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  
  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  
  // API prefix
  app.setGlobalPrefix('v1');
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Server running on http://localhost:${port}/v1`);
}

bootstrap();
