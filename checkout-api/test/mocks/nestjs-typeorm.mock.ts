// Mismo motivo que los otros stubs en esta carpeta: @nestjs/typeorm@12 es ESM
// puro. Los repositorios reciben su Repository<T> mockeado a mano en los
// tests, así que este decorador solo necesita no explotar en tiempo de import.
export const InjectRepository =
  (_entity: unknown): ParameterDecorator =>
  () => {};
