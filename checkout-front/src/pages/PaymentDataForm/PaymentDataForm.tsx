import { useEffect, useState } from 'react'
import { RiArrowLeftLine } from 'react-icons/ri'
import { Backdrop } from '@/components/Backdrop'
import { CardForm } from '@/components/CardForm'
import { CreditCard } from '@/components/CreditCard'
import { DeliveryForm } from '@/components/DeliveryForm'
import { PurchaseButton } from '@/components/PurchaseButton'
import type { PaymentDataFormStep as Step } from '@/store/slices/checkoutSlice'
import type { CardField, CardFormValues } from '@/types/card'
import type { DeliveryFormValues } from '@/types/delivery'
import { DOCUMENT_TYPES } from '@/utils/documentTypes'
import { isCardFormValid } from '@/utils/isCardFormValid'
import { isDeliveryFormValid } from '@/utils/isDeliveryFormValid'
import styles from './PaymentDataForm.module.scss'

const INITIAL_CARD_VALUES: CardFormValues = {
  cardNumber: '',
  name: '',
  expiry: '',
  cvv: '',
  installments: 1,
}
const INITIAL_DELIVERY_VALUES: DeliveryFormValues = {
  fullName: '',
  documentType: DOCUMENT_TYPES[0].value,
  documentId: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  department: '',
}

interface PaymentDataFormProps {
  isOpen: boolean
  initialStep?: Step
  initialCardValues?: CardFormValues
  initialDeliveryValues?: DeliveryFormValues
  onClose: () => void
  onComplete: (card: CardFormValues, delivery: DeliveryFormValues) => void
}

export const PaymentDataForm = ({
  isOpen,
  initialStep = 'card',
  initialCardValues = INITIAL_CARD_VALUES,
  initialDeliveryValues = INITIAL_DELIVERY_VALUES,
  onClose,
  onComplete,
}: PaymentDataFormProps) => {
  const [step, setStep] = useState<Step>(initialStep)
  const [cardValues, setCardValues] = useState<CardFormValues>(initialCardValues)
  const [deliveryValues, setDeliveryValues] = useState<DeliveryFormValues>(initialDeliveryValues)
  const [activeField, setActiveField] = useState<CardField | null>(null)

  useEffect(() => {
    if (isOpen) setStep(initialStep)
  }, [isOpen, initialStep])

  return (
    <Backdrop
      isOpen={isOpen}
      onClose={onClose}
      content={
        step === 'card' ? (
          <>
            <CreditCard values={cardValues} activeField={activeField} />
            <CardForm
              values={cardValues}
              onChange={setCardValues}
              onFieldFocus={setActiveField}
              onFieldBlur={() => setActiveField(null)}
            />
          </>
        ) : (
          <>
            <button type="button" className={styles.paymentDataForm__back} onClick={() => setStep('card')}>
              <RiArrowLeftLine /> Volver
            </button>

            <DeliveryForm values={deliveryValues} onChange={setDeliveryValues} />
          </>
        )
      }
      footer={
        step === 'card' ? (
          <PurchaseButton disabled={!isCardFormValid(cardValues)} onClick={() => setStep('delivery')}>
            Siguiente
          </PurchaseButton>
        ) : (
          <PurchaseButton
            disabled={!isDeliveryFormValid(deliveryValues)}
            onClick={() => onComplete(cardValues, deliveryValues)}
          >
            Ver resumen
          </PurchaseButton>
        )
      }
    />
  )
}
