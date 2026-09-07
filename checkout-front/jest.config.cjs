// Requisito del enunciado: los tests (front y back) deben crearse con Jest.
// El transform usa babel-jest (no ts-jest) para poder manejar import.meta.env
// de Vite con un plugin propio (ver scripts/babel-plugin-import-meta-env.cjs);
// el chequeo de tipos real sigue cubierto aparte por `tsc --noEmit`.
module.exports = {
  rootDir: '.',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': 'babel-jest',
  },
  // jose se publica como ESM puro; sin esto Jest lo deja tal cual y require()
  // truena en los archivos (PDP/PaymentStatus) que lo importan transitivamente
  // vía transactionSlice -> cardTokenization sin mockearlo directamente.
  transformIgnorePatterns: ['node_modules/(?!(jose)/)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/main.tsx',
    '!src/App.tsx',
    '!src/store/store.ts',
    '!src/store/hooks.ts',
    '!src/test/**',
    '!src/types/**',
    '!src/**/*.d.ts',
    '!src/pages/PDP/PDPSkeleton.tsx',
    '!src/components/**/index.ts',
    '!src/pages/**/index.ts',
    '!src/utils/apiUrl.ts',
    '!src/utils/breakpoints.ts',
    '!src/utils/checkoutFees.ts',
    '!src/utils/cardNumberLength.ts',
    '!src/utils/cvvLength.ts',
    '!src/utils/documentTypes.ts',
  ],
  coverageThreshold: {
    global: { statements: 80, branches: 80, functions: 80, lines: 80 },
  },
}
