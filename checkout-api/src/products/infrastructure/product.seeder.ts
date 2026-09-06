import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PRODUCT_SEED_DATA } from './product-seed-data';
import { ProductOrmEntity } from './product.orm-entity';

@Injectable()
export class ProductSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(ProductSeeder.name);

  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly repository: Repository<ProductOrmEntity>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const existingCount = await this.repository.count();
    if (existingCount > 0) return;

    await this.repository.save(PRODUCT_SEED_DATA);
    this.logger.log(`Seeded ${PRODUCT_SEED_DATA.length} products`);
  }
}
