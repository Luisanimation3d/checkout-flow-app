import { calculateDeliveryFee } from './calculateDeliveryFee'

describe('calculateDeliveryFee', () => {
  it('applies the medellin multiplier (1x)', () => {
    expect(calculateDeliveryFee(10000, 'medellin')).toBe(10000)
  })

  it('applies the bogota multiplier (1.2x)', () => {
    expect(calculateDeliveryFee(10000, 'bogota')).toBe(12000)
  })

  it('applies the cali multiplier (1.3x)', () => {
    expect(calculateDeliveryFee(10000, 'cali')).toBe(13000)
  })

  it('applies the default multiplier (1.5x) for an unknown city', () => {
    expect(calculateDeliveryFee(10000, 'barranquilla')).toBe(15000)
  })

  it('rounds the result', () => {
    expect(calculateDeliveryFee(999, 'bogota')).toBe(1199)
  })
})
