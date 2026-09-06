import { isDocumentIdValid } from './isDocumentIdValid'

describe('isDocumentIdValid', () => {
  it('accepts a 6-digit id (minimum)', () => {
    expect(isDocumentIdValid('123456')).toBe(true)
  })

  it('accepts a 10-digit id (maximum)', () => {
    expect(isDocumentIdValid('1234567890')).toBe(true)
  })

  it('rejects fewer than 6 digits', () => {
    expect(isDocumentIdValid('12345')).toBe(false)
  })

  it('rejects more than 10 digits', () => {
    expect(isDocumentIdValid('12345678901')).toBe(false)
  })

  it('rejects non-digit characters', () => {
    expect(isDocumentIdValid('12345a')).toBe(false)
  })
})
