import { isCvvValid } from './isCvvValid'

describe('isCvvValid', () => {
  it('accepts exactly 3 digits', () => {
    expect(isCvvValid('123')).toBe(true)
  })

  it('rejects fewer than 3 digits', () => {
    expect(isCvvValid('12')).toBe(false)
  })

  it('rejects more than 3 digits', () => {
    expect(isCvvValid('1234')).toBe(false)
  })

  it('rejects non-digit characters', () => {
    expect(isCvvValid('12a')).toBe(false)
  })
})
