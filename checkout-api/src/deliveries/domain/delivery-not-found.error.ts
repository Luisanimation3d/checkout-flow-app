export class DeliveryNotFoundError extends Error {
  constructor(id: string) {
    super(`Delivery with id "${id}" was not found`);
    this.name = 'DeliveryNotFoundError';
  }
}
