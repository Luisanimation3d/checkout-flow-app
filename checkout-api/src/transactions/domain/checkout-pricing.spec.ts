import { BASE_FEE, calculateDeliveryFee, getOrderAmountInCents } from './checkout-pricing';

describe('calculateDeliveryFee', () => {
  it('applies the medellin multiplier (1x)', () => {
    expect(calculateDeliveryFee(10000, 'medellin')).toBe(10000);
  });

  it('applies the bogota multiplier (1.2x)', () => {
    expect(calculateDeliveryFee(10000, 'bogota')).toBe(12000);
  });

  it('applies the cali multiplier (1.3x)', () => {
    expect(calculateDeliveryFee(10000, 'cali')).toBe(13000);
  });

  it('applies the default multiplier (1.5x) for any other city', () => {
    expect(calculateDeliveryFee(10000, 'barranquilla')).toBe(15000);
  });

  it('rounds the result', () => {
    // 999 * 1.2 = 1198.8 -> debe redondear a 1199
    expect(calculateDeliveryFee(999, 'bogota')).toBe(1199);
  });
});

describe('getOrderAmountInCents', () => {
  it('sums price + base fee + delivery fee, converted to cents', () => {
    const amount = getOrderAmountInCents(149000, 9000);
    expect(amount).toBe((149000 + BASE_FEE + 9000) * 100);
  });

  it('handles a zero delivery fee', () => {
    const amount = getOrderAmountInCents(100000, 0);
    expect(amount).toBe((100000 + BASE_FEE) * 100);
  });
});
