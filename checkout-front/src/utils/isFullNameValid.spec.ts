import { isFullNameValid } from './isFullNameValid'

describe('isFullNameValid', () => {
  it('accepts a normal full name', () => {
    expect(isFullNameValid('John Doe')).toBe(true)
  })

  it('accepts accented characters', () => {
    expect(isFullNameValid('José Ángel Muñoz')).toBe(true)
  })

  it('rejects names shorter than 3 characters', () => {
    expect(isFullNameValid('Jo')).toBe(false)
  })

  it('rejects names containing digits', () => {
    expect(isFullNameValid('John3')).toBe(false)
  })

  it('trims surrounding whitespace before validating', () => {
    expect(isFullNameValid('  John Doe  ')).toBe(true)
  })
})
