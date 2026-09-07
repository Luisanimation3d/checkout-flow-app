import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from '../customers/customers.module';
import { DeliveriesModule } from '../deliveries/deliveries.module';
import { ProductsModule } from '../products/products.module';
import { CreateTransactionUseCase } from './application/create-transaction.use-case';
import { GetTransactionByIdUseCase } from './application/get-transaction-by-id.use-case';
import { TRANSACTION_REPOSITORY } from './domain/transaction-repository.port';
import { PAYMENT_GATEWAY } from './domain/payment-gateway.port';
import { TransactionOrmEntity } from './infrastructure/transaction.orm-entity';
import { TransactionTypeOrmRepository } from './infrastructure/transaction-typeorm.repository';
import { PaymentGatewayAdapter } from './infrastructure/payment-gateway.adapter';
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
    { provide: PAYMENT_GATEWAY, useClass: PaymentGatewayAdapter },
  ],
})
export class TransactionsModule {}
