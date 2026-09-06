import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { GetCustomerByIdUseCase } from './application/get-customer-by-id.use-case';
import type { Customer } from './domain/customer';

@Controller('customers')
export class CustomersController {
  constructor(
    private readonly getCustomerByIdUseCase: GetCustomerByIdUseCase,
  ) {}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Customer> {
    const result = await this.getCustomerByIdUseCase.execute(id);

    if (result.isFailure) {
      throw new NotFoundException(result.error.message);
    }

    return result.value;
  }
}
