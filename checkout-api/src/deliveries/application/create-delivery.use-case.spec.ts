import type { Delivery } from '../domain/delivery';
import type { DeliveryRepositoryPort } from '../domain/delivery-repository.port';
import { InvalidDeliveryDataError } from '../domain/invalid-delivery-data.error';
import type { DeliveryInput } from '../domain/delivery-validation';
import { CreateDeliveryUseCase } from './create-delivery.use-case';

const validInput: DeliveryInput = {
  address: 'Calle 123 #45-67',
  city: 'medellin',
  department: 'antioquia',
};

const createdDelivery: Delivery = {
  id: 'd1',
  ...validInput,
  status: 'PENDING',
};

describe('CreateDeliveryUseCase', () => {
  let repository: jest.Mocked<DeliveryRepositoryPort>;
  let useCase: CreateDeliveryUseCase;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      create: jest.fn(),
    };
    useCase = new CreateDeliveryUseCase(repository);
  });

  it('fails with InvalidDeliveryDataError when the input is invalid', async () => {
    const result = await useCase.execute({ ...validInput, address: 'x' });

    expect(result.isFailure).toBe(true);
    if (result.isFailure) expect(result.error).toBeInstanceOf(InvalidDeliveryDataError);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('creates the delivery with status PENDING when the input is valid', async () => {
    repository.create.mockResolvedValue(createdDelivery);

    const result = await useCase.execute(validInput);

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) expect(result.value).toBe(createdDelivery);
    expect(repository.create).toHaveBeenCalledWith({
      address: validInput.address.trim(),
      city: validInput.city,
      department: validInput.department,
      status: 'PENDING',
    });
  });
});
