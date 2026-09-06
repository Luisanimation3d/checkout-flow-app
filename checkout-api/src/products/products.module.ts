import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetProductByIdUseCase } from './application/get-product-by-id.use-case';
import { ListProductsUseCase } from './application/list-products.use-case';
import { PRODUCT_REPOSITORY } from './domain/product-repository.port';
import { ProductOrmEntity } from './infrastructure/product.orm-entity';
import { ProductSeeder } from './infrastructure/product.seeder';
import { ProductTypeOrmRepository } from './infrastructure/product-typeorm.repository';
import { ProductsController } from './products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductOrmEntity])],
  controllers: [ProductsController],
  providers: [
    ListProductsUseCase,
    GetProductByIdUseCase,
    ProductSeeder,
    { provide: PRODUCT_REPOSITORY, useClass: ProductTypeOrmRepository },
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductsModule {}
