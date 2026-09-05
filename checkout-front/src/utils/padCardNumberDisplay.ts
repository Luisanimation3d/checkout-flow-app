import { CARD_NUMBER_MAX_DIGITS } from '@/utils/cardNumberLength'

export const padCardNumberDisplay = (formattedValue: string) => {
  const digits = formattedValue.replace(/\D/g, '').padEnd(CARD_NUMBER_MAX_DIGITS, 'X')
  return digits.match(/.{1,4}/g)?.join(' ') ?? digits
}
