import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUuid } from '../../shared/core/is-uuid';
import type { Customer, DocumentType } from '../domain/customer';
import type { CustomerRepositoryPort } from '../domain/customer-repository.port';
import { CustomerOrmEntity } from './customer.orm-entity';

const toDomain = (row: CustomerOrmEntity): Customer => ({
  id: row.id,
  fullName: row.fullName,
  documentType: row.documentType as DocumentType,
  documentId: row.documentId,
  phone: row.phone,
});

@Injectable()
export class CustomerTypeOrmRepository implements CustomerRepositoryPort {
  constructor(
    @InjectRepository(CustomerOrmEntity)
    private readonly repository: Repository<CustomerOrmEntity>,
  ) {}

  async findById(id: string): Promise<Customer | null> {
    if (!isUuid(id)) return null;

    const row = await this.repository.findOne({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async findByDocumentId(documentId: string): Promise<Customer | null> {
    const row = await this.repository.findOne({ where: { documentId } });
    return row ? toDomain(row) : null;
  }

  async create(input: Omit<Customer, 'id'>): Promise<Customer> {
    const row = await this.repository.save(input);
    return toDomain(row);
  }
}
