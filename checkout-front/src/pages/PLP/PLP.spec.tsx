import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { productsReducer } from '@/store/slices/productsSlice'
import type { Product } from '@/types/product'
import { PLP } from './PLP'

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

const renderPLP = () => {
  const store = configureStore({ reducer: { products: productsReducer } })
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <PLP />
      </MemoryRouter>
    </Provider>,
  )
}

describe('PLP', () => {
  let fetchMock: jest.Mock

  beforeEach(() => {
    fetchMock = jest.fn()
    global.fetch = fetchMock as unknown as typeof fetch
  })

  it('shows skeletons while loading', () => {
    fetchMock.mockReturnValue(new Promise(() => {}))
    renderPLP()

    expect(screen.getByText('Cargando productos…')).toBeInTheDocument()
  })

  it('renders the products once loaded', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve([mockProduct]) })
    renderPLP()

    expect(await screen.findByText('Speaker')).toBeInTheDocument()
    expect(screen.getByText('1 productos disponibles')).toBeInTheDocument()
  })

  it('shows an error message when the request fails', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) })
    renderPLP()

    expect(
      await screen.findByText('No pudimos cargar los productos. Intenta de nuevo.'),
    ).toBeInTheDocument()
  })
})
