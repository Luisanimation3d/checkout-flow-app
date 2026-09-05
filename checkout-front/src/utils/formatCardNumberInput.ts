import { CARD_NUMBER_MAX_DIGITS } from '@/utils/cardNumberLength'

export const formatCardNumberInput = (raw: string) => {
  const digits = raw.replace(/\D/g, '').slice(0, CARD_NUMBER_MAX_DIGITS)
  return digits.match(/.{1,4}/g)?.join(' ') ?? digits
}
