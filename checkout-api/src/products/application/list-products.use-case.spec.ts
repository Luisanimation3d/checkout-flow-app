import type { Product } from '../domain/product';
import type { ProductRepositoryPort } from '../domain/product-repository.port';
import { ListProductsUseCase } from './list-products.use-case';

describe('ListProductsUseCase', () => {
  let repository: jest.Mocked<ProductRepositoryPort>;
  let useCase: ListProductsUseCase;

  beforeEach(() => {
    repository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      decreaseStock: jest.fn(),
    };
    useCase = new ListProductsUseCase(repository);
  });

  it('returns whatever the repository returns', async () => {
    const products: Product[] = [
      {
        id: 'a1',
        title: 'Speaker',
        description: 'A speaker',
        price: 100000,
        currency: 'COP',
        stock: 5,
        images: ['a.jpg'],
        deliveryFee: 9000,
      },
    ];
    repository.findAll.mockResolvedValue(products);

    const result = await useCase.execute();

    expect(result).toBe(products);
  });

  it('returns an empty array when there are no products', async () => {
    repository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
