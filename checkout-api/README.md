# checkout-api

Backend del flujo de checkout: catálogo de productos, clientes, entregas y transacciones de pago. Construido con [NestJS](https://nestjs.com/) + [TypeORM](https://typeorm.io/) sobre PostgreSQL, siguiendo **Arquitectura Hexagonal (Ports & Adapters)** y **Railway Oriented Programming (ROP)** para los casos de uso.

Para la visión general del proyecto (flujo completo, modelo de datos, resultados de cobertura, links de despliegue) ver el [README raíz](../README.md).

## Arquitectura

Cada módulo de dominio (`products`, `customers`, `deliveries`, `transactions`) se organiza en capas:

```
<module>/
  domain/           # Entidades, value objects, puertos (interfaces) y errores de dominio
  application/       # Casos de uso — orquestan el dominio, sin conocer HTTP ni la DB
  infrastructure/    # Adaptadores concretos (repositorios TypeORM, cliente HTTP del gateway de pago)
  presentation/       # DTOs de entrada/salida (class-validator + Swagger)
  *.controller.ts     # Capa HTTP — delega todo a los casos de uso
  *.module.ts
```

La lógica de negocio nunca vive en los controllers: cada caso de uso (`CreateTransactionUseCase`, `GetTransactionByIdUseCase`, etc.) es una clase inyectable independiente de NestJS/HTTP, y depende de **puertos** (interfaces) en vez de implementaciones concretas — por ejemplo `TransactionRepositoryPort` y `PaymentGatewayPort`, con sus adaptadores (`TransactionTypeOrmRepository`, `PaymentGatewayAdapter`) inyectados por token (`TRANSACTION_REPOSITORY`, `PAYMENT_GATEWAY`).

**ROP**: los casos de uso devuelven `Result<T, E>` (`src/shared/core/result.ts`) en vez de lanzar excepciones para errores de negocio esperables (producto sin stock, datos inválidos, transacción no encontrada). Los controllers traducen `Result.fail` al código HTTP correcto (400/404); las excepciones reales quedan para fallos verdaderamente inesperados.

## Modelo de datos

Ver [README raíz § Modelo de datos](../README.md#modelo-de-datos).

## Requisitos

- Node.js 22+
- PostgreSQL 14+ (local, Docker, o RDS)

## Variables de entorno

Copiar `.env.example` a `.env` y completar:

| Variable | Descripción |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexión a Postgres |
| `DB_SSL` | `true` en RDS/producción (Postgres administrado exige TLS por defecto); `false` en local |
| `CORS_ORIGIN` | Origen permitido (URL del frontend) |
| `PORT` | Puerto HTTP (por defecto 3000) |
| `PAYMENT_GATEWAY_BASE_URL` | URL base del sandbox UAT del proveedor de pagos |
| `PAYMENT_GATEWAY_PUBLIC_KEY` / `PAYMENT_GATEWAY_PRIVATE_KEY` / `PAYMENT_GATEWAY_INTEGRITY_SECRET` | Credenciales del sandbox |

La base de datos se sincroniza automáticamente en arranque (`synchronize: true`) y se siembra con productos de prueba — no hace falta correr migraciones ni crear un endpoint de creación de productos.

## Instalación y ejecución

```bash
npm install
npm run start:dev   # desarrollo, con watch
npm run build        # compila a dist/
npm run start:prod   # producción (node dist/main)
```

## Tests

Suite unitaria con **Jest**, mockeando manualmente los puertos (sin tocar una base de datos real).

```bash
npm run test        # unit tests
npm run test:cov     # con reporte de cobertura
```

**Resultado más reciente: 25 test suites / 112 tests, todos en verde.**

| Métrica | Cobertura |
|---|---|
| Statements | 99.63% |
| Branches | 86.17% |
| Functions | 97.46% |
| Lines | 99.59% |

(Umbral mínimo exigido en `jest.config.ts`: 80% en las 4 métricas.)

`@nestjs/common`, `@nestjs/config`, `@nestjs/typeorm` y `@nestjs/swagger` se mockean en `test/mocks/` porque se publican como ESM puro y rompen la transformación de `ts-jest` en capas profundas del paquete — los stubs solo exponen los símbolos (decoradores, `ConfigService`, etc.) que el código realmente usa.

## Documentación de la API (Swagger)

Con el servidor corriendo:

- UI interactiva: `/api-docs`
- Spec OpenAPI (JSON): `/api-docs-json`

En el despliegue actual: **https://d322kj1aam7vzd.cloudfront.net/api-docs**

## Seguridad

- **Tokenización de tarjeta 100% en el navegador**: el frontend cifra los datos de tarjeta (JWE, RSA-OAEP-256 + A256GCM) antes de que salgan del cliente. Este backend nunca recibe ni procesa un número de tarjeta en texto plano — el endpoint `POST /tokenization/card` solo reenvía el payload ya cifrado al proveedor de pagos (existe porque su sandbox UAT no habilita CORS para llamadas directas desde el navegador).
- **Transición de estado atómica**: `transitionFromPending` actualiza con `WHERE status = 'PENDING'`, así que si dos requests concurrentes (p. ej. dos polls simultáneos del frontend) intentan resolver la misma transacción, solo una afecta una fila — evita decrementar stock dos veces por la misma compra.
- **Conexión a RDS forzada por TLS** (`DB_SSL=true` en producción).
