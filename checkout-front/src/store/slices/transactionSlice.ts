import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { CardFormValues } from '@/types/card'
import type { DeliveryFormValues } from '@/types/delivery'
import type { Transaction } from '@/types/transaction'
import { API_URL } from '@/utils/apiUrl'
import { logger } from '@/utils/logger'
import { tokenizeCard } from '@/utils/wompi'

type TransactionPhase = 'idle' | 'submitting' | 'polling' | 'resolved' | 'error'

interface TransactionState {
  current: Transaction | null
  phase: TransactionPhase
  error: string | null
}

const initialState: TransactionState = {
  current: null,
  phase: 'idle',
  error: null,
}

interface SubmitPaymentInput {
  productId: string
  card: CardFormValues
  delivery: DeliveryFormValues
}

export const submitPayment = createAsyncThunk<Transaction, SubmitPaymentInput, { rejectValue: string }>(
  'transaction/submitPayment',
  async ({ productId, card, delivery }, { rejectWithValue }) => {
    logger.info('checkout', `Iniciando pago — producto=${productId} cuotas=${card.installments}`)

    const [expMonth, expYear] = card.expiry.split('/')

    let cardToken: string
    try {
      cardToken = await tokenizeCard({
        number: card.cardNumber.replace(/\D/g, ''),
        cvc: card.cvv,
        expMonth,
        expYear,
        cardHolder: card.name,
      })
    } catch (err) {
      logger.error('checkout', 'Tokenización de tarjeta falló', err)
      return rejectWithValue(err instanceof Error ? err.message : 'No pudimos preparar el pago.')
    }

    logger.info('checkout', 'Enviando transacción al backend...')
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        cardToken,
        installments: card.installments,
        customer: {
          fullName: delivery.fullName,
          documentType: delivery.documentType,
          documentId: delivery.documentId,
          phone: delivery.phone,
          email: delivery.email,
        },
        delivery: {
          address: delivery.address,
          city: delivery.city,
          department: delivery.department,
        },
      }),
    })

    const body = await response.json()

    if (!response.ok) {
      logger.error('checkout', 'Creación de la transacción falló', body)
      return rejectWithValue(body?.message ?? `Error ${response.status}`)
    }

    logger.info('checkout', `Transacción creada — id=${body.id} status=${body.status}`)
    return body as Transaction
  },
)

export const pollTransaction = createAsyncThunk<Transaction, string, { rejectValue: string }>(
  'transaction/poll',
  async (transactionId, { rejectWithValue }) => {
    const response = await fetch(`${API_URL}/transactions/${transactionId}`)
    const body = await response.json()

    if (!response.ok) {
      logger.error('payment-status', 'Polling falló', body)
      return rejectWithValue(body?.message ?? `Error ${response.status}`)
    }

    logger.info('payment-status', `Estado recibido: ${body.status}`)
    return body as Transaction
  },
)

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    resetTransaction() {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitPayment.pending, (state) => {
        state.phase = 'submitting'
        state.error = null
      })
      .addCase(submitPayment.fulfilled, (state, action) => {
        state.current = action.payload
        state.phase = 'polling'
      })
      .addCase(submitPayment.rejected, (state, action) => {
        state.phase = 'error'
        state.error = action.payload ?? 'No pudimos procesar tu pago.'
      })
      .addCase(pollTransaction.fulfilled, (state, action) => {
        state.current = action.payload
        state.phase = action.payload.status === 'PENDING' ? 'polling' : 'resolved'
      })
      .addCase(pollTransaction.rejected, (state, action) => {
        state.error = action.payload ?? 'No pudimos consultar el estado del pago.'
      })
  },
})

export const { resetTransaction } = transactionSlice.actions
export const transactionReducer = transactionSlice.reducer
