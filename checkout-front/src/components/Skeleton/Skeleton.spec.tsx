import { render } from '@testing-library/react'
import { Skeleton } from './Skeleton'

describe('Skeleton', () => {
  it('applies the given width/height/borderRadius as inline styles', () => {
    const { container } = render(
      <Skeleton width="100%" height="16px" borderRadius="8px" />,
    )

    const element = container.firstElementChild as HTMLElement
    expect(element.style.width).toBe('100%')
    expect(element.style.height).toBe('16px')
    expect(element.style.borderRadius).toBe('8px')
  })

  it('merges a custom className with the base one', () => {
    const { container } = render(<Skeleton className="extra" />)

    expect(container.firstElementChild).toHaveClass('extra')
  })
})
