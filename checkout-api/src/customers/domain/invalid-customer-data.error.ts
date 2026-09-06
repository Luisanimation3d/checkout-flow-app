export class InvalidCustomerDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCustomerDataError';
  }
}
