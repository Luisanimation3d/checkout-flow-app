import type { Repository } from 'typeorm';
import { ProductTypeOrmRepository } from './product-typeorm.repository';
import type { ProductOrmEntity } from './product.orm-entity';

const row: ProductOrmEntity = {
  id: '3ef83c86-caad-4d36-bafa-ecdc0c6b6127',
  title: 'Speaker',
  description: 'A speaker',
  price: 100000,
  currency: 'COP',
  stock: 5,
  images: ['a.jpg'],
  deliveryFee: 9000,
};

describe('ProductTypeOrmRepository', () => {
  let repo: jest.Mocked<Pick<Repository<ProductOrmEntity>, 'find' | 'findOne' | 'decrement'>>;
  let repository: ProductTypeOrmRepository;

  beforeEach(() => {
    repo = { find: jest.fn(), findOne: jest.fn(), decrement: jest.fn() };
    repository = new ProductTypeOrmRepository(repo as unknown as Repository<ProductOrmEntity>);
  });

  it('findAll maps every row to the domain shape', async () => {
    repo.find.mockResolvedValue([row]);

    const result = await repository.findAll();

    expect(result).toEqual([
      {
        id: row.id,
        title: row.title,
        description: row.description,
        price: row.price,
        currency: row.currency,
        stock: row.stock,
        images: row.images,
        deliveryFee: row.deliveryFee,
      },
    ]);
  });

  it('findById returns null without querying when the id is not a valid UUID', async () => {
    const result = await repository.findById('not-a-uuid');

    expect(result).toBeNull();
    expect(repo.findOne).not.toHaveBeenCalled();
  });

  it('findById returns the mapped product when found', async () => {
    repo.findOne.mockResolvedValue(row);

    const result = await repository.findById(row.id);

    expect(result).toEqual(expect.objectContaining({ id: row.id, title: row.title }));
  });

  it('findById returns null when a valid UUID matches no row', async () => {
    repo.findOne.mockResolvedValue(null);

    const result = await repository.findById(row.id);

    expect(result).toBeNull();
  });

  it('decreaseStock atomically decrements via the repository (not read-then-write)', async () => {
    await repository.decreaseStock(row.id);

    expect(repo.decrement).toHaveBeenCalledWith({ id: row.id }, 'stock', 1);
  });
});
