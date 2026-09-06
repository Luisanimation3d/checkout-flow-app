import { BadGatewayException, BadRequestException } from '@nestjs/common';
import type { WompiGatewayPort } from './domain/wompi-gateway.port';
import { TokenizationController } from './tokenization.controller';

describe('TokenizationController', () => {
  let wompiGateway: jest.Mocked<WompiGatewayPort>;
  let controller: TokenizationController;

  beforeEach(() => {
    wompiGateway = {
      createCardTransaction: jest.fn(),
      getTransactionStatus: jest.fn(),
      getTokenizationPublicKey: jest.fn(),
      tokenizeCard: jest.fn(),
    };
    controller = new TokenizationController(wompiGateway);
  });

  describe('getPublicKey', () => {
    it('returns the public key on success', async () => {
      wompiGateway.getTokenizationPublicKey.mockResolvedValue('PEM_KEY');

      const result = await controller.getPublicKey();

      expect(result).toEqual({ publicKey: 'PEM_KEY' });
    });

    it('throws BadGatewayException when the gateway fails', async () => {
      wompiGateway.getTokenizationPublicKey.mockRejectedValue(new Error('network down'));

      await expect(controller.getPublicKey()).rejects.toThrow(BadGatewayException);
    });
  });

  describe('tokenizeCard', () => {
    it('returns the token on success', async () => {
      wompiGateway.tokenizeCard.mockResolvedValue('tok_123');

      const result = await controller.tokenizeCard({ payload: 'encrypted' });

      expect(result).toEqual({ token: 'tok_123' });
    });

    it('throws BadRequestException with the real Wompi rejection reason (not a generic 500)', async () => {
      wompiGateway.tokenizeCard.mockRejectedValue(
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
