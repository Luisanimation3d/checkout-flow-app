import type { CardFormValues } from '@/types/card'
import { CARD_NUMBER_MAX_DIGITS } from '@/utils/cardNumberLength'
import { isCardholderNameValid } from '@/utils/isCardholderNameValid'
import { isCvvValid } from '@/utils/isCvvValid'
import { isExpiryDateValid } from '@/utils/isExpiryDateValid'
import { luhnCheck } from '@/utils/luhnCheck'

export const isCardFormValid = ({ cardNumber, name, expiry, cvv, installments }: CardFormValues) => {
  const cardNumberDigits = cardNumber.replace(/\D/g, '')

  return (
    cardNumberDigits.length === CARD_NUMBER_MAX_DIGITS &&
    luhnCheck(cardNumberDigits) &&
    isCardholderNameValid(name) &&
    isExpiryDateValid(expiry) &&
    isCvvValid(cvv) &&
    installments >= 1 &&
    installments <= 36
  )
}
