import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom'
import { checkoutReducer } from '@/store/slices/checkoutSlice'
import type { CheckoutState } from '@/store/slices/checkoutSlice'
import { transactionReducer } from '@/store/slices/transactionSlice'
import type { TransactionState } from '@/store/slices/transactionSlice'
import type { CardFormValues } from '@/types/card'
import type { PaymentStatusRouteState } from '@/types/checkoutRouteState'
import type { DeliveryFormValues } from '@/types/delivery'
import type { Transaction } from '@/types/transaction'
import { PaymentStatus } from './PaymentStatus'

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

const routeState: PaymentStatusRouteState = {
  productId: 'p1',
  transactionId: 't1',
  card,
  delivery,
}

const baseTransaction: Transaction = {
  id: 't1',
  reference: 'checkout-123',
  productId: 'p1',
  customerId: 'c1',
  deliveryId: 'd1',
  amountInCents: 16300000,
  currency: 'COP',
  status: 'PENDING',
  gatewayTransactionId: 'gateway-txn-1',
  statusMessage: null,
}

const ProductRouteMarker = () => {
  const { id } = useParams()
  return <div>Producto {id}</div>
}

const defaultCheckoutState: CheckoutState = {
  productId: null,
  step: 'closed',
  paymentFormStep: 'card',
  card: null,
  delivery: null,
}

const defaultTransactionState: TransactionState = { current: null, phase: 'idle', error: null }

const renderPaymentStatus = (
  state: PaymentStatusRouteState | null = routeState,
  preloadedCheckout?: Partial<CheckoutState>,
  preloadedTransaction?: Partial<TransactionState>,
) => {
  const store = configureStore({
    reducer: { checkout: checkoutReducer, transaction: transactionReducer },
    preloadedState: {
      checkout: { ...defaultCheckoutState, ...preloadedCheckout },
      transaction: {
        ...defaultTransactionState,
        ...preloadedTransaction,
      },
    },
  })

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[{ pathname: '/status', state }]}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/product/:id" element={<ProductRouteMarker />} />
          <Route path="/status" element={<PaymentStatus />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
}

describe('PaymentStatus', () => {
  let fetchMock: jest.Mock

  beforeEach(() => {
    fetchMock = jest.fn()
    global.fetch = fetchMock as unknown as typeof fetch
  })

  it('redirects home when there is no route state and nothing was persisted', async () => {
    renderPaymentStatus(null)

    expect(await screen.findByText('Home')).toBeInTheDocument()
  })

  it('resumes polling from the persisted transaction when location.state is lost (e.g. a fresh tab)', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve(baseTransaction) })

    // Sin location.state, pero con lo mismo que el store ya tendría rehidratado
    // desde localStorage (checkout.card/delivery + transaction.current).
    renderPaymentStatus(null, { card, delivery }, { current: baseTransaction, phase: 'polling' })

    expect(await screen.findByText('Procesando tu pago')).toBeInTheDocument()
    expect(screen.queryByText('Home')).not.toBeInTheDocument()
  })

  it('shows the processing state while the transaction is still PENDING', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve(baseTransaction) })
    renderPaymentStatus()

    expect(await screen.findByText('Procesando tu pago')).toBeInTheDocument()
  })

  it('shows the approved state with amount and reference once resolved', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ...baseTransaction, status: 'APPROVED' }),
    })
    renderPaymentStatus()

    expect(await screen.findByText('¡Pago aprobado!')).toBeInTheDocument()
    expect(screen.getByText('Referencia checkout-123')).toBeInTheDocument()
    expect(screen.getByText(/163\.000/)).toBeInTheDocument()
  })

  it('shows the failed state with a retry button when declined', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ...baseTransaction, status: 'DECLINED' }),
    })
    renderPaymentStatus()

    expect(await screen.findByText('No pudimos procesar tu pago')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar pago' })).toBeInTheDocument()
  })

  it('navigates back to the product page when "Volver al producto" is clicked', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ...baseTransaction, status: 'APPROVED' }),
    })
    renderPaymentStatus()

    await screen.findByText('¡Pago aprobado!')
    await userEvent.click(screen.getByRole('button', { name: /Volver al producto/ }))

    expect(screen.getByText('Producto p1')).toBeInTheDocument()
  })

  it('navigates back to the product page with retry state when retrying a declined payment', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ...baseTransaction, status: 'DECLINED' }),
    })
    renderPaymentStatus()

    await screen.findByText('No pudimos procesar tu pago')
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar pago' }))

    expect(screen.getByText('Producto p1')).toBeInTheDocument()
  })
})
