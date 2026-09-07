import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { GetCustomerByIdUseCase } from './application/get-customer-by-id.use-case';
import type { Customer } from './domain/customer';
import { CustomerResponseDto } from './presentation/customer-response.dto';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly getCustomerByIdUseCase: GetCustomerByIdUseCase,
  ) {}

  @ApiOperation({ summary: 'Obtiene un cliente por id (creado al confirmar una transacción)' })
  @ApiParam({ name: 'id', example: '3f6a6e0a-8b3a-4b8b-9f1a-6f2a2b6f4c7a' })
  @ApiOkResponse({ type: CustomerResponseDto })
  @ApiNotFoundResponse({ description: 'El cliente no existe' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Customer> {
    const result = await this.getCustomerByIdUseCase.execute(id);

    if (result.isFailure) {
      throw new NotFoundException(result.error.message);
    }

    return result.value;
  }
}
