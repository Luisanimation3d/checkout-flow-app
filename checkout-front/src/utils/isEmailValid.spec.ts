import { isEmailValid } from './isEmailValid'

describe('isEmailValid', () => {
  it('accepts a standard email', () => {
    expect(isEmailValid('john@example.com')).toBe(true)
  })

  it('rejects a value without @', () => {
    expect(isEmailValid('john.example.com')).toBe(false)
  })

  it('rejects a value without a domain', () => {
    expect(isEmailValid('john@')).toBe(false)
  })

  it('rejects a value with spaces', () => {
    expect(isEmailValid('john doe@example.com')).toBe(false)
  })
})
