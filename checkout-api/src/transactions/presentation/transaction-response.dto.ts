import { ApiProperty } from '@nestjs/swagger';
import type { TransactionStatus } from '../domain/transaction';

// Espejo del modelo de dominio (Transaction) solo para el schema de Swagger.
export class TransactionResponseDto {
  @ApiProperty({ example: '3f6a6e0a-8b3a-4b8b-9f1a-6f2a2b6f4c7a' })
  id: string;

  @ApiProperty({ example: 'CHK-1699999999999-abc123' })
  reference: string;

  @ApiProperty({ example: '3f6a6e0a-8b3a-4b8b-9f1a-6f2a2b6f4c7a' })
  productId: string;

  @ApiProperty({ example: '3f6a6e0a-8b3a-4b8b-9f1a-6f2a2b6f4c7a' })
  customerId: string;

  @ApiProperty({ example: '3f6a6e0a-8b3a-4b8b-9f1a-6f2a2b6f4c7a' })
  deliveryId: string;

  @ApiProperty({ example: 25800000 })
  amountInCents: number;

  @ApiProperty({ example: 'COP' })
  currency: string;

  @ApiProperty({
    example: 'PENDING',
    enum: ['PENDING', 'APPROVED', 'DECLINED', 'ERROR'],
  })
  status: TransactionStatus;

  @ApiProperty({ example: '15625-1699999999-12345', nullable: true })
  gatewayTransactionId: string | null;

  @ApiProperty({ example: null, nullable: true })
  statusMessage: string | null;
}
