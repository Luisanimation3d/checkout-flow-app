import { EncryptJWT, importSPKI } from 'jose'
import { API_URL } from '@/utils/apiUrl'
import { logger } from '@/utils/logger'

export interface TokenizeCardInput {
  number: string
  cvc: string
  expMonth: string
  expYear: string
  cardHolder: string
}

let cachedPublicKeyPem: string | null = null

// El sandbox UAT de Wompi no habilita CORS, así que estas dos llamadas pasan
// por nuestro backend (que sí puede llamar a Wompi sin restricción de origen).
// La tarjeta sigue sin llegar en texto plano a nuestro servidor: se cifra (JWE)
// acá mismo, en el navegador, y lo único que viaja por nuestro backend es el
// payload ya cifrado más el token que Wompi devuelve.
const getTokenizationPublicKey = async (): Promise<string> => {
  if (cachedPublicKeyPem) return cachedPublicKeyPem

  logger.info('wompi', 'GET /tokenization/public-key — solicitando llave pública')
  const response = await fetch(`${API_URL}/tokenization/public-key`)

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    logger.error('wompi', `GET /tokenization/public-key falló con status ${response.status}`, body)
    throw new Error(body?.message ?? 'No pudimos preparar el cifrado de la tarjeta. Intenta de nuevo.')
  }

  const body = await response.json()
  cachedPublicKeyPem = body.publicKey as string
  logger.info('wompi', 'Llave pública de tokenización obtenida (cacheada)')
  return cachedPublicKeyPem
}

export const tokenizeCard = async (input: TokenizeCardInput): Promise<string> => {
  logger.info('wompi', `Tokenizando tarjeta •••• ${input.number.slice(-4)}`)

  const publicKeyPem = await getTokenizationPublicKey()
  const publicKey = await importSPKI(publicKeyPem, 'RSA-OAEP-256')

  const payload = await new EncryptJWT({
    number: input.number,
    cvc: input.cvc,
    exp_month: input.expMonth,
    exp_year: input.expYear,
    card_holder: input.cardHolder,
  })
    .setProtectedHeader({ alg: 'RSA-OAEP-256', enc: 'A256GCM' })
    .encrypt(publicKey)

  logger.info('wompi', 'POST /tokenization/card — enviando payload cifrado (JWE)')
  const response = await fetch(`${API_URL}/tokenization/card`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload }),
  })

  const body = await response.json()

  if (!response.ok) {
    logger.error('wompi', `POST /tokenization/card falló con status ${response.status}`, body)
    throw new Error(body?.message ?? 'La tarjeta fue rechazada al tokenizar. Verifica los datos.')
  }

  logger.info('wompi', `Tarjeta tokenizada — token=${body.token}`)
  return body.token as string
}
