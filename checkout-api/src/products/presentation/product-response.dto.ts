import { ApiProperty } from '@nestjs/swagger';

// Espejo del modelo de dominio (Product) solo para generar el schema de Swagger;
// el controller sigue devolviendo la interfaz de dominio, esta clase nunca se instancia.
export class ProductResponseDto {
  @ApiProperty({ example: '3f6a6e0a-8b3a-4b8b-9f1a-6f2a2b6f4c7a' })
  id: string;

  @ApiProperty({ example: 'Audífonos inalámbricos' })
  title: string;

  @ApiProperty({ example: 'Audífonos con cancelación de ruido y 30h de batería.' })
  description: string;

  @ApiProperty({ example: 250000 })
  price: number;

  @ApiProperty({ example: 'COP' })
  currency: string;

  @ApiProperty({ example: 10 })
  stock: number;

  @ApiProperty({ example: ['https://example.com/product.jpg'], type: [String] })
  images: string[];

  @ApiProperty({ example: 8000 })
  deliveryFee: number;
}
