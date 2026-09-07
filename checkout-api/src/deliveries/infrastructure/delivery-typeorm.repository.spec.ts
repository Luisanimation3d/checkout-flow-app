import type { Repository } from 'typeorm';
import { DeliveryTypeOrmRepository } from './delivery-typeorm.repository';
import type { DeliveryOrmEntity } from './delivery.orm-entity';

const row: DeliveryOrmEntity = {
  id: 'd1e83c86-caad-4d36-bafa-ecdc0c6b6127',
  address: 'Calle 123 #45-67',
  city: 'medellin',
  department: 'antioquia',
  status: 'PENDING',
};

describe('DeliveryTypeOrmRepository', () => {
  let repo: jest.Mocked<Pick<Repository<DeliveryOrmEntity>, 'findOne' | 'save'>>;
  let repository: DeliveryTypeOrmRepository;

  beforeEach(() => {
    repo = { findOne: jest.fn(), save: jest.fn() };
    repository = new DeliveryTypeOrmRepository(repo as unknown as Repository<DeliveryOrmEntity>);
  });

  it('findById returns null without querying when the id is not a valid UUID', async () => {
    const result = await repository.findById('not-a-uuid');

    expect(result).toBeNull();
    expect(repo.findOne).not.toHaveBeenCalled();
  });

  it('findById returns the mapped delivery when found', async () => {
    repo.findOne.mockResolvedValue(row);

    const result = await repository.findById(row.id);

    expect(result).toEqual(row);
  });

  it('findById returns null when a valid UUID matches no row', async () => {
    repo.findOne.mockResolvedValue(null);

    const result = await repository.findById(row.id);

    expect(result).toBeNull();
  });

  it('create saves the input and returns the mapped delivery', async () => {
    repo.save.mockResolvedValue(row);

    const result = await repository.create({
      address: row.address,
      city: row.city,
      department: row.department,
      status: 'PENDING',
    });

    expect(result).toEqual(row);
  });
});
