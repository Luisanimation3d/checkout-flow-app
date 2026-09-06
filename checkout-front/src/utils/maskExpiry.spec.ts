import { maskExpiry } from './maskExpiry'

describe('maskExpiry', () => {
  it('pads an empty value with placeholders', () => {
    expect(maskExpiry('')).toBe('MM/YY')
  })

  it('pads a partial month', () => {
    expect(maskExpiry('1')).toBe('1M/YY')
  })

  it('leaves a complete month, pads the year', () => {
    expect(maskExpiry('12/')).toBe('12/YY')
  })

  it('leaves a complete value unchanged', () => {
    expect(maskExpiry('12/29')).toBe('12/29')
  })
})
