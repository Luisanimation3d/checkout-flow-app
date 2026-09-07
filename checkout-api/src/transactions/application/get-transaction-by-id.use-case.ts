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
  WOMPI_GATEWAY,
  type WompiGatewayPort,
} from '../domain/wompi-gateway.port';

@Injectable()
export class GetTransactionByIdUseCase {
  private readonly logger = new Logger(GetTransactionByIdUseCase.name);

  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(WOMPI_GATEWAY)
    private readonly wompiGateway: WompiGatewayPort,
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

    // Wompi resuelve el pago de forma asíncrona: mientras siga PENDING localmente,
    // re-consultamos su estado real en cada GET (polling bajo demanda).
    if (transaction.status === 'PENDING' && transaction.wompiTransactionId) {
      this.logger.debug(
        `Transacción "${id}" sigue PENDING — consultando estado real en Wompi (${transaction.wompiTransactionId})`,
      );
      const charge = await this.wompiGateway.getTransactionStatus(
        transaction.wompiTransactionId,
      );

      if (charge.status !== transaction.status) {
        const { transaction: updatedTransaction, didTransition } =
          await this.transactionRepository.transitionFromPending(
            transaction.id,
            {
              status: charge.status,
              wompiTransactionId: transaction.wompiTransactionId,
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
        this.logger.debug(`Transacción "${id}" sin cambios (sigue PENDING en Wompi)`);
      }
    }

    return Result.ok(transaction);
  }
}
