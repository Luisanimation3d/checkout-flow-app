export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  stock: number;
  images: string[];
  deliveryFee: number;
}
