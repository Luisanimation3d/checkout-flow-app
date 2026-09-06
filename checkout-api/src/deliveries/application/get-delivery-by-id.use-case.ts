import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../shared/core/result';
import type { Delivery } from '../domain/delivery';
import { DeliveryNotFoundError } from '../domain/delivery-not-found.error';
import {
  DELIVERY_REPOSITORY,
  type DeliveryRepositoryPort,
} from '../domain/delivery-repository.port';

@Injectable()
export class GetDeliveryByIdUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<Delivery, DeliveryNotFoundError>> {
    const delivery = await this.deliveryRepository.findById(id);

    if (!delivery) {
      return Result.fail(new DeliveryNotFoundError(id));
    }

    return Result.ok(delivery);
  }
}
