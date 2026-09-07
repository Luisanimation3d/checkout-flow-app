import { TextDecoder, TextEncoder } from 'node:util'
import '@testing-library/jest-dom'

// El entorno jsdom de Jest no expone TextEncoder/TextDecoder por defecto
// (sí son globals normales de Node) — react-router-dom v7 los necesita.
if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder as typeof global.TextDecoder
}

// jsdom no implementa matchMedia. Backdrop y useMediaQuery lo usan para
// adaptar el layout mobile/desktop; los tests que necesiten simular un
// breakpoint específico pueden sobreescribir window.matchMedia.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}
