import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../shared/core/result';
import type { Product } from '../domain/product';
import { ProductNotFoundError } from '../domain/product-not-found.error';
import {
  PRODUCT_REPOSITORY,
  type ProductRepositoryPort,
} from '../domain/product-repository.port';

@Injectable()
export class GetProductByIdUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<Product, ProductNotFoundError>> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      return Result.fail(new ProductNotFoundError(id));
    }

    return Result.ok(product);
  }
}
