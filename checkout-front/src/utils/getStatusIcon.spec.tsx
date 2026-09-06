import { render } from '@testing-library/react'
import { getStatusIcon } from './getStatusIcon'

describe('getStatusIcon', () => {
  it('returns undefined when there is no status', () => {
    expect(getStatusIcon(undefined)).toBeUndefined()
  })

  it('renders an icon for "valid"', () => {
    const { container } = render(<>{getStatusIcon('valid')}</>)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders an icon for "invalid"', () => {
    const { container } = render(<>{getStatusIcon('invalid')}</>)
    expect(container.querySelector('svg')).not.toBeNull()
  })
})
