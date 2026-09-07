import { isCardholderNameValid } from './isCardholderNameValid'

describe('isCardholderNameValid', () => {
  it('accepts a name with 5 or more characters', () => {
    expect(isCardholderNameValid('LUIS CORREA')).toBe(true)
  })

  it('rejects a name shorter than 5 characters (Wompi minimum)', () => {
    expect(isCardholderNameValid('LUIS')).toBe(false)
  })

  it('rejects a name containing digits', () => {
    expect(isCardholderNameValid('LUIS3')).toBe(false)
  })

  it('trims surrounding whitespace before validating', () => {
    expect(isCardholderNameValid('  LUIS CORREA  ')).toBe(true)
  })
})
