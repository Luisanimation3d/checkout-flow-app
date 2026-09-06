import type { CardFormValues } from '@/types/card'
import type { CheckoutState } from '@/store/slices/checkoutSlice'
import type { TransactionState } from '@/store/slices/transactionSlice'
import type { DeliveryFormValues } from '@/types/delivery'
import type { Transaction } from '@/types/transaction'
import { loadPersistedState, persistState } from './persistence'

const STORAGE_KEY = 'checkout-flow:persisted-state'

const card: CardFormValues = {
  cardNumber: '4242 4242 4242 4242',
  name: 'LUIS CORREA',
  expiry: '12/29',
  cvv: '123',
  installments: 1,
}

const delivery: DeliveryFormValues = {
  fullName: 'Luis Correa',
  documentType: 'CC',
  documentId: '1000099928',
  phone: '3001234567',
  email: 'luis@example.com',
  address: 'Calle 123 #45-67',
  city: 'medellin',
  department: 'antioquia',
}

const checkoutState: CheckoutState = {
  productId: 'p1',
  step: 'summary',
  paymentFormStep: 'card',
  card,
  delivery,
}

const transaction: Transaction = {
  id: 't1',
  reference: 'checkout-123',
  productId: 'p1',
  customerId: 'c1',
  deliveryId: 'd1',
  amountInCents: 16300000,
  currency: 'COP',
  status: 'PENDING',
  wompiTransactionId: 'wompi-1',
  statusMessage: null,
}

const transactionState: TransactionState = {
  current: transaction,
  phase: 'polling',
  error: null,
}

describe('persistState / loadPersistedState', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    jest.restoreAllMocks()
  })

  it('returns undefined when nothing was ever persisted', () => {
    expect(loadPersistedState()).toBeUndefined()
  })

  it('round-trips checkout and transaction state', () => {
    persistState({ checkout: checkoutState, transaction: transactionState })

    const loaded = loadPersistedState()

    expect(loaded?.checkout.step).toBe('summary')
    expect(loaded?.checkout.delivery).toEqual(delivery)
    expect(loaded?.transaction.current).toEqual(transaction)
    expect(loaded?.transaction.phase).toBe('polling')
  })

  it('never writes the raw card number or CVV to localStorage', () => {
    persistState({ checkout: checkoutState, transaction: transactionState })

    const raw = localStorage.getItem(STORAGE_KEY)
    const persisted = JSON.parse(raw ?? '{}')
    expect(persisted.checkout.card.cardNumber).toBe('')
    expect(persisted.checkout.card.cvv).toBe('')
    // También a nivel de string completo, por si algo se coló fuera de card.
    expect(raw).not.toContain(card.cardNumber)
  })

  it('redacts the card on load too, as a defensive fallback', () => {
    // Simula un registro viejo/corrupto que sí tuviera el número en crudo.
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ checkout: checkoutState, transaction: transactionState }),
    )

    const loaded = loadPersistedState()

    expect(loaded?.checkout.card?.cardNumber).toBe('')
    expect(loaded?.checkout.card?.cvv).toBe('')
    expect(loaded?.checkout.card?.name).toBe(card.name) // el nombre no es sensible, se conserva
  })

  it('sanitizes a "submitting" phase back to "idle" on load (no in-flight request survives a refresh)', () => {
    persistState({
      checkout: checkoutState,
      transaction: { current: null, phase: 'submitting', error: null },
    })

    const loaded = loadPersistedState()

    expect(loaded?.transaction.phase).toBe('idle')
  })

  it('returns undefined when the stored JSON is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json')

    expect(loadPersistedState()).toBeUndefined()
  })

  it('returns undefined when the stored record is missing a slice', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ checkout: checkoutState }))

    expect(loadPersistedState()).toBeUndefined()
  })

  it('does not throw when localStorage.setItem fails (private mode / quota)', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })

    expect(() => persistState({ checkout: checkoutState, transaction: transactionState })).not.toThrow()
  })
})
