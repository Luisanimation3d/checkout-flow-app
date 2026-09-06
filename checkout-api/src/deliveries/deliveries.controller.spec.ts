import { NotFoundException } from '@nestjs/common';
import { Result } from '../shared/core/result';
import type { Delivery } from './domain/delivery';
import { DeliveryNotFoundError } from './domain/delivery-not-found.error';
import { DeliveriesController } from './deliveries.controller';
import type { GetDeliveryByIdUseCase } from './application/get-delivery-by-id.use-case';

const mockDelivery: Delivery = {
  id: 'd1',
  address: 'Calle 123 #45-67',
  city: 'medellin',
  department: 'antioquia',
  status: 'PENDING',
};

describe('DeliveriesController', () => {
  let getDeliveryByIdUseCase: { execute: jest.Mock };
  let controller: DeliveriesController;

  beforeEach(() => {
    getDeliveryByIdUseCase = { execute: jest.fn() };
    controller = new DeliveriesController(
      getDeliveryByIdUseCase as unknown as GetDeliveryByIdUseCase,
    );
  });

  it('returns the delivery on success', async () => {
    getDeliveryByIdUseCase.execute.mockResolvedValue(Result.ok(mockDelivery));

    const result = await controller.findOne('d1');

    expect(result).toBe(mockDelivery);
  });

  it('throws NotFoundException when the use case fails', async () => {
    getDeliveryByIdUseCase.execute.mockResolvedValue(
      Result.fail(new DeliveryNotFoundError('missing')),
    );

    await expect(controller.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});
