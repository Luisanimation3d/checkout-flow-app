import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { RiCheckboxCircleFill, RiCloseCircleFill, RiLoader4Line, RiStore2Line } from 'react-icons/ri'
import { useLocation, useNavigate } from 'react-router-dom'
import { PurchaseButton } from '@/components/PurchaseButton'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { pollTransaction } from '@/store/slices/transactionSlice'
import type { PaymentStatusRouteState, RetryCheckoutRouteState } from '@/types/checkoutRouteState'
import type { TransactionStatus } from '@/types/transaction'
import { formatCurrency } from '@/utils/formatCurrency'
import { logger } from '@/utils/logger'
import styles from './PaymentStatus.module.scss'

const POLL_INTERVAL_MS = 1800

interface StatusConfig {
  icon: ReactNode
  title: string
  subtitle: string
  tone: 'processing' | 'success' | 'danger'
}

const STATUS_CONFIG: Record<TransactionStatus, StatusConfig> = {
  processing: {
    icon: <RiLoader4Line className={styles.paymentStatus__spinner} />,
    title: 'Procesando tu pago',
    subtitle: 'Esto solo tomará un momento…',
    tone: 'processing',
  },
  approved: {
    icon: <RiCheckboxCircleFill />,
    title: '¡Pago aprobado!',
    subtitle: 'Tu pedido fue confirmado y va en camino',
    tone: 'success',
  },
  failed: {
    icon: <RiCloseCircleFill />,
    title: 'No pudimos procesar tu pago',
    subtitle: 'Verifica los datos de tu tarjeta e intenta de nuevo',
    tone: 'danger',
  },
}

export const PaymentStatus = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const routeState = location.state as PaymentStatusRouteState | null
  const dispatch = useAppDispatch()

  const transaction = useAppSelector((state) => state.transaction.current)

  const status: TransactionStatus =
    transaction?.status === 'APPROVED'
      ? 'approved'
      : transaction?.status === 'DECLINED' || transaction?.status === 'ERROR'
        ? 'failed'
        : 'processing'

  useEffect(() => {
    if (!routeState) {
      navigate('/', { replace: true })
      return
    }

    logger.info('payment-status', `Iniciando polling de la transacción ${routeState.transactionId}`)

    const poll = async () => {
      const result = await dispatch(pollTransaction(routeState.transactionId))
      if (!pollTransaction.fulfilled.match(result)) return

      if (result.payload.status !== 'PENDING') {
        logger.info('payment-status', `Polling detenido — pago ${result.payload.status}`)
        clearInterval(intervalId)
      }
    }

    const intervalId = setInterval(poll, POLL_INTERVAL_MS)
    poll()

    return () => clearInterval(intervalId)
  }, [routeState, navigate, dispatch])

  if (!routeState) return null

  const { productId, card, delivery } = routeState
  const { icon, title, subtitle, tone } = STATUS_CONFIG[status]
  const isProcessing = status === 'processing'

  const handleBackToProduct = () => navigate(`/product/${productId}`)

  const handleRetry = () => {
    const retryState: RetryCheckoutRouteState = { retryCard: card, retryDelivery: delivery }
    navigate(`/product/${productId}`, { state: retryState })
  }

  return (
    <div className={styles.paymentStatus}>
      <div className={styles.paymentStatus__content}>
        <div className={[styles.paymentStatus__badge, styles[`paymentStatus__badge--${tone}`]].join(' ')}>
          {icon}
        </div>

        <h1 className={styles.paymentStatus__title}>{title}</h1>
        <p className={styles.paymentStatus__subtitle}>{subtitle}</p>

        {!isProcessing && transaction && (
          <div className={styles.paymentStatus__details}>
            <p className={styles.paymentStatus__amount}>
              {formatCurrency(transaction.amountInCents / 100, transaction.currency)}
            </p>
            <p className={styles.paymentStatus__transactionId}>Referencia {transaction.reference}</p>
          </div>
        )}
      </div>

      {!isProcessing && (
        <div className={styles.paymentStatus__footer}>
          {status === 'failed' && <PurchaseButton onClick={handleRetry}>Reintentar pago</PurchaseButton>}

          <button type="button" className={styles.paymentStatus__secondary} onClick={handleBackToProduct}>
            <RiStore2Line /> Volver al producto
          </button>
        </div>
      )}
    </div>
  )
}
