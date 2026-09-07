import { configureStore } from '@reduxjs/toolkit'
import type { CardFormValues } from '@/types/card'
import type { DeliveryFormValues } from '@/types/delivery'
import type { Transaction } from '@/types/transaction'
import { tokenizeCard } from '@/utils/cardTokenization'
import { pollTransaction, resetTransaction, submitPayment, transactionReducer } from './transactionSlice'

jest.mock('@/utils/cardTokenization', () => ({
  tokenizeCard: jest.fn(),
}))

const card: CardFormValues = {
  cardNumber: '4242424242424242',
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

const pendingTransaction: Transaction = {
  id: 't1',
  reference: 'checkout-123',
  productId: 'p1',
  customerId: 'c1',
  deliveryId: 'd1',
  amountInCents: 11400000,
  currency: 'COP',
  status: 'PENDING',
  gatewayTransactionId: 'gateway-txn-1',
  statusMessage: null,
}

const makeStore = () => configureStore({ reducer: { transaction: transactionReducer } })

describe('transactionSlice', () => {
  let fetchMock: jest.Mock

  beforeEach(() => {
    fetchMock = jest.fn()
    global.fetch = fetchMock as unknown as typeof fetch
    jest.mocked(tokenizeCard).mockReset()
  })

  it('resetTransaction returns to the initial state', () => {
    const dirty = transactionReducer(undefined, {
      type: submitPayment.fulfilled.type,
      payload: pendingTransaction,
    })

    const reset = transactionReducer(dirty, resetTransaction())

    expect(reset).toEqual({ current: null, phase: 'idle', error: null })
  })

  describe('submitPayment', () => {
    it('tokenizes the card, creates the transaction, and moves to polling phase', async () => {
      jest.mocked(tokenizeCard).mockResolvedValue('tok_123')
      fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve(pendingTransaction) })
      const store = makeStore()

      await store.dispatch(submitPayment({ productId: 'p1', card, delivery }))

      const state = store.getState().transaction
      expect(state.phase).toBe('polling')
      expect(state.current).toEqual(pendingTransaction)
      expect(tokenizeCard).toHaveBeenCalledWith(
        expect.objectContaining({ number: '4242424242424242', expMonth: '12', expYear: '29' }),
      )
    })

    it('moves to error phase (without calling the backend) when tokenization fails', async () => {
      jest.mocked(tokenizeCard).mockRejectedValue(new Error('tarjeta rechazada'))
      const store = makeStore()

      await store.dispatch(submitPayment({ productId: 'p1', card, delivery }))

      const state = store.getState().transaction
      expect(state.phase).toBe('error')
      expect(state.error).toBe('tarjeta rechazada')
      expect(fetchMock).not.toHaveBeenCalled()
    });

    it('moves to error phase when the backend rejects the transaction', async () => {
      jest.mocked(tokenizeCard).mockResolvedValue('tok_123')
      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Producto sin stock' }),
      })
      const store = makeStore()

      await store.dispatch(submitPayment({ productId: 'p1', card, delivery }))

      const state = store.getState().transaction
      expect(state.phase).toBe('error')
      expect(state.error).toBe('Producto sin stock')
    })
  })

  describe('pollTransaction', () => {
    it('keeps phase=polling while the transaction is still PENDING', async () => {
      fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve(pendingTransaction) })
      const store = makeStore()

      await store.dispatch(pollTransaction('t1'))

      const state = store.getState().transaction
      expect(state.phase).toBe('polling')
      expect(state.current?.status).toBe('PENDING')
    })

    it('moves to phase=resolved once the transaction leaves PENDING', async () => {
      const approved = { ...pendingTransaction, status: 'APPROVED' as const }
      fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve(approved) })
      const store = makeStore()

      await store.dispatch(pollTransaction('t1'))

      const state = store.getState().transaction
      expect(state.phase).toBe('resolved')
      expect(state.current?.status).toBe('APPROVED')
    })

    it('records an error without touching phase when polling fails', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Transacción no encontrada' }),
      })
      const store = makeStore()

      await store.dispatch(pollTransaction('missing'))

      const state = store.getState().transaction
      expect(state.error).toBe('Transacción no encontrada')
    })
  })
})
