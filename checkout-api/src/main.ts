import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' });
  app.use(
    helmet({
      // Swagger UI (/api-docs) carga estilos/scripts inline; con la CSP por
      // defecto de Helmet los bloquea y la página queda en blanco. El resto
      // de headers (HSTS, X-Content-Type-Options, X-Frame-Options, etc.) —
      // los que realmente importan para una API JSON — siguen activos.
      contentSecurityPolicy: false,
    }),
  );
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
      'API del flujo de checkout: productos, clientes, entregas y transacciones. ' +
        'La tokenización de tarjeta ocurre en el navegador (JWE); este backend solo reenvía el payload ya cifrado al proveedor de pagos.',
    )
    .setVersion('1.0')
    .addTag('products', 'Catálogo de productos')
    .addTag('customers', 'Datos del comprador asociados a una transacción')
    .addTag('deliveries', 'Datos de entrega asociados a una transacción')
    .addTag('transactions', 'Creación y consulta de transacciones de pago')
    .addTag('tokenization', 'Proxy hacia el proveedor de pagos para tokenizar tarjetas ya cifradas por el cliente')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, swaggerDocument);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
