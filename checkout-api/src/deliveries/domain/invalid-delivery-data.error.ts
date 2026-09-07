export class InvalidDeliveryDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidDeliveryDataError';
  }
}
