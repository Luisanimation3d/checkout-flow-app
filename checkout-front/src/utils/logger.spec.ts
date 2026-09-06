// logger.ts calcula `isDev` una sola vez al cargar el módulo (import.meta.env.DEV),
// así que cada test necesita fijar process.env.DEV ANTES de un import dinámico
// con el módulo reseteado — no se puede alternar el valor sobre un módulo ya cargado.
describe('logger', () => {
  const originalDev = process.env.DEV

  afterEach(() => {
    process.env.DEV = originalDev
    jest.restoreAllMocks()
  })

  it('does nothing when DEV is not set (production)', async () => {
    delete process.env.DEV
    jest.resetModules()
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

    const { logger } = await import('./logger')
    logger.info('scope', 'message')

    expect(consoleSpy).not.toHaveBeenCalled()
  })

  it('writes to console.log via info() when DEV is set', async () => {
    process.env.DEV = 'true'
    jest.resetModules()
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

    const { logger } = await import('./logger')
    logger.info('scope', 'a message')

    expect(consoleSpy).toHaveBeenCalledWith('[scope]', 'a message')
  })

  it('includes the data argument when provided', async () => {
    process.env.DEV = 'true'
    jest.resetModules()
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    const { logger } = await import('./logger')
    logger.warn('scope', 'a message', { extra: true })

    expect(consoleSpy).toHaveBeenCalledWith('[scope]', 'a message', { extra: true })
  })

  it('routes error() to console.error', async () => {
    process.env.DEV = 'true'
    jest.resetModules()
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const { logger } = await import('./logger')
    logger.error('scope', 'boom')

    expect(consoleSpy).toHaveBeenCalledWith('[scope]', 'boom')
  })
})
