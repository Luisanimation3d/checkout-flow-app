import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../shared/core/result';
import type { Delivery } from '../domain/delivery';
import {
  DELIVERY_REPOSITORY,
  type DeliveryRepositoryPort,
} from '../domain/delivery-repository.port';
import type { DeliveryInput } from '../domain/delivery-validation';
import { validateDeliveryInput } from '../domain/delivery-validation';
import { InvalidDeliveryDataError } from '../domain/invalid-delivery-data.error';

@Injectable()
export class CreateDeliveryUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepositoryPort,
  ) {}

  async execute(
    input: DeliveryInput,
  ): Promise<Result<Delivery, InvalidDeliveryDataError>> {
    const validationError = validateDeliveryInput(input);
    if (validationError) {
      return Result.fail(new InvalidDeliveryDataError(validationError));
    }

    const delivery = await this.deliveryRepository.create({
      address: input.address.trim(),
      city: input.city,
      department: input.department,
      status: 'PENDING',
    });

    return Result.ok(delivery);
  }
}
