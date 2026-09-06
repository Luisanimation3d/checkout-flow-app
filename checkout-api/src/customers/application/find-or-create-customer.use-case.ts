import { Inject, Injectable, Logger } from '@nestjs/common';
import { Result } from '../../shared/core/result';
import type { Customer, DocumentType } from '../domain/customer';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepositoryPort,
} from '../domain/customer-repository.port';
import type { CustomerInput } from '../domain/customer-validation';
import { validateCustomerInput } from '../domain/customer-validation';
import { InvalidCustomerDataError } from '../domain/invalid-customer-data.error';

@Injectable()
export class FindOrCreateCustomerUseCase {
  private readonly logger = new Logger(FindOrCreateCustomerUseCase.name);

  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
  ) {}

  async execute(
    input: CustomerInput,
  ): Promise<Result<Customer, InvalidCustomerDataError>> {
    const validationError = validateCustomerInput(input);
    if (validationError) {
      return Result.fail(new InvalidCustomerDataError(validationError));
    }

    const existingCustomer = await this.customerRepository.findByDocumentId(
      input.documentId,
    );
    if (existingCustomer) {
      this.logger.log(`Cliente existente encontrado — id=${existingCustomer.id}`);
      return Result.ok(existingCustomer);
    }

    const createdCustomer = await this.customerRepository.create({
      fullName: input.fullName.trim(),
      documentType: input.documentType as DocumentType,
      documentId: input.documentId,
      phone: input.phone,
      email: input.email,
    });
    this.logger.log(`Cliente nuevo creado — id=${createdCustomer.id}`);

    return Result.ok(createdCustomer);
  }
}
