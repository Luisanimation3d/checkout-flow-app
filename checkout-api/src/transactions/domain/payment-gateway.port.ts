import type { TransactionStatus } from './transaction';

export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

export interface GatewayChargeInput {
  reference: string;
  amountInCents: number;
  currency: string;
  cardToken: string;
  installments: number;
  customerEmail: string;
}

export interface GatewayChargeResult {
  gatewayTransactionId: string;
  status: TransactionStatus;
  statusMessage: string | null;
}

export interface PaymentGatewayPort {
  createCardTransaction(input: GatewayChargeInput): Promise<GatewayChargeResult>;
  getTransactionStatus(gatewayTransactionId: string): Promise<GatewayChargeResult>;
  getTokenizationPublicKey(): Promise<string>;
  tokenizeCard(encryptedPayload: string): Promise<string>;
}
