export class ProductNotFoundError extends Error {
  constructor(id: string) {
    super(`Product with id "${id}" was not found`);
    this.name = 'ProductNotFoundError';
  }
}
