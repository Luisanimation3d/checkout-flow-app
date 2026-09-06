import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { GetProductByIdUseCase } from './application/get-product-by-id.use-case';
import { ListProductsUseCase } from './application/list-products.use-case';
import type { Product } from './domain/product';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
  ) {}

  @Get()
  findAll(): Promise<Product[]> {
    return this.listProductsUseCase.execute();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product> {
    const result = await this.getProductByIdUseCase.execute(id);

    if (result.isFailure) {
      throw new NotFoundException(result.error.message);
    }

    return result.value;
  }
}
