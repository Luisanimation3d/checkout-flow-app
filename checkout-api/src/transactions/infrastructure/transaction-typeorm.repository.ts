import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUuid } from '../../shared/core/is-uuid';
import type { Transaction, TransactionStatus } from '../domain/transaction';
import type {
  TransactionRepositoryPort,
  TransactionStatusUpdate,
  TransactionTransitionResult,
} from '../domain/transaction-repository.port';
import { TransactionOrmEntity } from './transaction.orm-entity';

const toDomain = (row: TransactionOrmEntity): Transaction => ({
  id: row.id,
  reference: row.reference,
  productId: row.productId,
  customerId: row.customerId,
  deliveryId: row.deliveryId,
  amountInCents: row.amountInCents,
  currency: row.currency,
  status: row.status as TransactionStatus,
  gatewayTransactionId: row.gatewayTransactionId,
  statusMessage: row.statusMessage,
});

@Injectable()
export class TransactionTypeOrmRepository implements TransactionRepositoryPort {
  constructor(
    @InjectRepository(TransactionOrmEntity)
    private readonly repository: Repository<TransactionOrmEntity>,
  ) {}

  async create(input: Omit<Transaction, 'id'>): Promise<Transaction> {
    const row = await this.repository.save(input);
    return toDomain(row);
  }

  async findById(id: string): Promise<Transaction | null> {
    if (!isUuid(id)) return null;

    const row = await this.repository.findOne({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async transitionFromPending(
    id: string,
    update: TransactionStatusUpdate,
  ): Promise<TransactionTransitionResult> {
    // Solo aplica si el status en BD sigue siendo PENDING: si dos requests
    // concurrentes llegan hasta acá, únicamente el primero en ejecutar este
    // UPDATE afecta una fila (Postgres serializa el lock de la fila); el
    // segundo llega tarde, ya no encuentra PENDING y no afecta nada.
    const result = await this.repository.update(
      { id, status: 'PENDING' as TransactionStatus },
      update,
    );
    const row = await this.repository.findOneOrFail({ where: { id } });
    return {
      transaction: toDomain(row),
      didTransition: (result.affected ?? 0) > 0,
    };
  }
}
