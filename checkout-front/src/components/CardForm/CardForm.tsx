import { FloatingInput } from '@/components/FloatingInput'
import type { CardField, CardFormValues } from '@/types/card'
import { CARD_NUMBER_MAX_DIGITS } from '@/utils/cardNumberLength'
import { CVV_LENGTH } from '@/utils/cvvLength'
import { formatCardNumberInput } from '@/utils/formatCardNumberInput'
import { formatExpiryInput } from '@/utils/formatExpiryInput'
import { getFieldStatus } from '@/utils/getFieldStatus'
import { getStatusIcon } from '@/utils/getStatusIcon'
import { isCardholderNameValid } from '@/utils/isCardholderNameValid'
import { isCvvValid } from '@/utils/isCvvValid'
import { isExpiryDateValid } from '@/utils/isExpiryDateValid'
import { luhnCheck } from '@/utils/luhnCheck'
import styles from './CardForm.module.scss'

const MIN_NAME_LENGTH = 3
const EXPIRY_LENGTH = 5

interface CardFormProps {
  values: CardFormValues
  onChange: (values: CardFormValues) => void
  onFieldFocus: (field: CardField) => void
  onFieldBlur: () => void
}

export const CardForm = ({ values, onChange, onFieldFocus, onFieldBlur }: CardFormProps) => {
  const setField = (field: CardField, value: string) => onChange({ ...values, [field]: value })

  const cardNumberDigits = values.cardNumber.replace(/\D/g, '')
  const cardNumberStatus = getFieldStatus(
    cardNumberDigits.length === CARD_NUMBER_MAX_DIGITS,
    luhnCheck(cardNumberDigits),
  )

  const nameStatus = getFieldStatus(
    values.name.trim().length >= MIN_NAME_LENGTH,
    isCardholderNameValid(values.name),
  )

  const expiryStatus = getFieldStatus(values.expiry.length === EXPIRY_LENGTH, isExpiryDateValid(values.expiry))

  const cvvStatus = getFieldStatus(values.cvv.length === CVV_LENGTH, isCvvValid(values.cvv))

  return (
    <div className={styles.cardForm}>
      <FloatingInput
        id="cardNumber"
        label="Número de tarjeta"
        inputMode="numeric"
        autoComplete="cc-number"
        maxLength={19}
        value={values.cardNumber}
        status={cardNumberStatus}
        helperText="Número de tarjeta inválido"
        trailingIcon={getStatusIcon(cardNumberStatus)}
        onChange={(event) => setField('cardNumber', formatCardNumberInput(event.target.value))}
        onFocus={() => onFieldFocus('cardNumber')}
        onBlur={onFieldBlur}
      />

      <FloatingInput
        id="cardName"
        label="Nombre del titular"
        autoComplete="cc-name"
        value={values.name}
        status={nameStatus}
        helperText="Ingresa el nombre como aparece en la tarjeta"
        trailingIcon={getStatusIcon(nameStatus)}
        onChange={(event) => setField('name', event.target.value.toUpperCase())}
        onFocus={() => onFieldFocus('name')}
        onBlur={onFieldBlur}
      />

      <div className={styles.cardForm__row}>
        <FloatingInput
          id="cardExpiry"
          label="MM/YY"
          inputMode="numeric"
          autoComplete="cc-exp"
          maxLength={EXPIRY_LENGTH}
          value={values.expiry}
          status={expiryStatus}
          helperText="Fecha inválida o vencida"
          trailingIcon={getStatusIcon(expiryStatus)}
          onChange={(event) => setField('expiry', formatExpiryInput(event.target.value))}
          onFocus={() => onFieldFocus('expiry')}
          onBlur={onFieldBlur}
        />

        <FloatingInput
          id="cardCvv"
          label="CVV"
          inputMode="numeric"
          autoComplete="cc-csc"
          maxLength={CVV_LENGTH}
          value={values.cvv}
          status={cvvStatus}
          helperText="CVV inválido"
          trailingIcon={getStatusIcon(cvvStatus)}
          onChange={(event) =>
            setField('cvv', event.target.value.replace(/\D/g, '').slice(0, CVV_LENGTH))
          }
          onFocus={() => onFieldFocus('cvv')}
          onBlur={onFieldBlur}
        />
      </div>
    </div>
  )
}
