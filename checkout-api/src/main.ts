import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new LoggingInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Checkout API')
    .setDescription(
      'API del flujo de checkout (Wompi FullStack Test): productos, clientes, entregas y transacciones. ' +
        'La tokenización de tarjeta ocurre en el navegador (JWE); este backend solo reenvía el payload ya cifrado a Wompi.',
    )
    .setVersion('1.0')
    .addTag('products', 'Catálogo de productos')
    .addTag('customers', 'Datos del comprador asociados a una transacción')
    .addTag('deliveries', 'Datos de entrega asociados a una transacción')
    .addTag('transactions', 'Creación y consulta de transacciones de pago')
    .addTag('tokenization', 'Proxy hacia Wompi para tokenizar tarjetas ya cifradas por el cliente')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, swaggerDocument);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
