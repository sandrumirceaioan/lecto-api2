import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get<ConfigService>(ConfigService);
  app.use(bodyParser.json({ limit: '100mb' }));

  // sets app main route
  app.setGlobalPrefix('api');

  // used for error global filter
  app.useGlobalFilters(new AllExceptionsFilter());
  
  // use for dto validation
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.useStaticAssets(join(__dirname, '../assets/logos'), { prefix: '/logos'});
  app.useStaticAssets(join(__dirname, '../assets/public/logos'), { prefix: '/logos'});
  app.useStaticAssets(join(__dirname, '../assets/public/banners'), { prefix: '/banners'});
  app.useStaticAssets(join(__dirname, '../assets/articles'), { prefix: '/thumbnails'});
  app.useStaticAssets(join(__dirname, '../assets/public/articles'), { prefix: '/thumbnails'});
  app.useStaticAssets(join(__dirname, '../assets/icons'), { prefix: '/icons'});

  const port = config.get('PORT');
  await app.listen(port || 3000);
}
bootstrap();
