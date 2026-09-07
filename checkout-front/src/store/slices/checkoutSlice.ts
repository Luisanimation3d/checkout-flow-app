import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CardFormValues } from '@/types/card'
import type { DeliveryFormValues } from '@/types/delivery'

export type CheckoutStep = 'closed' | 'payment' | 'summary'
export type PaymentDataFormStep = 'card' | 'delivery'

export interface CheckoutState {
  productId: string | null
  step: CheckoutStep
  paymentFormStep: PaymentDataFormStep
  card: CardFormValues | null
  delivery: DeliveryFormValues | null
}

const initialState: CheckoutState = {
  productId: null,
  step: 'closed',
  paymentFormStep: 'card',
  card: null,
  delivery: null,
}

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    // Asocia el checkout persistido al producto actual: PDP la usa para saber
    // si debe limpiar el estado (producto distinto) o preservarlo (refresh).
    setCheckoutProduct(state, action: PayloadAction<string>) {
      state.productId = action.payload
    },
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
    // A diferencia de completePaymentForm (que cierra el paso y avanza a summary),
    // estas dos reflejan cada tecleo del usuario en el formulario mientras lo llena,
    // para que un refresh a mitad del formulario también recupere el progreso
    // (store.subscribe persiste esto en localStorage en cada cambio — ver store.ts).
    updateCardDraft(state, action: PayloadAction<CardFormValues>) {
      state.card = action.payload
    },
    updateDeliveryDraft(state, action: PayloadAction<DeliveryFormValues>) {
      state.delivery = action.payload
    },
    resetCheckout() {
      return initialState
    },
  },
})

export const {
  setCheckoutProduct,
  openCheckout,
  closeCheckout,
  setPaymentFormStep,
  completePaymentForm,
  updateCardDraft,
  updateDeliveryDraft,
  resetCheckout,
} = checkoutSlice.actions
export const checkoutReducer = checkoutSlice.reducer
