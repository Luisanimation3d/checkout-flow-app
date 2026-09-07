import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  PRODUCT_REPOSITORY,
  type ProductRepositoryPort,
} from '../../products/domain/product-repository.port';
import { Result } from '../../shared/core/result';
import type { Transaction } from '../domain/transaction';
import { TransactionNotFoundError } from '../domain/transaction-not-found.error';
import {
  TRANSACTION_REPOSITORY,
  type TransactionRepositoryPort,
} from '../domain/transaction-repository.port';
import {
  PAYMENT_GATEWAY,
  type PaymentGatewayPort,
} from '../domain/payment-gateway.port';

@Injectable()
export class GetTransactionByIdUseCase {
  private readonly logger = new Logger(GetTransactionByIdUseCase.name);

  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGatewayPort,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  async execute(
    id: string,
  ): Promise<Result<Transaction, TransactionNotFoundError>> {
    this.logger.debug(`Consultando transacción "${id}"`);

    let transaction = await this.transactionRepository.findById(id);
    if (!transaction) {
      this.logger.warn(`Transacción "${id}" no encontrada`);
      return Result.fail(new TransactionNotFoundError(id));
    }

    // El proveedor de pagos resuelve el pago de forma asíncrona: mientras siga PENDING localmente,
    // re-consultamos su estado real en cada GET (polling bajo demanda).
    if (transaction.status === 'PENDING' && transaction.gatewayTransactionId) {
      this.logger.debug(
        `Transacción "${id}" sigue PENDING — consultando estado real en el proveedor de pagos (${transaction.gatewayTransactionId})`,
      );
      const charge = await this.paymentGateway.getTransactionStatus(
        transaction.gatewayTransactionId,
      );

      if (charge.status !== transaction.status) {
        const { transaction: updatedTransaction, didTransition } =
          await this.transactionRepository.transitionFromPending(
            transaction.id,
            {
              status: charge.status,
              gatewayTransactionId: transaction.gatewayTransactionId,
              statusMessage: charge.statusMessage,
            },
          );
        transaction = updatedTransaction;

        if (didTransition) {
          this.logger.log(
            `Transacción "${id}" cambió de estado: PENDING -> ${charge.status}`,
          );

          if (charge.status === 'APPROVED') {
            await this.productRepository.decreaseStock(transaction.productId);
            this.logger.log(`Stock de "${transaction.productId}" decrementado (pago aprobado)`);
          }
        } else {
          this.logger.debug(
            `Transacción "${id}" ya había sido actualizada por otra petición concurrente`,
          );
        }
      } else {
        this.logger.debug(`Transacción "${id}" sin cambios (sigue PENDING en el proveedor de pagos)`);
      }
    }

    return Result.ok(transaction);
  }
}
