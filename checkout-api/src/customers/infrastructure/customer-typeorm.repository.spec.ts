import type { Repository } from 'typeorm';
import { CustomerTypeOrmRepository } from './customer-typeorm.repository';
import type { CustomerOrmEntity } from './customer.orm-entity';

const row: CustomerOrmEntity = {
  id: 'c1e83c86-caad-4d36-bafa-ecdc0c6b6127',
  fullName: 'John Doe',
  documentType: 'CC',
  documentId: '1000099928',
  phone: '3001234567',
  email: 'john@example.com',
};

describe('CustomerTypeOrmRepository', () => {
  let repo: jest.Mocked<Pick<Repository<CustomerOrmEntity>, 'findOne' | 'save'>>;
  let repository: CustomerTypeOrmRepository;

  beforeEach(() => {
    repo = { findOne: jest.fn(), save: jest.fn() };
    repository = new CustomerTypeOrmRepository(repo as unknown as Repository<CustomerOrmEntity>);
  });

  it('findById returns null without querying when the id is not a valid UUID', async () => {
    const result = await repository.findById('not-a-uuid');

    expect(result).toBeNull();
    expect(repo.findOne).not.toHaveBeenCalled();
  });

  it('findById returns the mapped customer when found', async () => {
    repo.findOne.mockResolvedValue(row);

    const result = await repository.findById(row.id);

    expect(result).toEqual(row);
  });

  it('findByDocumentId does not require a UUID (documentId is not one)', async () => {
    repo.findOne.mockResolvedValue(row);

    const result = await repository.findByDocumentId(row.documentId);

    expect(repo.findOne).toHaveBeenCalledWith({ where: { documentId: row.documentId } });
    expect(result).toEqual(row);
  });

  it('findByDocumentId returns null when nothing matches', async () => {
    repo.findOne.mockResolvedValue(null);

    const result = await repository.findByDocumentId('0000000000');

    expect(result).toBeNull();
  });

  it('create saves the input and returns the mapped customer', async () => {
    repo.save.mockResolvedValue(row);

    const result = await repository.create({
      fullName: row.fullName,
      documentType: row.documentType as 'CC',
      documentId: row.documentId,
      phone: row.phone,
      email: row.email,
    });

    expect(result).toEqual(row);
  });
});
