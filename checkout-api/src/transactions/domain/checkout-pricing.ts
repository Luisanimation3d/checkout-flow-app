export const BASE_FEE = 5000;

const CITY_MULTIPLIER: Record<string, number> = {
  medellin: 1,
  bogota: 1.2,
  cali: 1.3,
};

const DEFAULT_MULTIPLIER = 1.5;

// Debe reflejar exactamente utils/calculateDeliveryFee.ts del frontend:
// el total mostrado en la UI y el total realmente cobrado tienen que coincidir.
export const calculateDeliveryFee = (
  productDeliveryFee: number,
  city: string,
): number => {
  const multiplier = CITY_MULTIPLIER[city] ?? DEFAULT_MULTIPLIER;
  return Math.round(productDeliveryFee * multiplier);
};

export const getOrderAmountInCents = (
  productPrice: number,
  deliveryFee: number,
): number => (productPrice + BASE_FEE + deliveryFee) * 100;
