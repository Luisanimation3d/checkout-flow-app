import { render, screen } from '@testing-library/react'
import { PriceBox } from './PriceBox'

describe('PriceBox', () => {
  it('renders the formatted price and stock count', () => {
    render(<PriceBox price={149000} currency="COP" stock={5} />)

    expect(screen.getByText(/149\.000/)).toBeInTheDocument()
    expect(screen.getByText('5 unidades disponibles')).toBeInTheDocument()
  })
})
