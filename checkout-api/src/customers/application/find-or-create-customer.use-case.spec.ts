import type { Customer } from '../domain/customer';
import type { CustomerRepositoryPort } from '../domain/customer-repository.port';
import { InvalidCustomerDataError } from '../domain/invalid-customer-data.error';
import type { CustomerInput } from '../domain/customer-validation';
import { FindOrCreateCustomerUseCase } from './find-or-create-customer.use-case';

const validInput: CustomerInput = {
  fullName: 'John Doe',
  documentType: 'CC',
  documentId: '1000099928',
  phone: '3001234567',
  email: 'john@example.com',
};

const existingCustomer: Customer = {
  id: 'c1',
  fullName: 'John Doe',
  documentType: 'CC',
  documentId: '1000099928',
  phone: '3001234567',
  email: 'john@example.com',
};

describe('FindOrCreateCustomerUseCase', () => {
  let repository: jest.Mocked<CustomerRepositoryPort>;
  let useCase: FindOrCreateCustomerUseCase;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      findByDocumentId: jest.fn(),
      create: jest.fn(),
    };
    useCase = new FindOrCreateCustomerUseCase(repository);
  });

  it('fails with InvalidCustomerDataError when the input is invalid', async () => {
    const result = await useCase.execute({ ...validInput, email: 'not-an-email' });

    expect(result.isFailure).toBe(true);
    if (result.isFailure) expect(result.error).toBeInstanceOf(InvalidCustomerDataError);
    expect(repository.findByDocumentId).not.toHaveBeenCalled();
  });

  it('reuses an existing customer found by documentId instead of creating a new one', async () => {
    repository.findByDocumentId.mockResolvedValue(existingCustomer);

    const result = await useCase.execute(validInput);

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) expect(result.value).toBe(existingCustomer);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('creates a new customer when none exists with that documentId', async () => {
    repository.findByDocumentId.mockResolvedValue(null);
    repository.create.mockResolvedValue(existingCustomer);

    const result = await useCase.execute(validInput);

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) expect(result.value).toBe(existingCustomer);
    expect(repository.create).toHaveBeenCalledWith({
      fullName: validInput.fullName.trim(),
      documentType: validInput.documentType,
      documentId: validInput.documentId,
      phone: validInput.phone,
      email: validInput.email,
    });
  });
});
