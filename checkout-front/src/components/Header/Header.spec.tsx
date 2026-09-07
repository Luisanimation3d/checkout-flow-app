import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from './Header'

describe('Header', () => {
  it('calls onBack when the back button is clicked', async () => {
    const onBack = jest.fn()
    render(<Header isFavorite={false} onBack={onBack} onToggleFavorite={() => {}} />)

    await userEvent.click(screen.getByRole('button', { name: 'Volver' }))

    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('calls onToggleFavorite when the favorite button is clicked', async () => {
    const onToggleFavorite = jest.fn()
    render(<Header isFavorite={false} onToggleFavorite={onToggleFavorite} />)

    await userEvent.click(screen.getByRole('button', { name: 'Guardar en favoritos' }))

    expect(onToggleFavorite).toHaveBeenCalledTimes(1)
  })

  it('reflects the isFavorite prop in the favorite button state', () => {
    const { rerender } = render(<Header isFavorite={false} onToggleFavorite={() => {}} />)
    const favoriteButton = screen.getByRole('button', { name: 'Guardar en favoritos' })
    const inactiveClass = favoriteButton.className

    rerender(<Header isFavorite onToggleFavorite={() => {}} />)
    expect(favoriteButton.className).not.toBe(inactiveClass)
  })
})
