import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductGallery } from './ProductGallery'

const images = ['a.jpg', 'b.jpg', 'c.jpg']

describe('ProductGallery', () => {
  it('shows the first image by default', () => {
    render(<ProductGallery images={images} alt="Speaker" />)

    expect(screen.getByRole('img', { name: 'Speaker - imagen 1' })).toHaveAttribute('src', 'a.jpg')
  })

  it('does not render arrows/thumbnails for a single image', () => {
    render(<ProductGallery images={['a.jpg']} alt="Speaker" />)

    expect(screen.queryByRole('button', { name: 'Imagen siguiente' })).not.toBeInTheDocument()
  })

  it('advances to the next image when the next arrow is clicked', async () => {
    render(<ProductGallery images={images} alt="Speaker" />)

    await userEvent.click(screen.getByLabelText('Imagen siguiente'))

    expect(screen.getByRole('img', { name: 'Speaker - imagen 2' })).toHaveAttribute('src', 'b.jpg')
  })

  it('wraps around to the last image when going previous from the first', async () => {
    render(<ProductGallery images={images} alt="Speaker" />)

    await userEvent.click(screen.getByLabelText('Imagen anterior'))

    expect(screen.getByRole('img', { name: 'Speaker - imagen 3' })).toHaveAttribute('src', 'c.jpg')
  })

  it('jumps to the image whose thumbnail was clicked', async () => {
    render(<ProductGallery images={images} alt="Speaker" />)

    await userEvent.click(screen.getByRole('button', { name: 'Ver imagen 3' }))

    expect(screen.getByRole('img', { name: 'Speaker - imagen 3' })).toHaveAttribute('src', 'c.jpg')
  })

  it('renders the overlay content when provided', () => {
    render(<ProductGallery images={images} alt="Speaker" overlay={<div data-testid="overlay" />} />)

    expect(screen.getByTestId('overlay')).toBeInTheDocument()
  })
})
