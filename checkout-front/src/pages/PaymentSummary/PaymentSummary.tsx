import {
  RiBankCardLine,
  RiMapPin2Fill,
  RiMastercardLine,
  RiPencilLine,
  RiShoppingBag3Fill,
  RiVisaLine,
} from 'react-icons/ri'
import { Backdrop } from '@/components/Backdrop'
import { PurchaseButton } from '@/components/PurchaseButton'
import { StepHeader } from '@/components/StepHeader'
import type { CardFormValues } from '@/types/card'
import type { DeliveryFormValues } from '@/types/delivery'
import type { Product } from '@/types/product'
import { calculateDeliveryFee } from '@/utils/calculateDeliveryFee'
import { BASE_FEE } from '@/utils/checkoutFees'
import { detectCardBrand } from '@/utils/detectCardBrand'
import { findCityLabel } from '@/utils/colombiaLocations'
import { formatCurrency } from '@/utils/formatCurrency'
import { getOrderTotal } from '@/utils/getOrderTotal'
import styles from './PaymentSummary.module.scss'

const BRAND_ICON = {
  visa: <RiVisaLine />,
  mastercard: <RiMastercardLine />,
  unknown: <RiBankCardLine />,
}

interface PaymentSummaryProps {
  isOpen: boolean
  onClose: () => void
  onConfirmPayment: () => void
  onEditCard: () => void
  onEditDelivery: () => void
  product: Product
  card: CardFormValues
  delivery: DeliveryFormValues
  isSubmitting?: boolean
  submitError?: string | null
}

export const PaymentSummary = ({
  isOpen,
  onClose,
  onConfirmPayment,
  onEditCard,
  onEditDelivery,
  product,
  card,
  delivery,
  isSubmitting = false,
  submitError = null,
}: PaymentSummaryProps) => {
  const deliveryFee = calculateDeliveryFee(product.deliveryFee, delivery.city)
  const total = getOrderTotal(product.price, BASE_FEE, deliveryFee)

  const lines = [
    { label: product.title, amount: product.price },
    { label: 'Tarifa base', amount: BASE_FEE },
    { label: 'Costo de envío', amount: deliveryFee },
  ]

  const cardBrand = detectCardBrand(card.cardNumber)
  const cardLastFour = card.cardNumber.replace(/\D/g, '').slice(-4)
  const deliveryAddress = `${delivery.address}, ${findCityLabel(delivery.city)}`

  return (
    <Backdrop
      isOpen={isOpen}
      onClose={onClose}
      content={
        <>
          <StepHeader
            icon={<RiShoppingBag3Fill />}
            title="Resumen de pago"
            subtitle="Revisa el detalle antes de confirmar"
          />

          <div className={styles.paymentSummary__meta}>
            <button
              type="button"
              className={styles.paymentSummary__chip}
              onClick={onEditCard}
              aria-label="Editar datos de la tarjeta"
            >
              <span className={styles.paymentSummary__chipIcon}>{BRAND_ICON[cardBrand]}</span>
              <span className={styles.paymentSummary__chipText}>•••• {cardLastFour}</span>
              <RiPencilLine className={styles.paymentSummary__chipEdit} />
            </button>

            <button
              type="button"
              className={styles.paymentSummary__chip}
              onClick={onEditDelivery}
              aria-label="Editar dirección de entrega"
            >
              <span className={styles.paymentSummary__chipIcon}>
                <RiMapPin2Fill />
              </span>
              <span className={styles.paymentSummary__chipText}>{deliveryAddress}</span>
              <RiPencilLine className={styles.paymentSummary__chipEdit} />
            </button>
          </div>

          <div className={styles.paymentSummary__lines}>
            {lines.map((line) => (
              <div key={line.label} className={styles.paymentSummary__line}>
                <span>{line.label}</span>
                <span>{formatCurrency(line.amount, product.currency)}</span>
              </div>
            ))}

            <div className={styles.paymentSummary__total}>
              <span>Total</span>
              <span>{formatCurrency(total, product.currency)}</span>
            </div>
          </div>

          {submitError && <p className={styles.paymentSummary__error}>{submitError}</p>}
        </>
      }
      footer={
        <PurchaseButton onClick={onConfirmPayment} disabled={isSubmitting}>
          {isSubmitting ? 'Procesando…' : `Pagar ${formatCurrency(total, product.currency)}`}
        </PurchaseButton>
      }
    />
  )
}
