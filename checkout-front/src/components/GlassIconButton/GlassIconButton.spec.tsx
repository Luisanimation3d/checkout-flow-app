import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GlassIconButton } from './GlassIconButton'

describe('GlassIconButton', () => {
  it('renders the given icon and label', () => {
    render(<GlassIconButton icon={<span data-testid="icon" />} aria-label="Volver" />)

    expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument()
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const onClick = jest.fn()
    render(<GlassIconButton icon={<span />} aria-label="Favoritos" onClick={onClick} />)

    await userEvent.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('applies the active class when active=true', () => {
    const { rerender } = render(
      <GlassIconButton icon={<span />} aria-label="Favoritos" active={false} />,
    )
    const inactiveClass = screen.getByRole('button').className

    rerender(<GlassIconButton icon={<span />} aria-label="Favoritos" active />)
    const activeClass = screen.getByRole('button').className

    expect(activeClass).not.toBe(inactiveClass)
  })
})
