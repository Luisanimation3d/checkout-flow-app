// @nestjs/common@12 se publica como ESM puro (sin build CJS), y ts-jest no
// logra interoperar con eso de forma confiable (falla en capas profundas del
// paquete, no solo en el entrypoint). Como los use cases y el dominio solo
// usan estos tres símbolos como decoradores/logger inertes (no dependen del
// contenedor de DI real en tests unitarios con mocks manuales), este stub los
// reemplaza SOLO dentro de Jest (ver moduleNameMapper en jest.config.ts) sin
// tocar la app real, que sigue usando el paquete real vía `nest start`.
export const Injectable = (): ClassDecorator => (target) => target;

export const Inject =
  (_token?: unknown): ParameterDecorator =>
  () => {};

export class Logger {
  constructor(_context?: string) {}
  log(..._args: unknown[]): void {}
  warn(..._args: unknown[]): void {}
  error(..._args: unknown[]): void {}
  debug(..._args: unknown[]): void {}
  verbose(..._args: unknown[]): void {}
}

// Decoradores de routing/DI: solo metadata en runtime, no-ops acá bastan.
export const Controller =
  (_prefix?: string): ClassDecorator =>
  (target) => target;
export const Get =
  (_path?: string): MethodDecorator =>
  () => {};
export const Post =
  (_path?: string): MethodDecorator =>
  () => {};
export const Param =
  (_key?: string): ParameterDecorator =>
  () => {};
export const Body = (): ParameterDecorator => () => {};

export class HttpException extends Error {
  constructor(
    response: string | Record<string, unknown>,
    private readonly status: number,
  ) {
    super(typeof response === 'string' ? response : JSON.stringify(response));
  }
  getStatus(): number {
    return this.status;
  }
}
export class NotFoundException extends HttpException {
  constructor(message: string) {
    super(message, 404);
  }
}
export class BadRequestException extends HttpException {
  constructor(message: string) {
    super(message, 400);
  }
}
export class BadGatewayException extends HttpException {
  constructor(message: string) {
    super(message, 502);
  }
}
