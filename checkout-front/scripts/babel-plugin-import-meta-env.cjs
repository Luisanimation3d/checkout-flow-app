// Jest corre sobre CommonJS y no entiende `import.meta` (es sintaxis exclusiva
// de ES modules, y Vite la usa para exponer las env vars: import.meta.env.X).
// Este plugin reemplaza cada `import.meta` por `({ env: process.env })`, así
// `import.meta.env.VITE_API_URL` termina siendo `process.env.VITE_API_URL`
// en tiempo de test — sin tocar el código fuente real, que sigue usando la
// sintaxis de Vite normalmente en dev/build.
module.exports = function importMetaEnvPlugin() {
  return {
    visitor: {
      MetaProperty(path) {
        if (path.node.meta.name === 'import' && path.node.property.name === 'meta') {
          path.replaceWithSourceString('({ env: process.env })')
        }
      },
    },
  }
}
