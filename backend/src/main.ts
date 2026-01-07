import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/afisha');

  // Разрешаем запросы с фронтенда
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], // оба порта
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
    exposedHeaders: ['Content-Disposition'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Добавляем простой корневой маршрут для проверки
  app.getHttpAdapter().get('/', (req, res) => {
    res.json({
      message: 'Film! API is running',
      api: 'http://localhost:3000/api/afisha',
      frontend: 'http://localhost:5173',
      endpoints: {
        films: 'GET /api/afisha/films',
        filmSchedule: 'GET /api/afisha/films/:id/schedule',
        createOrder: 'POST /api/afisha/order',
        staticFiles: 'GET /content/afisha/*',
      },
    });
  });

  await app.listen(3000);
  console.log('=======================================');
  console.log('Film! Application');
  console.log('Backend: http://localhost:3000');
  console.log('Frontend: http://localhost:5173');
  console.log('API: http://localhost:3000/api/afisha');
  console.log('=======================================');
}
bootstrap();
