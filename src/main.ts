import { NestFactory } from '@nestjs/core';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

import { QueryTransformPipe } from './common/pipes/query-transform.pipe';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔹 Prefixo Global
  app.setGlobalPrefix('api');

  // 🔹 Permite envio de cookies (CORS com credenciais)
  const corsOrigins = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || ['http://localhost:8080']; 
  console.log(corsOrigins);

  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
 
 
  // 🔹 Habilita cookie-parser (para ler cookies no request)
  app.use(cookieParser());

  // === Swagger ===
  const config = new DocumentBuilder()
    .setTitle('Sistema de Gerenciamento Ortho Care')
    .setDescription('API para controle de Pacientes, Médicos e Consultas.')
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 🔹 Validação global
  app.useGlobalPipes(
    new QueryTransformPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 API Listening on port ${port}.`);
  console.log(`📖 Swagger Docs available at ${await app.getUrl()}/api/docs`);
}
bootstrap();