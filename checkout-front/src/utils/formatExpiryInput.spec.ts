import { formatExpiryInput } from './formatExpiryInput'

describe('formatExpiryInput', () => {
  it('returns raw digits when 2 or fewer', () => {
    expect(formatExpiryInput('1')).toBe('1')
    expect(formatExpiryInput('12')).toBe('12')
  })

  it('inserts a slash after the month once a 3rd digit is typed', () => {
    expect(formatExpiryInput('123')).toBe('12/3')
  })

  it('formats a full MM/YY value', () => {
    expect(formatExpiryInput('1229')).toBe('12/29')
  })

  it('strips non-digit characters and truncates to 4 digits', () => {
    expect(formatExpiryInput('12/29/99')).toBe('12/29')
  })
})
