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
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : [];

  const allowedOrigins = [
    'http://localhost:3001', // Web frontend (development)
    'http://localhost:19006', // Mobile frontend (Expo)
    process.env.FRONTEND_URL,
    ...corsOrigins,
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
  // Listen on 0.0.0.0 to accept connections from anywhere (required for cloud platforms)
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server running on port ${port}/v1`);
}

bootstrap();
