import type { Product } from '../domain/product';
import { ProductNotFoundError } from '../domain/product-not-found.error';
import type { ProductRepositoryPort } from '../domain/product-repository.port';
import { GetProductByIdUseCase } from './get-product-by-id.use-case';

const mockProduct: Product = {
  id: 'a1',
  title: 'Speaker',
  description: 'A speaker',
  price: 100000,
  currency: 'COP',
  stock: 5,
  images: ['a.jpg'],
  deliveryFee: 9000,
};

describe('GetProductByIdUseCase', () => {
  let repository: jest.Mocked<ProductRepositoryPort>;
  let useCase: GetProductByIdUseCase;

  beforeEach(() => {
    repository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      decreaseStock: jest.fn(),
    };
    useCase = new GetProductByIdUseCase(repository);
  });

  it('returns the product when found', async () => {
    repository.findById.mockResolvedValue(mockProduct);

    const result = await useCase.execute('a1');

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) expect(result.value).toBe(mockProduct);
  });

  it('fails with ProductNotFoundError when the repository returns null', async () => {
    repository.findById.mockResolvedValue(null);

    const result = await useCase.execute('missing');

    expect(result.isFailure).toBe(true);
    if (result.isFailure) expect(result.error).toBeInstanceOf(ProductNotFoundError);
  });
});
