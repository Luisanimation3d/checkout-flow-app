// @nestjs/swagger se publica como ESM puro y rompe ts-jest igual que
// @nestjs/common (ver nestjs-common.mock.ts). Los controllers solo usan estos
// símbolos como decoradores inertes en tests unitarios; DocumentBuilder y
// SwaggerModule (los que sí "hacen algo") solo corren en main.ts, que está
// fuera de coverage y no se importa en ningún spec.
const noopClassDecorator = (): ClassDecorator => (target) => target;
const noopMethodDecorator = (): MethodDecorator => () => {};
const noopPropertyDecorator = (): PropertyDecorator => () => {};

export const ApiTags = noopClassDecorator;
export const ApiOperation = noopMethodDecorator;
export const ApiParam = noopMethodDecorator;
export const ApiOkResponse = noopMethodDecorator;
export const ApiCreatedResponse = noopMethodDecorator;
export const ApiBadRequestResponse = noopMethodDecorator;
export const ApiNotFoundResponse = noopMethodDecorator;
export const ApiBadGatewayResponse = noopMethodDecorator;
export const ApiProperty = noopPropertyDecorator;
