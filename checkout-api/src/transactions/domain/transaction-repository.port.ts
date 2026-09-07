import type { Transaction, TransactionStatus } from './transaction';

export const TRANSACTION_REPOSITORY = Symbol('TRANSACTION_REPOSITORY');

export interface TransactionStatusUpdate {
  status: TransactionStatus;
  wompiTransactionId: string | null;
  statusMessage: string | null;
}

export interface TransactionTransitionResult {
  transaction: Transaction;
  // Falso si otra petición concurrente ya sacó la transacción de PENDING primero
  // (ver transitionFromPending): evita decrementar stock dos veces por la misma compra.
  didTransition: boolean;
}

export interface TransactionRepositoryPort {
  create(input: Omit<Transaction, 'id'>): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  // Update condicionado (WHERE status = 'PENDING') para que dos requests concurrentes
  // (p. ej. dos polls simultáneos) no puedan "ganar" ambos la transición de estado.
  transitionFromPending(
    id: string,
    update: TransactionStatusUpdate,
  ): Promise<TransactionTransitionResult>;
}
