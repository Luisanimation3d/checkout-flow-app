import { detectCardBrand } from './detectCardBrand'

describe('detectCardBrand', () => {
  it('detects Visa (starts with 4)', () => {
    expect(detectCardBrand('4242424242424242')).toBe('visa')
  })

  it('detects Mastercard (51-55 prefix)', () => {
    expect(detectCardBrand('5500000000000004')).toBe('mastercard')
  })

  it('detects Mastercard (2221-2720 extended range)', () => {
    expect(detectCardBrand('2223000048400011')).toBe('mastercard')
  })

  it('returns unknown for an unrecognized prefix', () => {
    expect(detectCardBrand('6011000000000004')).toBe('unknown')
  })

  it('returns unknown for an empty string', () => {
    expect(detectCardBrand('')).toBe('unknown')
  })
})
