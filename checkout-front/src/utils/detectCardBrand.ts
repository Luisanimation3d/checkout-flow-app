import type { CardBrand } from '@/types/card'

export const detectCardBrand = (digits: string): CardBrand => {
  if (/^4/.test(digits)) return 'visa'
  if (/^5[1-5]/.test(digits)) return 'mastercard'
  if (/^2(22[1-9]|2[3-9]\d|[3-6]\d{2}|7[01]\d|720)/.test(digits)) return 'mastercard'
  return 'unknown'
}
