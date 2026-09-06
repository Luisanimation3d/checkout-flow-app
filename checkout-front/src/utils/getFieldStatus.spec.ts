import { getFieldStatus } from './getFieldStatus'

describe('getFieldStatus', () => {
  it('returns undefined when the field is not complete yet', () => {
    expect(getFieldStatus(false, true)).toBeUndefined()
  })

  it('returns "valid" when complete and valid', () => {
    expect(getFieldStatus(true, true)).toBe('valid')
  })

  it('returns "invalid" when complete but not valid', () => {
    expect(getFieldStatus(true, false)).toBe('invalid')
  })
})
