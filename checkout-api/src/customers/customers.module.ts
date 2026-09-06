import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FindOrCreateCustomerUseCase } from './application/find-or-create-customer.use-case';
import { GetCustomerByIdUseCase } from './application/get-customer-by-id.use-case';
import { CustomersController } from './customers.controller';
import { CUSTOMER_REPOSITORY } from './domain/customer-repository.port';
import { CustomerTypeOrmRepository } from './infrastructure/customer-typeorm.repository';
import { CustomerOrmEntity } from './infrastructure/customer.orm-entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerOrmEntity])],
  controllers: [CustomersController],
  providers: [
    GetCustomerByIdUseCase,
    FindOrCreateCustomerUseCase,
    { provide: CUSTOMER_REPOSITORY, useClass: CustomerTypeOrmRepository },
  ],
  exports: [FindOrCreateCustomerUseCase],
})
export class CustomersModule {}
