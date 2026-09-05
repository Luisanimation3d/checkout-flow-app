import { RiBankCardLine, RiMastercardLine, RiVisaLine } from 'react-icons/ri'
import type { CardField, CardFormValues } from '@/types/card'
import { detectCardBrand } from '@/utils/detectCardBrand'
import { maskCvv } from '@/utils/maskCvv'
import { maskExpiry } from '@/utils/maskExpiry'
import { padCardNumberDisplay } from '@/utils/padCardNumberDisplay'
import styles from './CreditCard.module.scss'

interface CreditCardProps {
  values: CardFormValues
  activeField: CardField | null
}

const BRAND_ICON = {
  visa: <RiVisaLine />,
  mastercard: <RiMastercardLine />,
  unknown: <RiBankCardLine />,
}

export const CreditCard = ({ values, activeField }: CreditCardProps) => {
  const brand = detectCardBrand(values.cardNumber)
  const isFlipped = activeField === 'cvv'

  const fieldClass = (field: CardField) =>
    [styles.creditCard__field, activeField === field && styles['creditCard__field--active']]
      .filter(Boolean)
      .join(' ')

  return (
    <div className={styles.creditCard}>
      <div
        className={[styles.creditCard__card, isFlipped && styles['creditCard__card--flipped']]
          .filter(Boolean)
          .join(' ')}
      >
        <div className={`${styles.creditCard__face} ${styles['creditCard__face--front']}`}>
          <div className={styles.creditCard__brand}>{BRAND_ICON[brand]}</div>

          <p className={fieldClass('cardNumber')}>{padCardNumberDisplay(values.cardNumber)}</p>

          <div className={styles.creditCard__row}>
            <div className={fieldClass('name')}>
              <span>Nombre</span>
              <p>{values.name || 'NOMBRE APELLIDO'}</p>
            </div>
            <div className={fieldClass('expiry')}>
              <span>Vence</span>
              <p>{maskExpiry(values.expiry)}</p>
            </div>
          </div>
        </div>

        <div className={`${styles.creditCard__face} ${styles['creditCard__face--back']}`}>
          <div className={styles.creditCard__stripe} />
          <div className={fieldClass('cvv')}>
            <span>CVV</span>
            <p>{maskCvv(values.cvv)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
