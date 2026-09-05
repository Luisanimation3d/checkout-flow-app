import type { CardFormValues } from '@/types/card'
import type { DeliveryFormValues } from '@/types/delivery'

export interface PaymentStatusRouteState {
  productId: string
  transactionId: string
  total: number
  currency: string
  card: CardFormValues
  delivery: DeliveryFormValues
}

export interface RetryCheckoutRouteState {
  retryCard: CardFormValues
  retryDelivery: DeliveryFormValues
}
