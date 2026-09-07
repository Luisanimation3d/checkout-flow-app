export type CardField = 'cardNumber' | 'name' | 'expiry' | 'cvv'

export type CardBrand = 'visa' | 'mastercard' | 'unknown'

export interface CardFormValues {
  cardNumber: string
  name: string
  expiry: string
  cvv: string
  installments: number
}
