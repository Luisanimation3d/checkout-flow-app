import type { Product } from './product';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface ProductRepositoryPort {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  decreaseStock(id: string): Promise<void>;
}
