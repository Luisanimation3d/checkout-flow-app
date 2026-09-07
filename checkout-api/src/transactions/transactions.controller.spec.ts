import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Result } from '../shared/core/result';
import { TransactionNotFoundError } from './domain/transaction-not-found.error';
import type { Transaction } from './domain/transaction';
import { TransactionsController } from './transactions.controller';
import type { CreateTransactionUseCase } from './application/create-transaction.use-case';
import type { GetTransactionByIdUseCase } from './application/get-transaction-by-id.use-case';
import type { CreateTransactionDto } from './presentation/create-transaction.dto';

const mockTransaction: Transaction = {
  id: 't1',
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

const dto = {
  productId: 'p1',
  cardToken: 'tok_1',
  installments: 1,
  customer: {
    fullName: 'John Doe',
    documentType: 'CC',
    documentId: '1000099928',
    phone: '3001234567',
    email: 'john@example.com',
  },
  delivery: { address: 'Calle 123 #45-67', city: 'medellin', department: 'antioquia' },
} as CreateTransactionDto;

describe('TransactionsController', () => {
  let createTransactionUseCase: { execute: jest.Mock };
  let getTransactionByIdUseCase: { execute: jest.Mock };
  let controller: TransactionsController;

  beforeEach(() => {
    createTransactionUseCase = { execute: jest.fn() };
    getTransactionByIdUseCase = { execute: jest.fn() };
    controller = new TransactionsController(
      createTransactionUseCase as unknown as CreateTransactionUseCase,
      getTransactionByIdUseCase as unknown as GetTransactionByIdUseCase,
    );
  });

  describe('create', () => {
    it('returns the transaction on success', async () => {
      createTransactionUseCase.execute.mockResolvedValue(Result.ok(mockTransaction));

      const result = await controller.create(dto);

      expect(result).toBe(mockTransaction);
    });

    it('throws BadRequestException when the use case fails', async () => {
      createTransactionUseCase.execute.mockResolvedValue(Result.fail(new Error('bad input')));

      await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('returns the transaction on success', async () => {
      getTransactionByIdUseCase.execute.mockResolvedValue(Result.ok(mockTransaction));

      const result = await controller.findOne('t1');

      expect(result).toBe(mockTransaction);
    });

    it('throws NotFoundException when the use case fails', async () => {
      getTransactionByIdUseCase.execute.mockResolvedValue(
        Result.fail(new TransactionNotFoundError('missing')),
      );

      await expect(controller.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
