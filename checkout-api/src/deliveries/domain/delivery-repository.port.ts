import type { Delivery } from './delivery';

export const DELIVERY_REPOSITORY = Symbol('DELIVERY_REPOSITORY');

export interface DeliveryRepositoryPort {
  findById(id: string): Promise<Delivery | null>;
  create(input: Omit<Delivery, 'id'>): Promise<Delivery>;
}
