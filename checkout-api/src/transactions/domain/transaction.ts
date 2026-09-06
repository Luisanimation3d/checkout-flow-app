export type TransactionStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

export interface Transaction {
  id: string;
  reference: string;
  productId: string;
  customerId: string;
  deliveryId: string;
  amountInCents: number;
  currency: string;
  status: TransactionStatus;
  wompiTransactionId: string | null;
  statusMessage: string | null;
}
