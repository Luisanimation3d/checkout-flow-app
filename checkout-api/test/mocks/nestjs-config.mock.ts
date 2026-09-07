// Mismo motivo que test/mocks/nestjs-common.mock.ts: @nestjs/config@12 es ESM
// puro. El código de producción solo usa el TIPO ConfigService (los tests
// siempre inyectan un objeto { getOrThrow: jest.fn() } propio), así que este
// stub existe solo para que el import en tiempo de ejecución no explote.
export class ConfigService {
  get<T = unknown>(_key: string): T | undefined {
    return undefined;
  }

  getOrThrow<T = unknown>(_key: string): T {
    throw new Error('ConfigService.getOrThrow stub called without a real mock');
  }
}
