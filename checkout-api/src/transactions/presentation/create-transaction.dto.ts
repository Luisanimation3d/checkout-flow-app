import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class CustomerDto {
  @ApiProperty({ example: 'Luis Correa' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'CC', enum: ['CC', 'CE', 'TI', 'PA'] })
  @IsIn(['CC', 'CE', 'TI', 'PA'])
  documentType: string;

  @ApiProperty({ example: '1020304050' })
  @IsString()
  documentId: string;

  @ApiProperty({ example: '3001234567' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'luis@example.com' })
  @IsString()
  email: string;
}

class DeliveryDto {
  @ApiProperty({ example: 'Calle 123 # 45-67' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'Bogotá' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Cundinamarca' })
  @IsString()
  department: string;
}

export class CreateTransactionDto {
  @ApiProperty({ example: '3f6a6e0a-8b3a-4b8b-9f1a-6f2a2b6f4c7a' })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Token de tarjeta obtenido de POST /tokenization/card',
    example: 'tok_test_1234_abcdef',
  })
  @IsString()
  cardToken: string;

  @ApiProperty({ example: 1, minimum: 1, maximum: 36 })
  @IsInt()
  @Min(1)
  @Max(36)
  installments: number;

  @ApiProperty({ type: CustomerDto })
  @ValidateNested()
  @Type(() => CustomerDto)
  customer: CustomerDto;

  @ApiProperty({ type: DeliveryDto })
  @ValidateNested()
  @Type(() => DeliveryDto)
  delivery: DeliveryDto;
}
