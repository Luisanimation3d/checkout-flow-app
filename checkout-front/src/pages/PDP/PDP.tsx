import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Header } from '@/components/Header'
import { ProductGallery } from '@/components/ProductGallery'
import { ProductInfo } from '@/components/ProductInfo'
import { PurchaseButton } from '@/components/PurchaseButton'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  closeCheckout,
  completePaymentForm,
  openCheckout,
  resetCheckout,
  setCheckoutProduct,
} from '@/store/slices/checkoutSlice'
import type { PaymentDataFormStep } from '@/store/slices/checkoutSlice'
import { fetchProductById } from '@/store/slices/productsSlice'
import { resetTransaction, submitPayment } from '@/store/slices/transactionSlice'
import type { RetryCheckoutRouteState, PaymentStatusRouteState } from '@/types/checkoutRouteState'
import styles from './PDP.module.scss'
import { PDPSkeleton } from './PDPSkeleton'
import { PaymentDataForm } from '@/pages/PaymentDataForm'
import { PaymentSummary } from '@/pages/PaymentSummary'

export const PDP = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const retryState = location.state as RetryCheckoutRouteState | null
  const dispatch = useAppDispatch()

  const { selected: product, selectedStatus, selectedError } = useAppSelector((state) => state.products)
  const {
    productId: checkoutProductId,
    step: checkoutStep,
    paymentFormStep,
    card,
    delivery,
  } = useAppSelector((state) => state.checkout)
  const { phase: transactionPhase, error: transactionErrorMessage } = useAppSelector((state) => state.transaction)

  const [isFavorite, setIsFavorite] = useState(false)
  const loading = selectedStatus === 'loading' || selectedStatus === 'idle'

  useEffect(() => {
    if (!id) return

    // Un refresh remonta este componente con el MISMO id: en ese caso no hay
    // que limpiar el checkout/transacción persistidos, hay que preservarlos
    // (resiliencia al refresh). Sí se limpia si el usuario pasó a otro producto,
    // o si la transacción anterior ya llegó a un estado terminal (resolved/error)
    // — p. ej. al volver desde PaymentStatus con "Volver al producto": ahí el
    // checkout ya se completó y debe verse limpio, no reabrir el resumen viejo.
    const isDifferentProduct = checkoutProductId !== null && checkoutProductId !== id
    const previousCheckoutConcluded = transactionPhase === 'resolved' || transactionPhase === 'error'

    if (isDifferentProduct || previousCheckoutConcluded) {
      dispatch(resetCheckout())
      dispatch(resetTransaction())
    } else if (checkoutStep === 'summary' && !card?.cardNumber) {
      // El número de tarjeta nunca se persiste (ver store/persistence.ts): si
      // el resumen se recupera tras un refresh, el chip de tarjeta quedaría
      // vacío. Mejor pedirla de nuevo antes de dejar pagar.
      dispatch(openCheckout('card'))
    }
    dispatch(setCheckoutProduct(id))
    dispatch(fetchProductById(id))
    if (retryState) dispatch(openCheckout('card'))
    // Solo debe correr al montar (o al cambiar de producto): los valores leídos
    // arriba no deben volver a disparar esto en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, dispatch])

  useEffect(() => {
    if (selectedError) navigate('/', { replace: true })
  }, [selectedError, navigate])

  if (loading || (!product && !selectedError)) return <PDPSkeleton />
  if (!product) return null

  const editCheckoutData = (step: PaymentDataFormStep) => dispatch(openCheckout(step))

  const handleConfirmPayment = async () => {
    if (!card || !delivery) return

    const result = await dispatch(submitPayment({ productId: product.id, card, delivery }))

    if (submitPayment.fulfilled.match(result)) {
      const routeState: PaymentStatusRouteState = {
        productId: product.id,
        transactionId: result.payload.id,
        card,
        delivery,
      }
      navigate('/status', { state: routeState })
    }
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
        initialCardValues={retryState?.retryCard ?? card ?? undefined}
        initialDeliveryValues={retryState?.retryDelivery ?? delivery ?? undefined}
        onClose={() => dispatch(closeCheckout())}
        onComplete={(nextCard, nextDelivery) =>
          dispatch(completePaymentForm({ card: nextCard, delivery: nextDelivery }))
        }
      />

      {card && delivery && (
        <PaymentSummary
          isOpen={checkoutStep === 'summary'}
          onClose={() => dispatch(closeCheckout())}
          onConfirmPayment={handleConfirmPayment}
          onEditCard={() => editCheckoutData('card')}
          onEditDelivery={() => editCheckoutData('delivery')}
          product={product}
          card={card}
          delivery={delivery}
          isSubmitting={transactionPhase === 'submitting'}
          submitError={transactionErrorMessage}
        />
      )}
    </div>
  )
}
