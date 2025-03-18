import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './shared/transform/transform.interceptor';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import { KnexService } from './shared/db/knex.service';
import { AppLoggerService } from './shared/logger/app-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new TransformInterceptor()); //clean null values in JSON

  // CORS config
  const configService = app.get(ConfigService);
  const loggerService = app.get(AppLoggerService);
  const corsOrigins = configService
    .get<string>('CORS_ORIGINS', '')
    .split(',')
    .map((origin: string) => origin.trim())
    .filter((origin: string) => origin.length > 0);
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
  });
  if (corsOrigins.length > 0) {
    loggerService.log(`CORS enabled for ${corsOrigins.join(', ')}`);
  }

  // Initialize KnexService and run migrations before app starts
  const knexService = app.get(KnexService);
  await knexService.runMigrations();

  // Swagger
  // Warning SWAGGER_ROUTE must start with /
  if (
    configService.get<string>('SWAGGER_ROUTE', '') &&
    configService.get<string>('SWAGGER_USER', '') &&
    configService.get<string>('SWAGGER_PASSWORD', '')
  ) {
    app.use(
      // Basic Authentication middleware to the Swagger route
      [
        configService.get<string>('SWAGGER_ROUTE', ''),
        `${configService.get<string>('SWAGGER_ROUTE', '')}-json`,
      ],
      basicAuth({
        users: {
          [configService.get<string>('SWAGGER_USER', '')]:
            configService.get<string>('SWAGGER_PASSWORD', ''),
        },
        challenge: true, // enables the browser prompt
      }),
    );
    const config = new DocumentBuilder()
      .setTitle('Clients')
      .setDescription('The clients API description')
      .setVersion(require('../package.json').version)
      .build();
    const document = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(
      configService.get<string>('SWAGGER_ROUTE', ''),
      app,
      document,
      {
        swaggerOptions: {
          tagsSorter: 'alpha',
          operationsSorter: 'alpha',
          filter: true,
          filterOptions: {
            deepSearch: true,
          },
        },
      },
    );
  }

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
