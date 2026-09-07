import { NotFoundException } from '@nestjs/common';
import { Result } from '../shared/core/result';
import type { Product } from './domain/product';
import { ProductNotFoundError } from './domain/product-not-found.error';
import { ProductsController } from './products.controller';
import type { GetProductByIdUseCase } from './application/get-product-by-id.use-case';
import type { ListProductsUseCase } from './application/list-products.use-case';

const mockProduct: Product = {
  id: 'p1',
  title: 'Speaker',
  description: 'A speaker',
  price: 100000,
  currency: 'COP',
  stock: 5,
  images: ['a.jpg'],
  deliveryFee: 9000,
};

describe('ProductsController', () => {
  let listProductsUseCase: { execute: jest.Mock };
  let getProductByIdUseCase: { execute: jest.Mock };
  let controller: ProductsController;

  beforeEach(() => {
    listProductsUseCase = { execute: jest.fn() };
    getProductByIdUseCase = { execute: jest.fn() };
    controller = new ProductsController(
      listProductsUseCase as unknown as ListProductsUseCase,
      getProductByIdUseCase as unknown as GetProductByIdUseCase,
    );
  });

  describe('findAll', () => {
    it('returns whatever the use case returns', async () => {
      listProductsUseCase.execute.mockResolvedValue([mockProduct]);

      const result = await controller.findAll();

      expect(result).toEqual([mockProduct]);
    });
  });

  describe('findOne', () => {
    it('returns the product on success', async () => {
      getProductByIdUseCase.execute.mockResolvedValue(Result.ok(mockProduct));

      const result = await controller.findOne('p1');

      expect(result).toBe(mockProduct);
    });

    it('throws NotFoundException when the use case fails', async () => {
      getProductByIdUseCase.execute.mockResolvedValue(
        Result.fail(new ProductNotFoundError('missing')),
      );

      await expect(controller.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
