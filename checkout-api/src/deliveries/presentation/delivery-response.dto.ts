import { ApiProperty } from '@nestjs/swagger';
import type { DeliveryStatus } from '../domain/delivery';

// Espejo del modelo de dominio (Delivery) solo para el schema de Swagger.
export class DeliveryResponseDto {
  @ApiProperty({ example: '3f6a6e0a-8b3a-4b8b-9f1a-6f2a2b6f4c7a' })
  id: string;

  @ApiProperty({ example: 'Calle 123 # 45-67' })
  address: string;

  @ApiProperty({ example: 'Bogotá' })
  city: string;

  @ApiProperty({ example: 'Cundinamarca' })
  department: string;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'SHIPPED', 'DELIVERED'] })
  status: DeliveryStatus;
}
