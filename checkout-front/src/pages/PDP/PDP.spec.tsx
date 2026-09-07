import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { checkoutReducer } from '@/store/slices/checkoutSlice'
import type { CheckoutState } from '@/store/slices/checkoutSlice'
import { productsReducer } from '@/store/slices/productsSlice'
import { transactionReducer } from '@/store/slices/transactionSlice'
import type { TransactionState } from '@/store/slices/transactionSlice'
import type { CardFormValues } from '@/types/card'
import type { RetryCheckoutRouteState } from '@/types/checkoutRouteState'
import type { DeliveryFormValues } from '@/types/delivery'
import type { Product } from '@/types/product'
import { PDP } from './PDP'

const mockProduct: Product = {
  id: 'p1',
  title: 'Speaker',
  description: 'A speaker',
  price: 149000,
  currency: 'COP',
  stock: 5,
  images: ['a.jpg'],
  deliveryFee: 9000,
}

const sampleDelivery: DeliveryFormValues = {
  fullName: 'Luis Correa',
  documentType: 'CC',
  documentId: '1000099928',
  phone: '3001234567',
  email: 'luis@example.com',
  address: 'Calle 123 #45-67',
  city: 'medellin',
  department: 'antioquia',
}

const defaultCheckoutState: CheckoutState = {
  productId: null,
  step: 'closed',
  paymentFormStep: 'card',
  card: null,
  delivery: null,
}

const defaultTransactionState: TransactionState = { current: null, phase: 'idle', error: null }

const renderPDP = (
  state?: RetryCheckoutRouteState,
  preloadedCheckout?: Partial<CheckoutState>,
  preloadedTransaction?: Partial<TransactionState>,
) => {
  const store = configureStore({
    reducer: {
      products: productsReducer,
      checkout: checkoutReducer,
      transaction: transactionReducer,
    },
    preloadedState: preloadedCheckout
      ? {
          checkout: { ...defaultCheckoutState, ...preloadedCheckout },
          transaction: { ...defaultTransactionState, ...preloadedTransaction },
        }
      : undefined,
  })

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[{ pathname: '/product/p1', state }]}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/product/:id" element={<PDP />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )

  return store
}

describe('PDP', () => {
  let fetchMock: jest.Mock

  beforeEach(() => {
    fetchMock = jest.fn()
    global.fetch = fetchMock as unknown as typeof fetch
  })

  it('shows the product once it loads', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockProduct) })
    renderPDP()

    expect(await screen.findByRole('heading', { name: 'Speaker' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pagar con tarjeta de crédito' })).toBeInTheDocument()
  })

  it('redirects home when the product fails to load', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404, json: () => Promise.resolve({}) })
    renderPDP()

    expect(await screen.findByText('Home')).toBeInTheDocument()
  })

  it('shows "Agotado" and disables the purchase button when out of stock', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve({ ...mockProduct, stock: 0 }) })
    renderPDP()

    const button = await screen.findByRole('button', { name: 'Agotado' })
    expect(button).toBeDisabled()
  })

  it('opens the card form when the purchase button is clicked', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockProduct) })
    renderPDP()

    await userEvent.click(await screen.findByRole('button', { name: 'Pagar con tarjeta de crédito' }))

    expect(screen.getByLabelText('Número de tarjeta')).toBeInTheDocument()
  })

  it('opens the payment form pre-filled when arriving with retry state', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockProduct) })

    const retryCard: CardFormValues = {
      cardNumber: '4242 4242 4242 4242',
      name: 'LUIS CORREA',
      expiry: '12/29',
      cvv: '123',
      installments: 1,
    }
    const retryDelivery: DeliveryFormValues = {
      fullName: 'Luis Correa',
      documentType: 'CC',
      documentId: '1000099928',
      phone: '3001234567',
      email: 'luis@example.com',
      address: 'Calle 123 #45-67',
      city: 'medellin',
      department: 'antioquia',
    }

    renderPDP({ retryCard, retryDelivery })

    expect(await screen.findByLabelText('Número de tarjeta')).toHaveValue('4242 4242 4242 4242')
  })

  it('asks for the card again (but keeps the delivery) when resuming a summary whose card number was redacted', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockProduct) })

    // Simula el estado ya rehidratado desde localStorage para este mismo
    // producto: el número de tarjeta nunca se persiste (ver store/persistence.ts).
    renderPDP(undefined, {
      productId: 'p1',
      step: 'summary',
      card: { cardNumber: '', name: 'LUIS CORREA', expiry: '12/29', cvv: '', installments: 1 },
      delivery: sampleDelivery,
    })

    // No debe mostrar el resumen con un chip de tarjeta vacío: pide la tarjeta de nuevo.
    expect(await screen.findByLabelText('Número de tarjeta')).toBeInTheDocument()
    expect(screen.queryByText('Resumen de pago')).not.toBeInTheDocument()

    // La entrega ya diligenciada sigue ahí una vez se avanza de nuevo.
    await userEvent.type(screen.getByLabelText('Número de tarjeta'), '4242424242424242')
    await userEvent.type(screen.getByLabelText('CVV'), '123')
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }))

    expect(screen.getByLabelText('Dirección')).toHaveValue(sampleDelivery.address)
  })

  it('does not reopen a concluded checkout when returning to the same product after a resolved payment', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockProduct) })

    renderPDP(
      undefined,
      { productId: 'p1', step: 'summary', card: null, delivery: sampleDelivery },
      { phase: 'resolved' },
    )

    await screen.findByRole('heading', { name: 'Speaker' })

    expect(screen.queryByText('Resumen de pago')).not.toBeInTheDocument()
  })
})
