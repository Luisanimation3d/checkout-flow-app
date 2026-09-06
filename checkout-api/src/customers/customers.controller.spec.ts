import { NotFoundException } from '@nestjs/common';
import { Result } from '../shared/core/result';
import type { Customer } from './domain/customer';
import { CustomerNotFoundError } from './domain/customer-not-found.error';
import { CustomersController } from './customers.controller';
import type { GetCustomerByIdUseCase } from './application/get-customer-by-id.use-case';

const mockCustomer: Customer = {
  id: 'c1',
  fullName: 'John Doe',
  documentType: 'CC',
  documentId: '1000099928',
  phone: '3001234567',
  email: 'john@example.com',
};

describe('CustomersController', () => {
  let getCustomerByIdUseCase: { execute: jest.Mock };
  let controller: CustomersController;

  beforeEach(() => {
    getCustomerByIdUseCase = { execute: jest.fn() };
    controller = new CustomersController(
      getCustomerByIdUseCase as unknown as GetCustomerByIdUseCase,
    );
  });

  it('returns the customer on success', async () => {
    getCustomerByIdUseCase.execute.mockResolvedValue(Result.ok(mockCustomer));

    const result = await controller.findOne('c1');

    expect(result).toBe(mockCustomer);
  });

  it('throws NotFoundException when the use case fails', async () => {
    getCustomerByIdUseCase.execute.mockResolvedValue(
      Result.fail(new CustomerNotFoundError('missing')),
    );

    await expect(controller.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});
