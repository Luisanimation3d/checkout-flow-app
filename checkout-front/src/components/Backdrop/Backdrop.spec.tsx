import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Backdrop } from './Backdrop'

describe('Backdrop', () => {
  it('renders nothing when closed', () => {
    render(<Backdrop isOpen={false} onClose={() => {}} content={<div>Contenido</div>} />)

    expect(screen.queryByText('Contenido')).not.toBeInTheDocument()
  })

  it('renders the content and footer when open', () => {
    render(
      <Backdrop
        isOpen
        onClose={() => {}}
        content={<div>Contenido</div>}
        footer={<div>Pie</div>}
      />,
    )

    expect(screen.getByText('Contenido')).toBeInTheDocument()
    expect(screen.getByText('Pie')).toBeInTheDocument()
  })

  it('calls onClose when clicking the overlay', async () => {
    const onClose = jest.fn()
    const { container } = render(
      <Backdrop isOpen onClose={onClose} content={<div>Contenido</div>} />,
    )

    await userEvent.click(container.firstElementChild as HTMLElement)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when clicking inside the content (stopPropagation)', async () => {
    const onClose = jest.fn()
    render(<Backdrop isOpen onClose={onClose} content={<div>Contenido</div>} />)

    await userEvent.click(screen.getByText('Contenido'))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when the Escape key is pressed', async () => {
    const onClose = jest.fn()
    render(<Backdrop isOpen onClose={onClose} content={<div>Contenido</div>} />)

    await userEvent.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('locks body scroll while open', () => {
    const { unmount } = render(
      <Backdrop isOpen onClose={() => {}} content={<div>Contenido</div>} />,
    )

    expect(document.body.style.overflow).toBe('hidden')

    unmount()
    expect(document.body.style.overflow).toBe('')
  })
})
