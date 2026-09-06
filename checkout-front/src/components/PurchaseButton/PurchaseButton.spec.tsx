import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PurchaseButton } from './PurchaseButton'

describe('PurchaseButton', () => {
  it('renders its children and defaults to type="button"', () => {
    render(<PurchaseButton>Pagar</PurchaseButton>)

    const button = screen.getByRole('button', { name: 'Pagar' })
    expect(button).toHaveAttribute('type', 'button')
  })

  it('calls onClick when clicked', async () => {
    const onClick = jest.fn()
    render(<PurchaseButton onClick={onClick}>Pagar</PurchaseButton>)

    await userEvent.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled and unclickable when disabled=true', async () => {
    const onClick = jest.fn()
    render(
      <PurchaseButton disabled onClick={onClick}>
        Agotado
      </PurchaseButton>,
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()

    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })
})
