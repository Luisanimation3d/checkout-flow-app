import { BadGatewayException, BadRequestException } from '@nestjs/common';
import type { PaymentGatewayPort } from './domain/payment-gateway.port';
import { TokenizationController } from './tokenization.controller';

describe('TokenizationController', () => {
  let paymentGateway: jest.Mocked<PaymentGatewayPort>;
  let controller: TokenizationController;

  beforeEach(() => {
    paymentGateway = {
      createCardTransaction: jest.fn(),
      getTransactionStatus: jest.fn(),
      getTokenizationPublicKey: jest.fn(),
      tokenizeCard: jest.fn(),
    };
    controller = new TokenizationController(paymentGateway);
  });

  describe('getPublicKey', () => {
    it('returns the public key on success', async () => {
      paymentGateway.getTokenizationPublicKey.mockResolvedValue('PEM_KEY');

      const result = await controller.getPublicKey();

      expect(result).toEqual({ publicKey: 'PEM_KEY' });
    });

    it('throws BadGatewayException when the gateway fails', async () => {
      paymentGateway.getTokenizationPublicKey.mockRejectedValue(new Error('network down'));

      await expect(controller.getPublicKey()).rejects.toThrow(BadGatewayException);
    });
  });

  describe('tokenizeCard', () => {
    it('returns the token on success', async () => {
      paymentGateway.tokenizeCard.mockResolvedValue('tok_123');

      const result = await controller.tokenizeCard({ payload: 'encrypted' });

      expect(result).toEqual({ token: 'tok_123' });
    });

    it('throws BadRequestException with the real gateway rejection reason (not a generic 500)', async () => {
      paymentGateway.tokenizeCard.mockRejectedValue(
        new Error('El número de tarjeta usado no es aceptado en el ambiente de pruebas.'),
      );

      await expect(controller.tokenizeCard({ payload: 'bad' })).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.tokenizeCard({ payload: 'bad' })).rejects.toThrow(
        'El número de tarjeta usado no es aceptado en el ambiente de pruebas.',
      );
    });
  });
});
