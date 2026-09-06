import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../shared/core/result';
import type { Customer } from '../domain/customer';
import { CustomerNotFoundError } from '../domain/customer-not-found.error';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepositoryPort,
} from '../domain/customer-repository.port';

@Injectable()
export class GetCustomerByIdUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<Customer, CustomerNotFoundError>> {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      return Result.fail(new CustomerNotFoundError(id));
    }

    return Result.ok(customer);
  }
}
