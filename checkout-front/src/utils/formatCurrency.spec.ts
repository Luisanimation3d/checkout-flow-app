import { formatCurrency } from './formatCurrency'

describe('formatCurrency', () => {
  it('formats a COP amount with no decimals', () => {
    const result = formatCurrency(149000)
    expect(result).toContain('149.000')
  })

  it('accepts a different currency', () => {
    const result = formatCurrency(100, 'USD', 'en-US')
    expect(result).toBe('$100')
  })

  it('formats zero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
  })
})
