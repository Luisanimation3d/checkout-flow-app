import type { TokenizeCardInput } from './cardTokenization'

// jest.mock se hoistea sobre el resto del archivo (vía babel-plugin-jest-hoist).
// Esa misma herramienta solo permite que la factory referencie variables
// externas si su nombre empieza con "mock" — de ahí el prefijo obligatorio.
const mockEncrypt = jest.fn().mockResolvedValue('encrypted-jwe-payload')
const mockSetProtectedHeader = jest.fn().mockReturnValue({ encrypt: mockEncrypt })

jest.mock('jose', () => ({
  // Debe ser una clase real (no una función flecha): el código de producción
  // la instancia con `new EncryptJWT(...)`.
  EncryptJWT: class {
    setProtectedHeader = mockSetProtectedHeader
  },
  importSPKI: jest.fn().mockResolvedValue('mock-key-object'),
}))

const sampleInput: TokenizeCardInput = {
  number: '4242424242424242',
  cvc: '123',
  expMonth: '12',
  expYear: '29',
  cardHolder: 'LUIS CORREA',
}

// jest.resetModules() + import dinámico: cardTokenization.ts cachea la llave pública en una
// variable de módulo (cachedPublicKeyPem), así que cada test necesita partir
// de un módulo fresco para no heredar el caché de tests anteriores.
const importCardTokenization = () => import('./cardTokenization')

describe('tokenizeCard', () => {
  let fetchMock: jest.Mock

  beforeEach(() => {
    jest.resetModules()
    fetchMock = jest.fn()
    global.fetch = fetchMock as unknown as typeof fetch
  })

  it('fetches the public key, encrypts the card and returns the token on success', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ publicKey: 'PEM_KEY' }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ token: 'tok_123' }) })

    const { tokenizeCard } = await importCardTokenization()
    const token = await tokenizeCard(sampleInput)

    expect(token).toBe('tok_123')
    expect(fetchMock).toHaveBeenCalledTimes(2)
    const [, cardCallInit] = fetchMock.mock.calls[1] as [string, RequestInit]
    expect(JSON.parse(cardCallInit.body as string)).toEqual({ payload: 'encrypted-jwe-payload' })
  })

  it('caches the public key across calls (only fetches it once)', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ publicKey: 'PEM_KEY' }) })
      .mockResolvedValue({ ok: true, json: () => Promise.resolve({ token: 'tok_123' }) })

    const { tokenizeCard } = await importCardTokenization()
    await tokenizeCard(sampleInput)
    await tokenizeCard(sampleInput)

    const publicKeyCalls = fetchMock.mock.calls.filter(([url]) => String(url).includes('public-key'))
    expect(publicKeyCalls).toHaveLength(1)
    expect(fetchMock).toHaveBeenCalledTimes(3) // 1 llave + 2 tokenizaciones
  })

  it('throws with the backend message when fetching the public key fails', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: () => Promise.resolve({ message: 'No pudimos conectar con el proveedor de pagos' }),
    })

    const { tokenizeCard } = await importCardTokenization()

    await expect(tokenizeCard(sampleInput)).rejects.toThrow('No pudimos conectar con el proveedor de pagos')
  })

  it('falls back to a generic message when the public-key error response has no JSON body', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('invalid json')),
    })

    const { tokenizeCard } = await importCardTokenization()

    await expect(tokenizeCard(sampleInput)).rejects.toThrow(
      'No pudimos preparar el cifrado de la tarjeta. Intenta de nuevo.',
    )
  })

  it('throws with the real gateway rejection reason when card tokenization is rejected', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ publicKey: 'PEM_KEY' }) })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () =>
          Promise.resolve({
            message: 'El número de tarjeta usado no es aceptado en el ambiente de pruebas.',
          }),
      })

    const { tokenizeCard } = await importCardTokenization()

    await expect(tokenizeCard(sampleInput)).rejects.toThrow(
      'El número de tarjeta usado no es aceptado en el ambiente de pruebas.',
    )
  })

  it('falls back to a generic message when the card rejection has no specific reason', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ publicKey: 'PEM_KEY' }) })
      .mockResolvedValueOnce({ ok: false, status: 422, json: () => Promise.resolve({}) })

    const { tokenizeCard } = await importCardTokenization()

    await expect(tokenizeCard(sampleInput)).rejects.toThrow(
      'La tarjeta fue rechazada al tokenizar. Verifica los datos.',
    )
  })
})
