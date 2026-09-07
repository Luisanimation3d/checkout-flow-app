import { createHash } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TransactionStatus } from '../domain/transaction';
import type {
  GatewayChargeInput,
  GatewayChargeResult,
  PaymentGatewayPort,
} from '../domain/payment-gateway.port';

interface GatewayMerchantInfoResponse {
  data: {
    presigned_acceptance: { acceptance_token: string };
    presigned_personal_data_auth: { acceptance_token: string };
  };
}

interface GatewayApiTransactionResponse {
  data: {
    id: string;
    status: string;
    status_message: string | null;
  };
  error?: {
    messages?: Record<string, string[]>;
    reason?: string;
  };
}

interface GatewayTokenizationKeyResponse {
  data: { publicKey: string };
}

interface GatewayCardTokenResponse {
  data: { id: string };
  error?: {
    messages?: Record<string, string[]>;
    reason?: string;
  };
}

const VALID_STATUSES: readonly TransactionStatus[] = [
  'PENDING',
  'APPROVED',
  'DECLINED',
  'ERROR',
];

const mapStatus = (status: string): TransactionStatus =>
  (VALID_STATUSES as readonly string[]).includes(status)
    ? (status as TransactionStatus)
    : 'ERROR';

@Injectable()
export class PaymentGatewayAdapter implements PaymentGatewayPort {
  private readonly logger = new Logger(PaymentGatewayAdapter.name);

  constructor(private readonly config: ConfigService) {}

  private baseUrl(): string {
    return this.config.getOrThrow<string>('PAYMENT_GATEWAY_BASE_URL');
  }

  private buildSignature(
    reference: string,
    amountInCents: number,
    currency: string,
  ): string {
    const secret = this.config.getOrThrow<string>('PAYMENT_GATEWAY_INTEGRITY_SECRET');
    return createHash('sha256')
      .update(`${reference}${amountInCents}${currency}${secret}`)
      .digest('hex');
  }

  private async getAcceptanceTokens(): Promise<{
    acceptanceToken: string;
    personalAuthToken: string;
  }> {
    this.logger.debug('GET /merchants/info — solicitando tokens de aceptación');
    const publicKey = this.config.getOrThrow<string>('PAYMENT_GATEWAY_PUBLIC_KEY');
    const response = await fetch(`${this.baseUrl()}/merchants/info`, {
      headers: { 'x-merchant-public-key': publicKey },
    });

    if (!response.ok) {
      this.logger.error(`GET /merchants/info falló con status ${response.status}`);
      throw new Error(`Unable to fetch gateway merchant info: ${response.status}`);
    }

    const body = (await response.json()) as GatewayMerchantInfoResponse;
    this.logger.debug('Tokens de aceptación obtenidos correctamente');
    return {
      acceptanceToken: body.data.presigned_acceptance.acceptance_token,
      personalAuthToken: body.data.presigned_personal_data_auth.acceptance_token,
    };
  }

