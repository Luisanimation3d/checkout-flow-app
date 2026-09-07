import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { Product } from '@/types/product'
import { ProductCard } from './ProductCard'

const product: Product = {
  id: 'p1',
  title: 'Speaker',
  description: 'A speaker',
  price: 149000,
  currency: 'COP',
  stock: 5,
  images: ['a.jpg'],
  deliveryFee: 9000,
}

const renderCard = (overrides: Partial<Product> = {}) =>
  render(
    <MemoryRouter>
      <ProductCard product={{ ...product, ...overrides }} />
    </MemoryRouter>,
  )

describe('ProductCard', () => {
  it('links to the product detail page', () => {
    renderCard()

    expect(screen.getByRole('link')).toHaveAttribute('href', '/product/p1')
  })

  it('shows title, formatted price and stock', () => {
    renderCard()

    expect(screen.getByText('Speaker')).toBeInTheDocument()
    expect(screen.getByText(/149\.000/)).toBeInTheDocument()
    expect(screen.getByText('5 disponibles')).toBeInTheDocument()
  })

  it('shows an "Agotado" badge and hides stock when out of stock', () => {
    renderCard({ stock: 0 })

    expect(screen.getByText('Agotado')).toBeInTheDocument()
    expect(screen.queryByText(/disponibles/)).not.toBeInTheDocument()
  })
})
