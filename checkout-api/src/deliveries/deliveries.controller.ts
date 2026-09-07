import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { GetDeliveryByIdUseCase } from './application/get-delivery-by-id.use-case';
import type { Delivery } from './domain/delivery';

@Controller('deliveries')
export class DeliveriesController {
  constructor(
    private readonly getDeliveryByIdUseCase: GetDeliveryByIdUseCase,
  ) {}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Delivery> {
    const result = await this.getDeliveryByIdUseCase.execute(id);

    if (result.isFailure) {
      throw new NotFoundException(result.error.message);
    }

    return result.value;
  }
}
