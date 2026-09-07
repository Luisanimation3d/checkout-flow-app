import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUuid } from '../../shared/core/is-uuid';
import type { Delivery, DeliveryStatus } from '../domain/delivery';
import type { DeliveryRepositoryPort } from '../domain/delivery-repository.port';
import { DeliveryOrmEntity } from './delivery.orm-entity';

const toDomain = (row: DeliveryOrmEntity): Delivery => ({
  id: row.id,
  address: row.address,
  city: row.city,
  department: row.department,
  status: row.status as DeliveryStatus,
});

@Injectable()
export class DeliveryTypeOrmRepository implements DeliveryRepositoryPort {
  constructor(
    @InjectRepository(DeliveryOrmEntity)
    private readonly repository: Repository<DeliveryOrmEntity>,
  ) {}

  async findById(id: string): Promise<Delivery | null> {
    if (!isUuid(id)) return null;

    const row = await this.repository.findOne({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async create(input: Omit<Delivery, 'id'>): Promise<Delivery> {
    const row = await this.repository.save(input);
    return toDomain(row);
  }
}
