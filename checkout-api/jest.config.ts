import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import ts from 'typescript';

// Path aliases (e.g. the ones added by `nest g library`) live in tsconfig.json,
// so they are read from there instead of being duplicated here.
const { config: tsconfig } = ts.readConfigFile(
  './tsconfig.json',
  ts.sys.readFile,
);
const paths = tsconfig?.compilerOptions?.paths ?? {};

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    // tsconfig.json no trae "rootDir" (piensa en el build real vía
    // tsconfig.build.json). Sin eso, TS6 tira TS5011 al compilar archivos
    // sueltos de test. tsconfig.spec.json extiende la base solo para overridear
    // eso, sin tocar el tsconfig que usa el resto del proyecto/editor.
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleNameMapper: {
    ...pathsToModuleNameMapper(paths, { prefix: '<rootDir>/' }),
    // Ver test/mocks/nestjs-common.mock.ts: @nestjs/common@12 es ESM puro y
    // rompe ts-jest en capas profundas del paquete (más allá del entrypoint).
    '^@nestjs/common$': '<rootDir>/test/mocks/nestjs-common.mock.ts',
    '^@nestjs/config$': '<rootDir>/test/mocks/nestjs-config.mock.ts',
    '^@nestjs/typeorm$': '<rootDir>/test/mocks/nestjs-typeorm.mock.ts',
  },
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    'libs/**/*.(t|j)s',
    'apps/**/*.(t|j)s',
    // Wiring de DI, entidades de TypeORM (solo decoradores de columna) y el
    // bootstrap de la app no tienen lógica real que testear con sentido.
    '!src/**/*.module.ts',
    '!src/**/*.orm-entity.ts',
    '!src/main.ts',
    '!src/app.controller.ts',
    '!src/app.service.ts',
    '!src/**/*.seeder.ts',
    '!src/**/*-seed-data.ts',
  ],
  coverageDirectory: './coverage',
  coverageThreshold: {
    global: { statements: 80, branches: 80, functions: 80, lines: 80 },
  },
  testEnvironment: 'node',
  // class-transformer (@Type en los DTOs) necesita el polyfill de reflect-metadata,
  // que normalmente se carga vía main.ts al arrancar la app real.
  setupFiles: ['reflect-metadata'],
};

export default config;
