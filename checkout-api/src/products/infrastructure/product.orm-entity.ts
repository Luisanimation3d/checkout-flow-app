import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class ProductOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('int')
  price: number;

  @Column({ length: 3 })
  currency: string;

  @Column('int')
  stock: number;

  @Column('text', { array: true })
  images: string[];

  @Column('int', { name: 'delivery_fee' })
  deliveryFee: number;
}
