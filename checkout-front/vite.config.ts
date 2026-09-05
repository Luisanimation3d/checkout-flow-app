import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "${path
          .resolve(import.meta.dirname, 'src/styles/breakpoints.scss')
          .replace(/\\/g, '/')}" as *;\n`,
      },
    },
  },
})
