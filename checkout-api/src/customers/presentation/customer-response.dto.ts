import { ApiProperty } from '@nestjs/swagger';
import type { DocumentType } from '../domain/customer';

// Espejo del modelo de dominio (Customer) solo para el schema de Swagger.
export class CustomerResponseDto {
  @ApiProperty({ example: '3f6a6e0a-8b3a-4b8b-9f1a-6f2a2b6f4c7a' })
  id: string;

  @ApiProperty({ example: 'Luis Correa' })
  fullName: string;

  @ApiProperty({ example: 'CC', enum: ['CC', 'CE', 'TI', 'PA'] })
  documentType: DocumentType;

  @ApiProperty({ example: '1020304050' })
  documentId: string;

  @ApiProperty({ example: '3001234567' })
  phone: string;

  @ApiProperty({ example: 'luis@example.com' })
  email: string;
}
