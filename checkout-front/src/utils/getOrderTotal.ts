export const getOrderTotal = (productAmount: number, baseFee: number, deliveryFee: number) =>
  productAmount + baseFee + deliveryFee
