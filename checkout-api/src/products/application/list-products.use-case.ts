import { Inject, Injectable } from '@nestjs/common';
import type { Product } from '../domain/product';
import {
  PRODUCT_REPOSITORY,
  type ProductRepositoryPort,
} from '../domain/product-repository.port';

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  execute(): Promise<Product[]> {
    return this.productRepository.findAll();
  }
}
