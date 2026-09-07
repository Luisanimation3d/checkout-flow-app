import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { GetDeliveryByIdUseCase } from './application/get-delivery-by-id.use-case';
import type { Delivery } from './domain/delivery';
import { DeliveryResponseDto } from './presentation/delivery-response.dto';

@ApiTags('deliveries')
@Controller('deliveries')
export class DeliveriesController {
  constructor(
    private readonly getDeliveryByIdUseCase: GetDeliveryByIdUseCase,
  ) {}

  @ApiOperation({ summary: 'Obtiene una entrega por id (creada al confirmar una transacción)' })
  @ApiParam({ name: 'id', example: '3f6a6e0a-8b3a-4b8b-9f1a-6f2a2b6f4c7a' })
  @ApiOkResponse({ type: DeliveryResponseDto })
  @ApiNotFoundResponse({ description: 'La entrega no existe' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Delivery> {
    const result = await this.getDeliveryByIdUseCase.execute(id);

    if (result.isFailure) {
      throw new NotFoundException(result.error.message);
    }

    return result.value;
  }
}
