import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Header } from '@/components/Header'
import { ProductGallery } from '@/components/ProductGallery'
import { ProductInfo } from '@/components/ProductInfo'
import { PurchaseButton } from '@/components/PurchaseButton'
import type { CardFormValues } from '@/types/card'
import type { RetryCheckoutRouteState, PaymentStatusRouteState } from '@/types/checkoutRouteState'
import type { DeliveryFormValues } from '@/types/delivery'
import { calculateDeliveryFee } from '@/utils/calculateDeliveryFee'
import { BASE_FEE } from '@/utils/checkoutFees'
import { generateTransactionId } from '@/utils/generateTransactionId'
import { getOrderTotal } from '@/utils/getOrderTotal'
import { findProductById } from '@/utils/products'
import styles from './PDP.module.scss'
import { PaymentDataForm } from '@/pages/PaymentDataForm'
import type { PaymentDataFormStep } from '@/pages/PaymentDataForm'
import { PaymentSummary } from '@/pages/PaymentSummary'

type CheckoutStep = 'closed' | 'payment' | 'summary'

export const PDP = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const retryState = location.state as RetryCheckoutRouteState | null

  const product = findProductById(id)

  const [isFavorite, setIsFavorite] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>(retryState ? 'payment' : 'closed')
  const [paymentFormStep, setPaymentFormStep] = useState<PaymentDataFormStep>('card')
  const [checkoutData, setCheckoutData] = useState<{ card: CardFormValues; delivery: DeliveryFormValues } | null>(
    null,
  )

  useEffect(() => {
    if (!product) navigate('/', { replace: true })
  }, [product, navigate])

  if (!product) return null

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
      productId: product.id,
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
            onBack={() => navigate('/')}
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
          <PurchaseButton disabled={product.stock === 0} onClick={() => editCheckoutData('card')}>
            {product.stock === 0 ? 'Agotado' : 'Pagar con tarjeta de crédito'}
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
