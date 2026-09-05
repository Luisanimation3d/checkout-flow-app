import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { useEffect, useState } from 'react'
import { RiArrowLeftLine } from 'react-icons/ri'
import { CardForm } from '@/components/CardForm'
import { CreditCard } from '@/components/CreditCard'
import { DeliveryForm } from '@/components/DeliveryForm'
import { PurchaseButton } from '@/components/PurchaseButton'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { CardField, CardFormValues } from '@/types/card'
import type { DeliveryFormValues } from '@/types/delivery'
import { BREAKPOINTS } from '@/utils/breakpoints'
import { DOCUMENT_TYPES } from '@/utils/documentTypes'
import { isCardFormValid } from '@/utils/isCardFormValid'
import styles from './PaymentDataForm.module.scss'

const CLOSE_OFFSET_PX = 120
const CLOSE_VELOCITY_PX = 500

type Step = 'card' | 'delivery'

const INITIAL_CARD_VALUES: CardFormValues = { cardNumber: '', name: '', expiry: '', cvv: '' }
const INITIAL_DELIVERY_VALUES: DeliveryFormValues = {
  fullName: '',
  documentType: DOCUMENT_TYPES[0].value,
  documentId: '',
  phone: '',
  address: '',
  city: '',
  department: '',
}

const SHEET_MOTION = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
  transition: { type: 'spring', damping: 32, stiffness: 300 },
} as const

const DIALOG_MOTION = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2, ease: 'easeOut' },
} as const

interface PaymentDataFormProps {
  isOpen: boolean
  onClose: () => void
}

export const PaymentDataForm = ({ isOpen, onClose }: PaymentDataFormProps) => {
  const [step, setStep] = useState<Step>('card')
  const [cardValues, setCardValues] = useState<CardFormValues>(INITIAL_CARD_VALUES)
  const [deliveryValues, setDeliveryValues] = useState<DeliveryFormValues>(INITIAL_DELIVERY_VALUES)
  const [activeField, setActiveField] = useState<CardField | null>(null)
  const dragControls = useDragControls()
  const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`)

  useEffect(() => {
    if (!isOpen) return

    setStep('card')
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.paymentDataForm}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.paymentDataForm__sheet}
            onClick={(event) => event.stopPropagation()}
            {...(isDesktop ? DIALOG_MOTION : SHEET_MOTION)}
            drag={isDesktop ? false : 'y'}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 1 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > CLOSE_OFFSET_PX || info.velocity.y > CLOSE_VELOCITY_PX) {
                onClose()
              }
            }}
          >
            <div
              className={styles.paymentDataForm__draggable}
              onPointerDown={(event) => !isDesktop && dragControls.start(event)}
            />

            <div className={styles.paymentDataForm__content}>
              {step === 'card' ? (
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
                  <button
                    type="button"
                    className={styles.paymentDataForm__back}
                    onClick={() => setStep('card')}
                  >
                    <RiArrowLeftLine /> Volver
                  </button>

                  <DeliveryForm values={deliveryValues} onChange={setDeliveryValues} />
                </>
              )}
            </div>

            {step === 'card' && (
              <div className={styles.paymentDataForm__footer}>
                <PurchaseButton disabled={!isCardFormValid(cardValues)} onClick={() => setStep('delivery')}>
                  Siguiente
                </PurchaseButton>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
