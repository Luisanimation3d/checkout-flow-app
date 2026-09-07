import type { CardFormValues } from '@/types/card'
import type { CheckoutState } from '@/store/slices/checkoutSlice'
import type { TransactionState } from '@/store/slices/transactionSlice'
import { logger } from '@/utils/logger'

// Requisito del enunciado: "store the payment transaction data securely in
// the application state or localStorage" + "recover the progress made by the
// client in case of refresh". Persistimos solo checkout (paso del flujo,
// entrega, tarjeta) y transaction (la transacción en curso) — products se
// puede volver a pedir al backend sin costo, no es "progreso del usuario".
const STORAGE_KEY = 'checkout-flow:persisted-state'

export interface PersistedState {
  checkout: CheckoutState
  transaction: TransactionState
}

// El número de tarjeta y el CVV nunca deben tocar localStorage, ni siquiera
// una vez que el usuario ya avanzó hasta el resumen de pago (donde checkout.card
// sí trae el número completo). Si el usuario refresca, vuelve a escribirlos.
const redactCard = (card: CardFormValues | null): CardFormValues | null =>
  card ? { ...card, cardNumber: '', cvv: '' } : card

// Ambos slices se escriben siempre juntos (ver persistState), así que si a
// alguno le falta la forma esperada tratamos todo el registro como inválido
// en vez de intentar mezclarlo con el estado inicial de cada slice — así
// configureStore siempre recibe un preloadedState completo o ninguno.
export const loadPersistedState = (): PersistedState | undefined => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined

    const parsed = JSON.parse(raw) as Partial<PersistedState>
    if (!parsed.checkout || !parsed.transaction) return undefined

    return {
      checkout: {
        ...parsed.checkout,
        card: redactCard(parsed.checkout.card ?? null),
      },
      transaction: {
        ...parsed.transaction,
        // Si el refresh ocurrió a mitad de un submit, esa promesa ya no existe:
        // no tiene sentido dejar la UI mostrando "Procesando…" para siempre.
        phase: parsed.transaction.phase === 'submitting' ? 'idle' : parsed.transaction.phase,
        error: null,
      },
    }
  } catch (err) {
    logger.warn('persistence', 'No se pudo leer el estado persistido', err)
    return undefined
  }
}

export const persistState = (state: { checkout: CheckoutState; transaction: TransactionState }): void => {
  try {
    const snapshot: PersistedState = {
      checkout: { ...state.checkout, card: redactCard(state.checkout.card) },
      transaction: state.transaction,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch (err) {
    // localStorage puede fallar (modo privado, cuota llena): nunca debe romper la app.
    logger.warn('persistence', 'No se pudo guardar el estado', err)
  }
}
