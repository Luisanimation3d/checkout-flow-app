import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from '../customers/customers.module';
import { DeliveriesModule } from '../deliveries/deliveries.module';
import { ProductsModule } from '../products/products.module';
import { CreateTransactionUseCase } from './application/create-transaction.use-case';
import { GetTransactionByIdUseCase } from './application/get-transaction-by-id.use-case';
import { TRANSACTION_REPOSITORY } from './domain/transaction-repository.port';
import { WOMPI_GATEWAY } from './domain/wompi-gateway.port';
import { TransactionOrmEntity } from './infrastructure/transaction.orm-entity';
import { TransactionTypeOrmRepository } from './infrastructure/transaction-typeorm.repository';
import { WompiGatewayAdapter } from './infrastructure/wompi-gateway.adapter';
import { TokenizationController } from './tokenization.controller';
import { TransactionsController } from './transactions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionOrmEntity]),
    ProductsModule,
    CustomersModule,
    DeliveriesModule,
  ],
  controllers: [TransactionsController, TokenizationController],
  providers: [
    CreateTransactionUseCase,
    GetTransactionByIdUseCase,
    { provide: TRANSACTION_REPOSITORY, useClass: TransactionTypeOrmRepository },
    { provide: WOMPI_GATEWAY, useClass: WompiGatewayAdapter },
  ],
})
export class TransactionsModule {}
