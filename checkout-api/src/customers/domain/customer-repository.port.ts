import type { Customer } from './customer';

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export interface CustomerRepositoryPort {
  findById(id: string): Promise<Customer | null>;
  findByDocumentId(documentId: string): Promise<Customer | null>;
  create(input: Omit<Customer, 'id'>): Promise<Customer>;
}
