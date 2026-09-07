# checkout-front

Frontend del flujo de checkout: página de producto → datos de tarjeta/entrega → resumen → estado final. Construido con **React 19 + TypeScript + Vite**, **Redux Toolkit** para el estado global, y persistencia en `localStorage` para sobrevivir a un refresh de página.

Para la visión general del proyecto (flujo completo, modelo de datos, resultados de cobertura, links de despliegue) ver el [README raíz](../README.md).

## Stack

- React 19 + React Router 7 (SPA)
- Redux Toolkit (`@reduxjs/toolkit`) — estado obligatorio del enunciado
- SCSS Modules
- `jose` para cifrado JWE de tarjeta en el navegador
- Jest + Testing Library

## Variables de entorno

Copiar `.env.example` a `.env`:

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base del backend (ej. `http://localhost:3000` en desarrollo) |

## Instalación y ejecución

```bash
npm install
npm run dev       # servidor de desarrollo (Vite)
npm run build      # build de producción a dist/
npm run preview    # sirve el build de producción localmente
```

## Tests

Suite con **Jest** (`babel-jest` + `jest-environment-jsdom`) — no Vitest, siguiendo el requisito explícito del enunciado de crear las pruebas con Jest tanto en frontend como en backend.

```bash
npm run test        # unit tests
npm run test:cov     # con reporte de cobertura
```

**Resultado más reciente: 51 test suites / 222 tests, todos en verde.**

| Métrica | Cobertura |
|---|---|
| Statements | 94.71% |
| Branches | 88.11% |
| Functions | 91.17% |
| Lines | 95.24% |

(Umbral mínimo exigido en `jest.config.cjs`: 80% en las 4 métricas.)

## Estado global y persistencia

Todo el estado de checkout y de la transacción en curso vive en Redux (`src/store`). `store.ts` hidrata el estado inicial desde `localStorage` al arrancar y se suscribe a cada cambio para persistirlo (`src/store/persistence.ts`) — así, si el usuario refresca la página a mitad del flujo de pago, recupera exactamente dónde estaba. Los datos sensibles de tarjeta (`cardNumber`, `cvv`) se redactan explícitamente antes de escribir a `localStorage`; nunca se persisten en texto plano.

## Tokenización de tarjeta

El número de tarjeta, CVV y fecha de expiración **nunca salen del navegador en texto plano**: se cifran con JWE (RSA-OAEP-256 + A256GCM, vía `jose`) usando la llave pública que expone el backend (`GET /tokenization/public-key`), y solo el payload ya cifrado viaja a `POST /tokenization/card`. Ver `src/utils/cardTokenization.ts`.
