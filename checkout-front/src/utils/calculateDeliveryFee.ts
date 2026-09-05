const CITY_MULTIPLIER: Record<string, number> = {
  medellin: 1,
  bogota: 1.2,
  cali: 1.3,
}

const DEFAULT_MULTIPLIER = 1.5

// Mock temporal: este cálculo debería resolverlo el backend a partir del producto y la ciudad de entrega.
export const calculateDeliveryFee = (productDeliveryFee: number, city: string) => {
  const multiplier = CITY_MULTIPLIER[city] ?? DEFAULT_MULTIPLIER
  return Math.round(productDeliveryFee * multiplier)
}
