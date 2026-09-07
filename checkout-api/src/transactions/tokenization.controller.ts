import {
  BadGatewayException,
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
} from '@nestjs/common';
import { ApiBadGatewayResponse, ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PAYMENT_GATEWAY, type PaymentGatewayPort } from './domain/payment-gateway.port';
import { TokenizeCardDto } from './presentation/tokenize-card.dto';

// El navegador cifra la tarjeta (JWE) y solo pasa por acá el payload ya cifrado:
// el backend nunca ve datos de tarjeta en texto plano. Existe porque el sandbox
// UAT del proveedor de pagos no habilita CORS para llamadas directas desde el navegador.
@ApiTags('tokenization')
@Controller('tokenization')
export class TokenizationController {
  constructor(
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGatewayPort,
  ) {}

  @ApiOperation({ summary: 'Llave pública RSA que el navegador usa para cifrar la tarjeta (JWE)' })
  @ApiOkResponse({ schema: { properties: { publicKey: { type: 'string' } } } })
  @ApiBadGatewayResponse({ description: 'No se pudo obtener la llave pública desde el proveedor de pagos' })
  @Get('public-key')
  async getPublicKey(): Promise<{ publicKey: string }> {
    try {
      const publicKey = await this.paymentGateway.getTokenizationPublicKey();
      return { publicKey };
    } catch (err) {
      // Fallo hablando con el proveedor de pagos, no un dato mal enviado por el cliente: 502.
      throw new BadGatewayException(
        err instanceof Error ? err.message : 'No pudimos preparar el cifrado de la tarjeta.',
      );
    }
  }

  @ApiOperation({ summary: 'Reenvía el payload JWE ya cifrado por el navegador al proveedor de pagos para tokenizar la tarjeta' })
  @ApiOkResponse({ schema: { properties: { token: { type: 'string' } } } })
  @ApiBadRequestResponse({ description: 'El proveedor de pagos rechazó la tarjeta al tokenizar' })
  @Post('card')
  async tokenizeCard(@Body() dto: TokenizeCardDto): Promise<{ token: string }> {
    try {
      const token = await this.paymentGateway.tokenizeCard(dto.payload);
      return { token };
    } catch (err) {
      // Sin este catch, el Error del adapter queda sin manejar y Nest lo
      // convierte en un 500 genérico, perdiendo el motivo real del rechazo
      // del proveedor de pagos (p. ej. "número de tarjeta no aceptado en ambiente de pruebas").
      throw new BadRequestException(
        err instanceof Error ? err.message : 'La tarjeta fue rechazada al tokenizar.',
      );
    }
  }
}
