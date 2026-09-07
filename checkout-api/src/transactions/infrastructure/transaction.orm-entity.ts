import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('transactions')
export class TransactionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  reference: string;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column({ name: 'delivery_id' })
  deliveryId: string;

  @Column({ name: 'amount_in_cents' })
  amountInCents: number;

  @Column({ length: 3 })
  currency: string;

  @Column()
  status: string;

  @Column({ name: 'gateway_transaction_id', type: 'varchar', nullable: true })
  gatewayTransactionId: string | null;

  @Column({ name: 'status_message', type: 'varchar', nullable: true })
  statusMessage: string | null;
}
