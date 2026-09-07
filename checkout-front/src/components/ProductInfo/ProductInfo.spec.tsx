import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductInfo } from './ProductInfo'

describe('ProductInfo', () => {
  it('renders title, description and price info', () => {
    render(
      <ProductInfo title="Speaker" description="A nice speaker" price={149000} currency="COP" stock={5} />,
    )

    expect(screen.getByRole('heading', { name: 'Speaker' })).toBeInTheDocument()
    expect(screen.getByText('A nice speaker')).toBeInTheDocument()
    expect(screen.getByText('5 unidades disponibles')).toBeInTheDocument()
  })

  it('does not show a "Ver más" toggle when the description is not truncated', () => {
    render(<ProductInfo title="Speaker" description="Short" price={100} currency="COP" stock={1} />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  describe('when the description overflows', () => {
    let originalScrollHeight: PropertyDescriptor | undefined
    let originalClientHeight: PropertyDescriptor | undefined

    beforeEach(() => {
      originalScrollHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight')
      originalClientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight')
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, value: 200 })
      Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 60 })
    })

    afterEach(() => {
      if (originalScrollHeight) Object.defineProperty(HTMLElement.prototype, 'scrollHeight', originalScrollHeight)
      if (originalClientHeight) Object.defineProperty(HTMLElement.prototype, 'clientHeight', originalClientHeight)
    })

    it('shows a "Ver más" toggle that expands and collapses the description', async () => {
      render(
        <ProductInfo title="Speaker" description="Long text..." price={100} currency="COP" stock={1} />,
      )

      const toggle = screen.getByRole('button', { name: 'Ver más' })
      expect(toggle).toHaveAttribute('aria-expanded', 'false')

      await userEvent.click(toggle)
      expect(screen.getByRole('button', { name: 'Ver menos' })).toHaveAttribute('aria-expanded', 'true')
    })
  })
})
