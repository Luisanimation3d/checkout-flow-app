import { formatCardNumberInput } from './formatCardNumberInput'

describe('formatCardNumberInput', () => {
  it('groups digits in blocks of 4 separated by spaces', () => {
    expect(formatCardNumberInput('4242424242424242')).toBe('4242 4242 4242 4242')
  })

  it('strips non-digit characters before formatting', () => {
    expect(formatCardNumberInput('4242-4242-4242-4242')).toBe('4242 4242 4242 4242')
  })

  it('truncates to the max digit length', () => {
    expect(formatCardNumberInput('42424242424242429999')).toBe('4242 4242 4242 4242')
  })

  it('returns an empty string for empty input', () => {
    expect(formatCardNumberInput('')).toBe('')
  })

  it('formats a partial number without trailing space', () => {
    expect(formatCardNumberInput('424')).toBe('424')
  })
})
