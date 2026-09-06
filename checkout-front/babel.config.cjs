// Config de Babel SOLO para Jest (dev/build siguen usando el pipeline de
// Vite normalmente vía @vitejs/plugin-react — este archivo no lo toca).
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  plugins: ['./scripts/babel-plugin-import-meta-env.cjs'],
}
