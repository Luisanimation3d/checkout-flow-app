export const generateReference = (): string =>
  `checkout-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
