import { generateReference } from './generate-reference';

describe('generateReference', () => {
  it('starts with the "checkout-" prefix', () => {
    expect(generateReference()).toMatch(/^checkout-\d+-[a-z0-9]+$/);
  });

  it('generates a unique value on each call', () => {
    const first = generateReference();
    const second = generateReference();

    expect(first).not.toBe(second);
  });
});
