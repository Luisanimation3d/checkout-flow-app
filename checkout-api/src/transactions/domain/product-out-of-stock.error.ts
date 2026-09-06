export class ProductOutOfStockError extends Error {
  constructor(productId: string) {
    super(`Product with id "${productId}" is out of stock`);
    this.name = 'ProductOutOfStockError';
  }
}
