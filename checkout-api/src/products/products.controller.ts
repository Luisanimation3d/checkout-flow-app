import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { GetProductByIdUseCase } from './application/get-product-by-id.use-case';
import { ListProductsUseCase } from './application/list-products.use-case';
import type { Product } from './domain/product';
import { ProductResponseDto } from './presentation/product-response.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
  ) {}

  @ApiOperation({ summary: 'Lista todos los productos del catálogo' })
  @ApiOkResponse({ type: [ProductResponseDto] })
  @Get()
  findAll(): Promise<Product[]> {
    return this.listProductsUseCase.execute();
  }

  @ApiOperation({ summary: 'Obtiene un producto por id' })
  @ApiParam({ name: 'id', example: '3f6a6e0a-8b3a-4b8b-9f1a-6f2a2b6f4c7a' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ description: 'El producto no existe' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product> {
    const result = await this.getProductByIdUseCase.execute(id);

    if (result.isFailure) {
      throw new NotFoundException(result.error.message);
    }

    return result.value;
  }
}
