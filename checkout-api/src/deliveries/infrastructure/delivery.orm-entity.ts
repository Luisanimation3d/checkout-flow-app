import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('deliveries')
export class DeliveryOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  department: string;

  @Column({ default: 'PENDING' })
  status: string;
}
