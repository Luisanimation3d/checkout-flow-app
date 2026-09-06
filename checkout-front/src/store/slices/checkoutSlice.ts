import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CardFormValues } from '@/types/card'
import type { DeliveryFormValues } from '@/types/delivery'

export type CheckoutStep = 'closed' | 'payment' | 'summary'
export type PaymentDataFormStep = 'card' | 'delivery'

interface CheckoutState {
  step: CheckoutStep
  paymentFormStep: PaymentDataFormStep
  card: CardFormValues | null
  delivery: DeliveryFormValues | null
}

const initialState: CheckoutState = {
  step: 'closed',
  paymentFormStep: 'card',
  card: null,
  delivery: null,
}

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    openCheckout(state, action: PayloadAction<PaymentDataFormStep>) {
      state.paymentFormStep = action.payload
      state.step = 'payment'
    },
    closeCheckout(state) {
      state.step = 'closed'
    },
    setPaymentFormStep(state, action: PayloadAction<PaymentDataFormStep>) {
      state.paymentFormStep = action.payload
    },
    completePaymentForm(
      state,
      action: PayloadAction<{ card: CardFormValues; delivery: DeliveryFormValues }>,
    ) {
      state.card = action.payload.card
      state.delivery = action.payload.delivery
      state.step = 'summary'
    },
    resetCheckout() {
      return initialState
    },
  },
})

export const {
  openCheckout,
  closeCheckout,
  setPaymentFormStep,
  completePaymentForm,
  resetCheckout,
} = checkoutSlice.actions
export const checkoutReducer = checkoutSlice.reducer
