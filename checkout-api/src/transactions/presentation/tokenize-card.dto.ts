import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TokenizeCardDto {
  @ApiProperty({
    description:
      'Payload JWE (RSA-OAEP-256 + A256GCM) generado en el navegador con la llave pública de GET /tokenization/public-key. ' +
      'El backend nunca ve datos de tarjeta en texto plano; solo reenvía este payload ya cifrado a Wompi.',
    example: 'eyJhbGciOiJSU0EtT0FFUC0yNTYiLCJlbmMiOiJBMjU2R0NNIn0...',
  })
  @IsString()
  payload: string;
}
