import type { Repository, UpdateResult } from 'typeorm';
import { TransactionTypeOrmRepository } from './transaction-typeorm.repository';
import type { TransactionOrmEntity } from './transaction.orm-entity';

const row: TransactionOrmEntity = {
  id: '71e83c86-caad-4d36-bafa-ecdc0c6b6127',
  reference: 'checkout-123',
  productId: 'p1',
  customerId: 'c1',
  deliveryId: 'd1',
  amountInCents: 11400000,
  currency: 'COP',
  status: 'PENDING',
  wompiTransactionId: null,
  statusMessage: null,
};

describe('TransactionTypeOrmRepository', () => {
  let repo: jest.Mocked<
    Pick<Repository<TransactionOrmEntity>, 'save' | 'findOne' | 'update' | 'findOneOrFail'>
  >;
  let repository: TransactionTypeOrmRepository;

  beforeEach(() => {
    repo = {
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      findOneOrFail: jest.fn(),
    };
    repository = new TransactionTypeOrmRepository(
      repo as unknown as Repository<TransactionOrmEntity>,
    );
  });

  it('create saves the input and returns the mapped transaction', async () => {
    repo.save.mockResolvedValue(row);

    const result = await repository.create({
      reference: row.reference,
      productId: row.productId,
      customerId: row.customerId,
      deliveryId: row.deliveryId,
      amountInCents: row.amountInCents,
      currency: row.currency,
      status: 'PENDING',
      wompiTransactionId: row.wompiTransactionId,
      statusMessage: row.statusMessage,
    });

    expect(result).toEqual(row);
  });

  it('findById returns null without querying when the id is not a valid UUID', async () => {
    const result = await repository.findById('not-a-uuid');

    expect(result).toBeNull();
    expect(repo.findOne).not.toHaveBeenCalled();
  });

  it('findById returns the mapped transaction when found', async () => {
    repo.findOne.mockResolvedValue(row);

    const result = await repository.findById(row.id);

    expect(result).toEqual(row);
  });

  describe('transitionFromPending', () => {
    it('reports didTransition=true when the conditional UPDATE affects a row', async () => {
      repo.update.mockResolvedValue({ affected: 1 } as UpdateResult);
      repo.findOneOrFail.mockResolvedValue({ ...row, status: 'APPROVED' });

      const result = await repository.transitionFromPending(row.id, {
        status: 'APPROVED',
        wompiTransactionId: 'wompi-1',
        statusMessage: null,
      });

      expect(repo.update).toHaveBeenCalledWith(
        { id: row.id, status: 'PENDING' },
        { status: 'APPROVED', wompiTransactionId: 'wompi-1', statusMessage: null },
      );
      expect(result.didTransition).toBe(true);
      expect(result.transaction.status).toBe('APPROVED');
    });

    it('reports didTransition=false when another request already won the race (0 rows affected)', async () => {
      repo.update.mockResolvedValue({ affected: 0 } as UpdateResult);
      repo.findOneOrFail.mockResolvedValue({ ...row, status: 'APPROVED' });

      const result = await repository.transitionFromPending(row.id, {
        status: 'APPROVED',
        wompiTransactionId: 'wompi-1',
        statusMessage: null,
      });

      expect(result.didTransition).toBe(false);
      // Igual devuelve el estado actual real (lo haya puesto quien haya ganado la carrera)
      expect(result.transaction.status).toBe('APPROVED');
    });

    it('treats affected=undefined as no transition (defensive default)', async () => {
      repo.update.mockResolvedValue({ affected: undefined } as UpdateResult);
      repo.findOneOrFail.mockResolvedValue(row);

      const result = await repository.transitionFromPending(row.id, {
        status: 'ERROR',
        wompiTransactionId: null,
        statusMessage: 'timeout',
      });

      expect(result.didTransition).toBe(false);
    });
  });
});
