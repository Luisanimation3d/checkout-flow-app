# checkout-flow-app

Aplicación full-stack de checkout: flujo completo de compra con pago con tarjeta de crédito, de 5 pantallas — **producto → datos de tarjeta/entrega → resumen → estado final → producto** — resiliente a refrescos de página, con más de 80% de cobertura de tests (Jest) en frontend y backend, y desplegada en AWS.

## Demo desplegada

| | URL |
|---|---|
| **Frontend** | https://d3cpsovor59rva.cloudfront.net |
| **API** | https://d322kj1aam7vzd.cloudfront.net |
| **Swagger (docs de la API)** | https://d322kj1aam7vzd.cloudfront.net/api-docs |

## Estructura del repo

```
checkout-api/     Backend — NestJS + TypeORM + PostgreSQL (ver checkout-api/README.md)
checkout-front/   Frontend — React + Redux Toolkit + Vite (ver checkout-front/README.md)
```

## El flujo

1. **Producto** — catálogo y detalle de producto (`GET /products`, `GET /products/:id`).
2. **Datos de tarjeta y entrega** — formulario con validación en cliente; la tarjeta se cifra (JWE) en el navegador antes de tocar la red.
3. **Resumen** — confirmación de los datos antes de pagar.
4. **Estado final** — se crea la transacción (`POST /transactions`) y se hace polling de su estado (`GET /transactions/:id`) hasta que el proveedor de pagos la resuelve (aprobada/rechazada).
5. **Vuelta a producto**.

Si el usuario refresca la página en cualquier punto de este flujo, lo recupera exactamente donde iba — el estado de Redux se persiste en `localStorage` en cada cambio (ver `checkout-front/src/store/persistence.ts`), redactando los datos sensibles de tarjeta antes de guardarlos.

## Arquitectura

- **Backend**: Arquitectura Hexagonal (Ports & Adapters) por módulo de dominio, con los casos de uso siguiendo Railway Oriented Programming (`Result<T, E>` en vez de excepciones para errores de negocio esperables). Detalle en [checkout-api/README.md](checkout-api/README.md).
- **Frontend**: Redux Toolkit como store obligatorio del enunciado, con persistencia manual (no `redux-persist`) para controlar exactamente qué campos se guardan y cuáles se redactan. Detalle en [checkout-front/README.md](checkout-front/README.md).
- **Tokenización de tarjeta**: ocurre 100% en el navegador (JWE, RSA-OAEP-256 + A256GCM vía `jose`). El backend actúa como proxy hacia el proveedor de pagos únicamente porque su sandbox UAT no habilita CORS para llamadas directas desde el navegador — en ningún momento recibe ni procesa datos de tarjeta en texto plano, lo que reduce significativamente el alcance de manejo de datos sensibles del lado del servidor.

## Modelo de datos

4 tablas en PostgreSQL, todas con `id: uuid` como PK generada por Postgres.

**products** — catálogo, sembrado con datos de prueba (sin endpoint de creación, según el enunciado)
| Columna | Tipo | Notas |
|---|---|---|
| title, description | string, text | |
| price | int | Unidad monetaria completa (ej. COP sin decimales), **no** centavos |
| currency | varchar(3) | |
| stock | int | Se decrementa solo cuando una transacción queda `APPROVED` |
| images | text[] | |
| delivery_fee | int | Tarifa base de envío del producto, antes de aplicar el multiplicador por ciudad |

**customers** — deduplicados por documento (`find-or-create`: si el `document_id` ya existe, se reutiliza el cliente en vez de duplicarlo)
| Columna | Tipo | Notas |
|---|---|---|
| full_name | string | |
| document_type | varchar(2) | `CC` \| `CE` \| `TI` \| `PA` |
| document_id | string | **unique** |
| phone | varchar(10) | |
| email | string | |

**deliveries** — una fila nueva por transacción
| Columna | Tipo | Notas |
|---|---|---|
| address, city, department | string | |
| status | string | `PENDING` \| `SHIPPED` \| `DELIVERED` (default `PENDING`) |

**transactions** — el registro central; referencia a las otras 3 tablas por id (sin FK declarativa a nivel de TypeORM, validada en el caso de uso)
| Columna | Tipo | Notas |
|---|---|---|
| reference | string | **unique**, generada por el backend (nunca la manda el cliente) |
| product_id, customer_id, delivery_id | uuid | |
| amount_in_cents | int | Recalculado siempre en el backend (`(price + BASE_FEE + deliveryFee) × 100`) — el frontend nunca decide cuánto se cobra |
| currency | varchar(3) | |
| status | string | `PENDING` \| `APPROVED` \| `DECLINED` \| `ERROR` |
| gateway_transaction_id | varchar, nullable | id de la transacción en el proveedor de pagos |
| status_message | varchar, nullable | |

La transición `PENDING → (APPROVED\|DECLINED\|ERROR)` se hace con un `UPDATE ... WHERE status = 'PENDING'` atómico (compare-and-swap a nivel de fila), para que dos requests concurrentes (p. ej. dos polls del frontend en simultáneo) no puedan decrementar el stock dos veces por la misma compra.

## Tests

Ambos proyectos usan **Jest** exclusivamente (requisito explícito del enunciado), con más del 80% de cobertura exigido por config (`coverageThreshold` en `jest.config.ts`/`jest.config.cjs`).

| | Suites | Tests | Statements | Branches | Functions | Lines |
|---|---|---|---|---|---|---|
| **Backend** (`checkout-api`) | 25 | 112 | 99.63% | 86.17% | 97.46% | 99.59% |
| **Frontend** (`checkout-front`) | 51 | 222 | 94.71% | 88.11% | 91.17% | 95.24% |

```bash
cd checkout-api && npm run test:cov
cd checkout-front && npm run test:cov
```

## Despliegue (AWS)

| Pieza | Servicio AWS | Detalle |
|---|---|---|
| Frontend (build estático) | S3 (bucket privado) + CloudFront | Origin Access Control — el bucket no es público, solo CloudFront puede leerlo. Rutas SPA (403/404) redirigen a `index.html`. |
| API | Elastic Beanstalk (instancia única, Node.js 22) | Sin balanceador de carga (fuera del free tier) |
| Base de datos | RDS PostgreSQL (`db.t3.micro`) | Red privada, solo alcanzable desde el security group de Elastic Beanstalk; conexión forzada por TLS |
| HTTPS de la API | CloudFront (segunda distribución) | Elastic Beanstalk de instancia única solo sirve HTTP; esta distribución expone HTTPS al navegador y habla HTTP puro con el origen internamente — patrón estándar para evitar el error de "contenido mixto" del navegador sin necesitar un balanceador con certificado |

Todo dentro del free tier de la cuenta (créditos + límites duros, sin cargos por exceder el free tier).

## Correr localmente

Ver instrucciones detalladas en [checkout-api/README.md](checkout-api/README.md) y [checkout-front/README.md](checkout-front/README.md). Resumen:

```bash
# Backend
cd checkout-api
cp .env.example .env   # completar credenciales del proveedor de pagos
npm install
npm run start:dev

# Frontend (en otra terminal)
cd checkout-front
cp .env.example .env
npm install
npm run dev
```
