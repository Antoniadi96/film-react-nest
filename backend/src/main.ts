import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import 'dotenv/config';
import { LoggerFactory } from './logger/logger.factory';
import { NestExpressApplication } from '@nestjs/platform-express'; // Добавить
import { join } from 'path'; // Добавить

async function bootstrap() {
  // Укажите тип NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule.forRoot(),
    {
      bufferLogs: true,
    },
  );

  // Добавьте эту строку для раздачи статических файлов
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/content/',
  });

  // Устанавливаем глобальный префикс для API
  app.setGlobalPrefix('api/afisha');

  // Настраиваем CORS
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost',
    ],
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

  // Настраиваем валидацию
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

  // Создаем и устанавливаем кастомный логгер
  const logger = LoggerFactory.createLogger();
  app.useLogger(logger);

  const port = process.env.PORT || 3000;

  // Логируем информацию о запуске
  logger.log(`Starting application on port ${port}...`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`Logger type: ${process.env.LOGGER_TYPE || 'dev'}`);
  logger.log(`Database driver: ${process.env.DATABASE_DRIVER || 'mongodb'}`);

  await app.listen(port);

  // Выводим информацию о запуске в выбранном формате логгера
  logger.log('=======================================');
  logger.log('🎬 Film! Application');
  logger.log(`Backend: http://localhost:${port}`);
  logger.log('Frontend: http://localhost:5173');
  logger.log(`API: http://localhost:${port}/api/afisha`);
  logger.log(`Database: ${process.env.DATABASE_DRIVER || 'mongodb'}`);
  logger.log(`Logger: ${process.env.LOGGER_TYPE || 'dev'}`);
  logger.log('=======================================');
}
bootstrap();
