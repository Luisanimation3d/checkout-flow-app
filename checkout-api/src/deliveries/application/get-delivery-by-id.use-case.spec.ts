import type { Delivery } from '../domain/delivery';
import { DeliveryNotFoundError } from '../domain/delivery-not-found.error';
import type { DeliveryRepositoryPort } from '../domain/delivery-repository.port';
import { GetDeliveryByIdUseCase } from './get-delivery-by-id.use-case';

const mockDelivery: Delivery = {
  id: 'd1',
  address: 'Calle 123 #45-67',
  city: 'medellin',
  department: 'antioquia',
  status: 'PENDING',
};

describe('GetDeliveryByIdUseCase', () => {
  let repository: jest.Mocked<DeliveryRepositoryPort>;
  let useCase: GetDeliveryByIdUseCase;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      create: jest.fn(),
    };
    useCase = new GetDeliveryByIdUseCase(repository);
  });

  it('returns the delivery when found', async () => {
    repository.findById.mockResolvedValue(mockDelivery);

    const result = await useCase.execute('d1');

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) expect(result.value).toBe(mockDelivery);
  });

  it('fails with DeliveryNotFoundError when the repository returns null', async () => {
    repository.findById.mockResolvedValue(null);

    const result = await useCase.execute('missing');

    expect(result.isFailure).toBe(true);
    if (result.isFailure) expect(result.error).toBeInstanceOf(DeliveryNotFoundError);
  });
});
