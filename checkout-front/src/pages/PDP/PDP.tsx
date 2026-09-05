import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Header } from '@/components/Header'
import { ProductGallery } from '@/components/ProductGallery'
import { ProductInfo } from '@/components/ProductInfo'
import { PurchaseButton } from '@/components/PurchaseButton'
import type { CardFormValues } from '@/types/card'
import type { RetryCheckoutRouteState, PaymentStatusRouteState } from '@/types/checkoutRouteState'
import type { DeliveryFormValues } from '@/types/delivery'
import type { Product } from '@/types/product'
import { calculateDeliveryFee } from '@/utils/calculateDeliveryFee'
import { BASE_FEE } from '@/utils/checkoutFees'
import { generateTransactionId } from '@/utils/generateTransactionId'
import { getOrderTotal } from '@/utils/getOrderTotal'
import styles from './PDP.module.scss'
import { PaymentDataForm } from '@/pages/PaymentDataForm'
import type { PaymentDataFormStep } from '@/pages/PaymentDataForm'
import { PaymentSummary } from '@/pages/PaymentSummary'

const product: Product = {
  id: '1',
  title: 'Wireless Earbuds Pro',
  description:
    'Audífonos inalámbricos de última generación con cancelación activa de ruido (ANC) de doble micrófono, que bloquea el ruido ambiental para una experiencia de audio inmersiva. Su estuche de carga compacto ofrece hasta 30 horas de batería total (6 horas en los audífonos + 24 horas adicionales en el estuche), con carga rápida que te da 1 hora de uso con solo 10 minutos de carga. Resistencia al agua y sudor certificada IPX5, controles táctiles intuitivos, y conexión Bluetooth 5.3 de baja latencia, perfecta para llamadas, música y hasta gaming móvil sin retrasos perceptibles.',
  price: 189000,
  currency: 'COP',
  stock: 8,
  deliveryFee: 8000,
  images: [
    'https://images.unsplash.com/photo-1783890848515-c0dc28b25ef2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHdpcmVsZXNzJTIwZWFyYnVkc3xlbnwwfDJ8MHx8fDA%3D',
    'https://images.unsplash.com/photo-1783890848512-f5fa2dba2d5d?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  ],
}

type CheckoutStep = 'closed' | 'payment' | 'summary'

export const PDP = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const retryState = location.state as RetryCheckoutRouteState | null

  const [isFavorite, setIsFavorite] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>(retryState ? 'payment' : 'closed')
  const [paymentFormStep, setPaymentFormStep] = useState<PaymentDataFormStep>('card')
  const [checkoutData, setCheckoutData] = useState<{ card: CardFormValues; delivery: DeliveryFormValues } | null>(
    null,
  )

  const editCheckoutData = (step: PaymentDataFormStep) => {
    setPaymentFormStep(step)
    setCheckoutStep('payment')
  }

  const handleConfirmPayment = () => {
    if (!checkoutData) return

    const total = getOrderTotal(
      product.price,
      BASE_FEE,
      calculateDeliveryFee(product.deliveryFee, checkoutData.delivery.city),
    )

    const routeState: PaymentStatusRouteState = {
      transactionId: generateTransactionId(),
      total,
      currency: product.currency,
      card: checkoutData.card,
      delivery: checkoutData.delivery,
    }

    navigate('/status', { state: routeState })
  }

  return (
    <div className={styles.pdp}>
      <ProductGallery
        images={product.images}
        alt={product.title}
        overlay={
          <Header
            isFavorite={isFavorite}
            onToggleFavorite={() => setIsFavorite((prev) => !prev)}
          />
        }
      />

      <div className={styles.pdp__body}>
        <ProductInfo
          title={product.title}
          description={product.description}
          price={product.price}
          currency={product.currency}
          stock={product.stock}
        />

        <div className={styles.pdp__purchase}>
          <PurchaseButton onClick={() => editCheckoutData('card')}>
            Pagar con tarjeta de crédito
          </PurchaseButton>
        </div>
      </div>

      <PaymentDataForm
        isOpen={checkoutStep === 'payment'}
        initialStep={paymentFormStep}
        initialCardValues={retryState?.retryCard}
        initialDeliveryValues={retryState?.retryDelivery}
        onClose={() => setCheckoutStep('closed')}
        onComplete={(card, delivery) => {
          setCheckoutData({ card, delivery })
          setCheckoutStep('summary')
        }}
      />

      {checkoutData && (
        <PaymentSummary
          isOpen={checkoutStep === 'summary'}
          onClose={() => setCheckoutStep('closed')}
          onConfirmPayment={handleConfirmPayment}
          onEditCard={() => editCheckoutData('card')}
          onEditDelivery={() => editCheckoutData('delivery')}
          product={product}
          card={checkoutData.card}
          delivery={checkoutData.delivery}
        />
      )}
    </div>
  )
}
