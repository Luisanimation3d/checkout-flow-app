import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Product } from '../domain/product';
import type { ProductRepositoryPort } from '../domain/product-repository.port';
import { ProductOrmEntity } from './product.orm-entity';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const toDomain = (row: ProductOrmEntity): Product => ({
  id: row.id,
  title: row.title,
  description: row.description,
  price: row.price,
  currency: row.currency,
  stock: row.stock,
  images: row.images,
  deliveryFee: row.deliveryFee,
});

@Injectable()
export class ProductTypeOrmRepository implements ProductRepositoryPort {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly repository: Repository<ProductOrmEntity>,
  ) {}

  async findAll(): Promise<Product[]> {
    const rows = await this.repository.find();
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<Product | null> {
    if (!UUID_PATTERN.test(id)) return null;

    const row = await this.repository.findOne({ where: { id } });
    return row ? toDomain(row) : null;
  }
}
