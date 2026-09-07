import type { CardFormValues } from '@/types/card'
import type { DeliveryFormValues } from '@/types/delivery'
import {
  checkoutReducer,
  closeCheckout,
  completePaymentForm,
  openCheckout,
  resetCheckout,
  setCheckoutProduct,
  setPaymentFormStep,
  updateCardDraft,
  updateDeliveryDraft,
} from './checkoutSlice'

const initialState = {
  productId: null,
  step: 'closed' as const,
  paymentFormStep: 'card' as const,
  card: null,
  delivery: null,
}

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

describe('checkoutSlice', () => {
  it('returns the initial state', () => {
    expect(checkoutReducer(undefined, { type: '@@INIT' })).toEqual(initialState)
  })

  it('openCheckout moves to the payment step at the requested sub-step', () => {
    const state = checkoutReducer(initialState, openCheckout('delivery'))

    expect(state.step).toBe('payment')
    expect(state.paymentFormStep).toBe('delivery')
  })

  it('closeCheckout closes without touching other fields', () => {
    const open = checkoutReducer(initialState, openCheckout('card'))
    const closed = checkoutReducer(open, closeCheckout())

    expect(closed.step).toBe('closed')
    expect(closed.paymentFormStep).toBe('card')
  })

  it('setPaymentFormStep changes only the sub-step', () => {
    const state = checkoutReducer(initialState, setPaymentFormStep('delivery'))

    expect(state.paymentFormStep).toBe('delivery')
    expect(state.step).toBe('closed')
  })

  it('completePaymentForm stores card/delivery and moves to summary', () => {
    const state = checkoutReducer(initialState, completePaymentForm({ card, delivery }))

    expect(state.step).toBe('summary')
    expect(state.card).toEqual(card)
    expect(state.delivery).toEqual(delivery)
  })

  it('resetCheckout returns to the initial state from any dirty state', () => {
    const dirty = checkoutReducer(initialState, completePaymentForm({ card, delivery }))
    const reset = checkoutReducer(dirty, resetCheckout())

    expect(reset).toEqual(initialState)
  })

  it('setCheckoutProduct associates the checkout with a product id', () => {
    const state = checkoutReducer(initialState, setCheckoutProduct('p1'))

    expect(state.productId).toBe('p1')
  })

  it('updateCardDraft reflects in-progress typing without changing the step', () => {
    const partialCard = { ...card, name: '' }
    const state = checkoutReducer(initialState, updateCardDraft(partialCard))

    expect(state.card).toEqual(partialCard)
    expect(state.step).toBe('closed')
  })

  it('updateDeliveryDraft reflects in-progress typing without changing the step', () => {
    const partialDelivery = { ...delivery, address: '' }
    const state = checkoutReducer(initialState, updateDeliveryDraft(partialDelivery))

    expect(state.delivery).toEqual(partialDelivery)
    expect(state.step).toBe('closed')
  })
})
