import { NestFactory } from '@nestjs/core';
import { ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Отключаем автоматический body parser для multipart данных
  });

  // Безопасность
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  app.use(compression());

  // Middleware для обработки разных типов запросов
  app.use((req, res, next) => {
    // Проверяем Content-Type для multipart данных
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      // Для multipart данных не применяем JSON parser
      req.setTimeout(300000); // 5 минут
      res.setTimeout(300000); // 5 минут
      next();
    } else if (req.url.includes('/profiles/avatar/upload') || req.url.includes('/storage/upload')) {
      // Для загрузки файлов не применяем JSON parser
      req.setTimeout(300000); // 5 минут
      res.setTimeout(300000); // 5 минут
      next();
    } else {
      // Для остальных эндпоинтов применяем JSON parser
      express.json({ limit: '50mb' })(req, res, next);
    }
  });

  // Cookie parser
  app.use(cookieParser());


  // CORS - разрешаем все домены
  app.enableCors({
    origin: true, // Разрешаем все домены
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Cookie',
      'X-CSRF-Token',
      'X-API-Key',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Methods'
    ],
    exposedHeaders: ['Set-Cookie', 'X-Total-Count'],
    optionsSuccessStatus: 200, // Для поддержки старых браузеров
    preflightContinue: false, // Обрабатываем preflight запросы
  });

  // Дополнительная обработка preflight запросов
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cookie, X-CSRF-Token, X-API-Key');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.status(200).end();
      return;
    }
    next();
  });

  // Глобальный фильтр исключений
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Валидация
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    disableErrorMessages: false, // Всегда показываем детальные сообщения об ошибках
    exceptionFactory: (errors) => {
      const result = errors.map((error) => ({
        property: error.property,
        value: error.value,
        constraints: error.constraints,
      }));
      return new HttpException(
        {
          message: 'Validation failed',
          details: result,
        },
        HttpStatus.BAD_REQUEST,
      );
    },
  }));

  await app.listen(process.env.PORT ?? 3000);

  // Обработка сигналов завершения для корректного закрытия соединений
  process.on('SIGINT', async () => {
    console.log('🛑 Получен сигнал SIGINT, завершаем работу...');
    await app.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('🛑 Получен сигнал SIGTERM, завершаем работу...');
    await app.close();
    process.exit(0);
  });
}
bootstrap();
