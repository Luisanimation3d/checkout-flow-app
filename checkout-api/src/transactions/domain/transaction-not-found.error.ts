export class TransactionNotFoundError extends Error {
  constructor(id: string) {
    super(`Transaction with id "${id}" was not found`);
    this.name = 'TransactionNotFoundError';
  }
}