  async createCardTransaction(
    input: GatewayChargeInput,
  ): Promise<GatewayChargeResult> {
    const { acceptanceToken, personalAuthToken } =
      await this.getAcceptanceTokens();
    const signature = this.buildSignature(
      input.reference,
      input.amountInCents,
      input.currency,
    );
    const privateKey = this.config.getOrThrow<string>('PAYMENT_GATEWAY_PRIVATE_KEY');

    this.logger.log(
      `POST /transactions — referencia=${input.reference} monto=${input.amountInCents} ${input.currency} cuotas=${input.installments}`,
    );

    const response = await fetch(`${this.baseUrl()}/transactions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${privateKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        acceptance_token: acceptanceToken,
        accept_personal_auth: personalAuthToken,
        amount_in_cents: input.amountInCents,
        currency: input.currency,
        reference: input.reference,
        customer_email: input.customerEmail,
        signature,
        payment_method_type: 'CARD',
        payment_method: {
          type: 'CARD',
          installments: input.installments,
          token: input.cardToken,
        },
      }),
    });

    const body = (await response.json()) as GatewayApiTransactionResponse;

    if (!response.ok) {
      this.logger.warn(
        `POST /transactions rechazado por el proveedor de pagos (status ${response.status}): ${JSON.stringify(body.error)}`,
      );
      return {
        gatewayTransactionId: '',
        status: 'ERROR',
        statusMessage:
          JSON.stringify(body.error?.messages) ??
          body.error?.reason ??
          'Unknown gateway error',
      };
    }

    this.logger.log(
      `El proveedor de pagos creó la transacción "${body.data.id}" — status=${body.data.status}`,
    );

    return {
      gatewayTransactionId: body.data.id,
      status: mapStatus(body.data.status),
      statusMessage: body.data.status_message,
    };
  }

  async getTransactionStatus(
    gatewayTransactionId: string,
  ): Promise<GatewayChargeResult> {
    this.logger.debug(`GET /transactions/${gatewayTransactionId}`);
    const publicKey = this.config.getOrThrow<string>('PAYMENT_GATEWAY_PUBLIC_KEY');
    const response = await fetch(
      `${this.baseUrl()}/transactions/${gatewayTransactionId}`,
      { headers: { Authorization: `Bearer ${publicKey}` } },
    );

    const body = (await response.json()) as GatewayApiTransactionResponse;

    if (!response.ok) {
      this.logger.error(
        `GET /transactions/${gatewayTransactionId} falló con status ${response.status}`,
      );
      return {
        gatewayTransactionId,
        status: 'ERROR',
        statusMessage: 'Unable to fetch gateway transaction status',
      };
    }

    this.logger.debug(
      `Transacción "${gatewayTransactionId}" actualizada — status=${body.data.status}`,
    );

    return {
      gatewayTransactionId,
      status: mapStatus(body.data.status),
      statusMessage: body.data.status_message,
    };
  }

  // El sandbox UAT del proveedor de pagos no habilita CORS: el navegador no puede llamar estos
  // endpoints directo, así que el backend actúa como proxy. La tarjeta sigue sin
  // llegar en texto plano acá: el navegador la cifra (JWE) antes de enviarla, y
  // este método solo reenvía el payload cifrado, que el backend no puede leer.
  async getTokenizationPublicKey(): Promise<string> {
    this.logger.debug('GET /tokens/keys/tokenization — solicitando llave pública');
    const publicKey = this.config.getOrThrow<string>('PAYMENT_GATEWAY_PUBLIC_KEY');
    const response = await fetch(`${this.baseUrl()}/tokens/keys/tokenization`, {
      headers: { Authorization: `Bearer ${publicKey}` },
    });

    if (!response.ok) {
      this.logger.error(
        `GET /tokens/keys/tokenization falló con status ${response.status}`,
      );
      throw new Error('Unable to fetch gateway tokenization public key');
    }

    const body = (await response.json()) as GatewayTokenizationKeyResponse;
    this.logger.debug('Llave pública de tokenización obtenida');
    return body.data.publicKey;
  }

  async tokenizeCard(encryptedPayload: string): Promise<string> {
    this.logger.log('POST /tokens/cards — reenviando payload cifrado (JWE)');
    const publicKey = this.config.getOrThrow<string>('PAYMENT_GATEWAY_PUBLIC_KEY');
    const response = await fetch(`${this.baseUrl()}/tokens/cards`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${publicKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ payload: encryptedPayload }),
    });

    const body = (await response.json()) as GatewayCardTokenResponse;

    if (!response.ok) {
      this.logger.warn(
        `POST /tokens/cards rechazado por el proveedor de pagos (status ${response.status}): ${JSON.stringify(body.error)}`,
      );
      const firstMessage = body.error?.messages
        ? Object.values(body.error.messages)[0]?.[0]
        : undefined;
      throw new Error(
        firstMessage ??
          body.error?.reason ??
          'La tarjeta fue rechazada al tokenizar. Verifica los datos.',
      );
    }

    this.logger.log(`Tarjeta tokenizada — token=${body.data.id}`);
    return body.data.id;
  }
}
