import { createHash } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TransactionStatus } from '../domain/transaction';
import type {
  WompiChargeInput,
  WompiChargeResult,
  WompiGatewayPort,
} from '../domain/wompi-gateway.port';

interface WompiMerchantInfoResponse {
  data: {
    presigned_acceptance: { acceptance_token: string };
    presigned_personal_data_auth: { acceptance_token: string };
  };
}

interface WompiTransactionResponse {
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

interface WompiTokenizationKeyResponse {
  data: { publicKey: string };
}

interface WompiCardTokenResponse {
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
export class WompiGatewayAdapter implements WompiGatewayPort {
  private readonly logger = new Logger(WompiGatewayAdapter.name);

  constructor(private readonly config: ConfigService) {}

  private baseUrl(): string {
    return this.config.getOrThrow<string>('WOMPI_BASE_URL');
  }

  private buildSignature(
    reference: string,
    amountInCents: number,
    currency: string,
  ): string {
    const secret = this.config.getOrThrow<string>('WOMPI_INTEGRITY_SECRET');
    return createHash('sha256')
      .update(`${reference}${amountInCents}${currency}${secret}`)
      .digest('hex');
  }

  private async getAcceptanceTokens(): Promise<{
    acceptanceToken: string;
    personalAuthToken: string;
  }> {
    this.logger.debug('GET /merchants/info — solicitando tokens de aceptación');
    const publicKey = this.config.getOrThrow<string>('WOMPI_PUBLIC_KEY');
    const response = await fetch(`${this.baseUrl()}/merchants/info`, {
      headers: { 'x-merchant-public-key': publicKey },
    });

    if (!response.ok) {
      this.logger.error(`GET /merchants/info falló con status ${response.status}`);
      throw new Error(`Unable to fetch Wompi merchant info: ${response.status}`);
    }

    const body = (await response.json()) as WompiMerchantInfoResponse;
    this.logger.debug('Tokens de aceptación obtenidos correctamente');
    return {
      acceptanceToken: body.data.presigned_acceptance.acceptance_token,
      personalAuthToken: body.data.presigned_personal_data_auth.acceptance_token,
    };
  }

  async createCardTransaction(
    input: WompiChargeInput,
  ): Promise<WompiChargeResult> {
    const { acceptanceToken, personalAuthToken } =
      await this.getAcceptanceTokens();
    const signature = this.buildSignature(
      input.reference,
      input.amountInCents,
      input.currency,
    );
    const privateKey = this.config.getOrThrow<string>('WOMPI_PRIVATE_KEY');

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

    const body = (await response.json()) as WompiTransactionResponse;

    if (!response.ok) {
      this.logger.warn(
        `POST /transactions rechazado por Wompi (status ${response.status}): ${JSON.stringify(body.error)}`,
      );
      return {
        wompiTransactionId: '',
        status: 'ERROR',
        statusMessage:
          JSON.stringify(body.error?.messages) ??
          body.error?.reason ??
          'Unknown Wompi error',
      };
    }

    this.logger.log(
      `Wompi creó la transacción "${body.data.id}" — status=${body.data.status}`,
    );

    return {
      wompiTransactionId: body.data.id,
      status: mapStatus(body.data.status),
      statusMessage: body.data.status_message,
    };
  }

  async getTransactionStatus(
    wompiTransactionId: string,
  ): Promise<WompiChargeResult> {
    this.logger.debug(`GET /transactions/${wompiTransactionId}`);
    const publicKey = this.config.getOrThrow<string>('WOMPI_PUBLIC_KEY');
    const response = await fetch(
      `${this.baseUrl()}/transactions/${wompiTransactionId}`,
      { headers: { Authorization: `Bearer ${publicKey}` } },
    );

    const body = (await response.json()) as WompiTransactionResponse;

    if (!response.ok) {
      this.logger.error(
        `GET /transactions/${wompiTransactionId} falló con status ${response.status}`,
      );
      return {
        wompiTransactionId,
        status: 'ERROR',
        statusMessage: 'Unable to fetch Wompi transaction status',
      };
    }

    this.logger.debug(
      `Wompi transacción "${wompiTransactionId}" — status=${body.data.status}`,
    );

    return {
      wompiTransactionId,
      status: mapStatus(body.data.status),
      statusMessage: body.data.status_message,
    };
  }

  // El sandbox UAT de Wompi no habilita CORS: el navegador no puede llamar estos
  // endpoints directo, así que el backend actúa como proxy. La tarjeta sigue sin
  // llegar en texto plano acá: el navegador la cifra (JWE) antes de enviarla, y
  // este método solo reenvía el payload cifrado, que el backend no puede leer.
  async getTokenizationPublicKey(): Promise<string> {
    this.logger.debug('GET /tokens/keys/tokenization — solicitando llave pública');
    const publicKey = this.config.getOrThrow<string>('WOMPI_PUBLIC_KEY');
    const response = await fetch(`${this.baseUrl()}/tokens/keys/tokenization`, {
      headers: { Authorization: `Bearer ${publicKey}` },
    });

    if (!response.ok) {
      this.logger.error(
        `GET /tokens/keys/tokenization falló con status ${response.status}`,
      );
      throw new Error('Unable to fetch Wompi tokenization public key');
    }

    const body = (await response.json()) as WompiTokenizationKeyResponse;
    this.logger.debug('Llave pública de tokenización obtenida');
    return body.data.publicKey;
  }

  async tokenizeCard(encryptedPayload: string): Promise<string> {
    this.logger.log('POST /tokens/cards — reenviando payload cifrado (JWE)');
    const publicKey = this.config.getOrThrow<string>('WOMPI_PUBLIC_KEY');
    const response = await fetch(`${this.baseUrl()}/tokens/cards`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${publicKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ payload: encryptedPayload }),
    });

    const body = (await response.json()) as WompiCardTokenResponse;

    if (!response.ok) {
      this.logger.warn(
        `POST /tokens/cards rechazado por Wompi (status ${response.status}): ${JSON.stringify(body.error)}`,
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
