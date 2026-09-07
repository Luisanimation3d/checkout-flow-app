import type { Customer } from '../domain/customer';
import { CustomerNotFoundError } from '../domain/customer-not-found.error';
import type { CustomerRepositoryPort } from '../domain/customer-repository.port';
import { GetCustomerByIdUseCase } from './get-customer-by-id.use-case';

const mockCustomer: Customer = {
  id: 'c1',
  fullName: 'John Doe',
  documentType: 'CC',
  documentId: '1000099928',
  phone: '3001234567',
  email: 'john@example.com',
};

describe('GetCustomerByIdUseCase', () => {
  let repository: jest.Mocked<CustomerRepositoryPort>;
  let useCase: GetCustomerByIdUseCase;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      findByDocumentId: jest.fn(),
      create: jest.fn(),
    };
    useCase = new GetCustomerByIdUseCase(repository);
  });

  it('returns the customer when found', async () => {
    repository.findById.mockResolvedValue(mockCustomer);

    const result = await useCase.execute('c1');

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) expect(result.value).toBe(mockCustomer);
  });

  it('fails with CustomerNotFoundError when the repository returns null', async () => {
    repository.findById.mockResolvedValue(null);

    const result = await useCase.execute('missing');

    expect(result.isFailure).toBe(true);
    if (result.isFailure) expect(result.error).toBeInstanceOf(CustomerNotFoundError);
  });
});
