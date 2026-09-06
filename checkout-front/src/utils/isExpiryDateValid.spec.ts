import { isExpiryDateValid } from './isExpiryDateValid'

describe('isExpiryDateValid', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-06-15'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('rejects a malformed value', () => {
    expect(isExpiryDateValid('13/26')).toBe(false) // mes inválido primero, formato ok
    expect(isExpiryDateValid('1226')).toBe(false)
    expect(isExpiryDateValid('')).toBe(false)
  })

  it('rejects month 00 or month 13', () => {
    expect(isExpiryDateValid('00/27')).toBe(false)
    expect(isExpiryDateValid('13/27')).toBe(false)
  })

  it('rejects a year in the past', () => {
    expect(isExpiryDateValid('12/25')).toBe(false)
  })

  it('rejects the current year with a past month', () => {
    expect(isExpiryDateValid('01/26')).toBe(false)
  })

  it('accepts the current year with the current month', () => {
    expect(isExpiryDateValid('06/26')).toBe(true)
  })

  it('accepts a future year', () => {
    expect(isExpiryDateValid('12/29')).toBe(true)
  })
})
