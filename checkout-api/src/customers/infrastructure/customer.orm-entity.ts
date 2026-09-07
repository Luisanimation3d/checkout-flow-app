import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customers')
export class CustomerOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ name: 'document_type', length: 2 })
  documentType: string;

  @Column({ name: 'document_id', unique: true })
  documentId: string;

  @Column({ length: 10 })
  phone: string;

  @Column()
  email: string;
}
