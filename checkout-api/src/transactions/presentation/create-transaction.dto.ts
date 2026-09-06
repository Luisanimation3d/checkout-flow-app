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
  @IsString()
  fullName: string;

  @IsIn(['CC', 'CE', 'TI', 'PA'])
  documentType: string;

  @IsString()
  documentId: string;

  @IsString()
  phone: string;

  @IsString()
  email: string;
}

class DeliveryDto {
  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  department: string;
}

export class CreateTransactionDto {
  @IsUUID()
  productId: string;

  @IsString()
  cardToken: string;

  @IsInt()
  @Min(1)
  @Max(36)
  installments: number;

  @ValidateNested()
  @Type(() => CustomerDto)
  customer: CustomerDto;

  @ValidateNested()
  @Type(() => DeliveryDto)
  delivery: DeliveryDto;
}
