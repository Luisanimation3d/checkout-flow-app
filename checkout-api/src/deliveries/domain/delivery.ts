export type DeliveryStatus = 'PENDING' | 'SHIPPED' | 'DELIVERED';

export interface Delivery {
  id: string;
  address: string;
  city: string;
  department: string;
  status: DeliveryStatus;
}
