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
import { WOMPI_GATEWAY, type WompiGatewayPort } from './domain/wompi-gateway.port';
import { TokenizeCardDto } from './presentation/tokenize-card.dto';

// El navegador cifra la tarjeta (JWE) y solo pasa por acá el payload ya cifrado:
// el backend nunca ve datos de tarjeta en texto plano. Existe porque el sandbox
// UAT de Wompi no habilita CORS para llamadas directas desde el navegador.
@ApiTags('tokenization')
@Controller('tokenization')
export class TokenizationController {
  constructor(
    @Inject(WOMPI_GATEWAY)
    private readonly wompiGateway: WompiGatewayPort,
  ) {}

  @ApiOperation({ summary: 'Llave pública RSA que el navegador usa para cifrar la tarjeta (JWE)' })
  @ApiOkResponse({ schema: { properties: { publicKey: { type: 'string' } } } })
  @ApiBadGatewayResponse({ description: 'No se pudo obtener la llave pública desde Wompi' })
  @Get('public-key')
  async getPublicKey(): Promise<{ publicKey: string }> {
    try {
      const publicKey = await this.wompiGateway.getTokenizationPublicKey();
      return { publicKey };
    } catch (err) {
      // Fallo hablando con Wompi, no un dato mal enviado por el cliente: 502.
      throw new BadGatewayException(
        err instanceof Error ? err.message : 'No pudimos preparar el cifrado de la tarjeta.',
      );
    }
  }

  @ApiOperation({ summary: 'Reenvía el payload JWE ya cifrado por el navegador a Wompi para tokenizar la tarjeta' })
  @ApiOkResponse({ schema: { properties: { token: { type: 'string' } } } })
  @ApiBadRequestResponse({ description: 'Wompi rechazó la tarjeta al tokenizar' })
  @Post('card')
  async tokenizeCard(@Body() dto: TokenizeCardDto): Promise<{ token: string }> {
    try {
      const token = await this.wompiGateway.tokenizeCard(dto.payload);
      return { token };
    } catch (err) {
      // Sin este catch, el Error del adapter queda sin manejar y Nest lo
      // convierte en un 500 genérico, perdiendo el motivo real del rechazo
      // de Wompi (p. ej. "número de tarjeta no aceptado en ambiente de pruebas").
      throw new BadRequestException(
        err instanceof Error ? err.message : 'La tarjeta fue rechazada al tokenizar.',
      );
    }
  }
}
