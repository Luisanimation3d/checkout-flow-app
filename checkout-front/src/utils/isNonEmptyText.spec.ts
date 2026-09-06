import { isNonEmptyText } from './isNonEmptyText'

describe('isNonEmptyText', () => {
  it('accepts text meeting the default minimum length (2)', () => {
    expect(isNonEmptyText('ok')).toBe(true)
  })

  it('rejects text shorter than the default minimum', () => {
    expect(isNonEmptyText('a')).toBe(false)
  })

  it('rejects whitespace-only text', () => {
    expect(isNonEmptyText('   ')).toBe(false)
  })

  it('respects a custom minimum length', () => {
    expect(isNonEmptyText('abcd', 5)).toBe(false)
    expect(isNonEmptyText('abcde', 5)).toBe(true)
  })
})
