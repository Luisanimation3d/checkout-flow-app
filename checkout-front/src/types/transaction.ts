export type TransactionApiStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR'

export interface Transaction {
  id: string
  reference: string
  productId: string
  customerId: string
  deliveryId: string
  amountInCents: number
  currency: string
  status: TransactionApiStatus
  gatewayTransactionId: string | null
  statusMessage: string | null
}

export type TransactionStatus = 'processing' | 'approved' | 'failed'
