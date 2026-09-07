import type { ConfigService } from '@nestjs/config';
import { PaymentGatewayAdapter } from './payment-gateway.adapter';

const CONFIG_VALUES: Record<string, string> = {
  PAYMENT_GATEWAY_BASE_URL: 'https://api-sandbox.example/v1',
  PAYMENT_GATEWAY_PUBLIC_KEY: 'pub_test',
  PAYMENT_GATEWAY_PRIVATE_KEY: 'prv_test',
  PAYMENT_GATEWAY_INTEGRITY_SECRET: 'secret_test',
};

const jsonResponse = (body: unknown, ok = true, status = ok ? 200 : 422) => ({
  ok,
  status,
  json: () => Promise.resolve(body),
});

describe('PaymentGatewayAdapter', () => {
  let config: { getOrThrow: jest.Mock };
  let adapter: PaymentGatewayAdapter;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    config = { getOrThrow: jest.fn((key: string) => CONFIG_VALUES[key]) };
    adapter = new PaymentGatewayAdapter(config as unknown as ConfigService);
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createCardTransaction', () => {
    const chargeInput = {
      reference: 'ref-1',
      amountInCents: 100000,
      currency: 'COP',
      cardToken: 'tok_1',
      installments: 1,
      customerEmail: 'a@b.com',
    };

    it('fetches acceptance tokens, signs the request and returns the mapped charge on success', async () => {
      fetchMock
        .mockResolvedValueOnce(
          jsonResponse({
            data: {
              presigned_acceptance: { acceptance_token: 'acc-token' },
              presigned_personal_data_auth: { acceptance_token: 'auth-token' },
            },
          }),
        )
        .mockResolvedValueOnce(
          jsonResponse({ data: { id: 'gateway-txn-1', status: 'APPROVED', status_message: null } }),
        );

      const result = await adapter.createCardTransaction(chargeInput);

      expect(result).toEqual({
        gatewayTransactionId: 'gateway-txn-1',
        status: 'APPROVED',
        statusMessage: null,
      });

      // Segunda llamada: POST /transactions con firma calculada y bearer de la llave privada
      const [, secondCallInit] = fetchMock.mock.calls[1] as [string, RequestInit];
      expect(secondCallInit.method).toBe('POST');
      expect((secondCallInit.headers as Record<string, string>).Authorization).toBe(
        'Bearer prv_test',
      );
      const sentBody = JSON.parse(secondCallInit.body as string);
      expect(sentBody.acceptance_token).toBe('acc-token');
      expect(sentBody.accept_personal_auth).toBe('auth-token');
      expect(typeof sentBody.signature).toBe('string');
      expect(sentBody.signature).toHaveLength(64); // sha256 hex digest
    });

    it('maps an unknown/unexpected gateway status to ERROR', async () => {
      fetchMock
        .mockResolvedValueOnce(
          jsonResponse({
            data: {
              presigned_acceptance: { acceptance_token: 'acc-token' },
              presigned_personal_data_auth: { acceptance_token: 'auth-token' },
            },
          }),
        )
        .mockResolvedValueOnce(
          jsonResponse({ data: { id: 'gateway-txn-1', status: 'SOME_NEW_STATUS', status_message: null } }),
        );

      const result = await adapter.createCardTransaction(chargeInput);

      expect(result.status).toBe('ERROR');
    });

    it('returns a graceful ERROR result (not a throw) when the gateway rejects the charge', async () => {
      fetchMock
        .mockResolvedValueOnce(
          jsonResponse({
            data: {
              presigned_acceptance: { acceptance_token: 'acc-token' },
              presigned_personal_data_auth: { acceptance_token: 'auth-token' },
            },
          }),
        )
        .mockResolvedValueOnce(
          jsonResponse({ error: { reason: 'invalid card' } }, false, 422),
        );

      const result = await adapter.createCardTransaction(chargeInput);

      expect(result.status).toBe('ERROR');
      expect(result.gatewayTransactionId).toBe('');
      expect(result.statusMessage).toBe('invalid card');
    });

    it('throws when fetching acceptance tokens fails (caller must handle this)', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({}, false, 500));

      await expect(adapter.createCardTransaction(chargeInput)).rejects.toThrow(
        'Unable to fetch gateway merchant info: 500',
      );
    });
  });

  describe('getTransactionStatus', () => {
    it('returns the mapped status on success', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ data: { id: 'gateway-txn-1', status: 'DECLINED', status_message: 'no funds' } }),
      );

      const result = await adapter.getTransactionStatus('gateway-txn-1');

      expect(result).toEqual({
        gatewayTransactionId: 'gateway-txn-1',
        status: 'DECLINED',
        statusMessage: 'no funds',
      });
    });

    it('returns a graceful ERROR result (not a throw) when the request fails', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({}, false, 500));

      const result = await adapter.getTransactionStatus('gateway-txn-1');

      expect(result.status).toBe('ERROR');
      expect(result.gatewayTransactionId).toBe('gateway-txn-1');
    });
  });

  describe('getTokenizationPublicKey', () => {
    it('returns the public key on success', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ data: { publicKey: 'PEM_KEY' } }));

      const key = await adapter.getTokenizationPublicKey();

      expect(key).toBe('PEM_KEY');
    });

    it('throws when the request fails', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({}, false, 500));

      await expect(adapter.getTokenizationPublicKey()).rejects.toThrow(
        'Unable to fetch gateway tokenization public key',
      );
    });
  });

  describe('tokenizeCard', () => {
    it('returns the token id on success', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ data: { id: 'tok_123' } }));

      const token = await adapter.tokenizeCard('encrypted-payload');

      expect(token).toBe('tok_123');
      const [, callInit] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(JSON.parse(callInit.body as string)).toEqual({ payload: 'encrypted-payload' });
    });

    it('throws with the specific gateway validation message when rejected', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(
          { error: { messages: { number: ['El número de tarjeta no es aceptado'] } } },
          false,
          422,
        ),
      );

      await expect(adapter.tokenizeCard('bad-payload')).rejects.toThrow(
        'El número de tarjeta no es aceptado',
      );
    });

    it('falls back to a generic message when the gateway gives no specific reason', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({}, false, 422));

      await expect(adapter.tokenizeCard('bad-payload')).rejects.toThrow(
        'La tarjeta fue rechazada al tokenizar. Verifica los datos.',
      );
    });
  });
});
