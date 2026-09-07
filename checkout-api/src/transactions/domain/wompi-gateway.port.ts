import type { TransactionStatus } from './transaction';

export const WOMPI_GATEWAY = Symbol('WOMPI_GATEWAY');

export interface WompiChargeInput {
  reference: string;
  amountInCents: number;
  currency: string;
  cardToken: string;
  installments: number;
  customerEmail: string;
}

export interface WompiChargeResult {
  wompiTransactionId: string;
  status: TransactionStatus;
  statusMessage: string | null;
}

export interface WompiGatewayPort {
  createCardTransaction(input: WompiChargeInput): Promise<WompiChargeResult>;
  getTransactionStatus(wompiTransactionId: string): Promise<WompiChargeResult>;
  getTokenizationPublicKey(): Promise<string>;
  tokenizeCard(encryptedPayload: string): Promise<string>;
}
