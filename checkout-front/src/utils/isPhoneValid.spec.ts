import { isPhoneValid } from './isPhoneValid'

describe('isPhoneValid', () => {
  it('accepts exactly 10 digits', () => {
    expect(isPhoneValid('3001234567')).toBe(true)
  })

  it('rejects fewer than 10 digits', () => {
    expect(isPhoneValid('300123')).toBe(false)
  })

  it('rejects more than 10 digits', () => {
    expect(isPhoneValid('30012345678')).toBe(false)
  })

  it('rejects non-digit characters', () => {
    expect(isPhoneValid('300-123-4567')).toBe(false)
  })
})
