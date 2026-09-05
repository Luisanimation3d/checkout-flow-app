import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { RiCheckboxCircleFill, RiCloseCircleFill, RiLoader4Line, RiStore2Line, RiTimeFill } from 'react-icons/ri'
import { useLocation, useNavigate } from 'react-router-dom'
import { PurchaseButton } from '@/components/PurchaseButton'
import type { PaymentStatusRouteState, RetryCheckoutRouteState } from '@/types/checkoutRouteState'
import type { TransactionStatus } from '@/types/transaction'
import { formatCurrency } from '@/utils/formatCurrency'
import { simulateTransactionOutcome } from '@/utils/simulateTransactionOutcome'
import styles from './PaymentStatus.module.scss'

const PROCESSING_DELAY_MS = 1600

interface StatusConfig {
  icon: ReactNode
  title: string
  subtitle: string
  tone: 'processing' | 'success' | 'warning' | 'danger'
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
  pending: {
    icon: <RiTimeFill />,
    title: 'Pago en proceso',
    subtitle: 'Te notificaremos apenas se confirme tu pago',
    tone: 'warning',
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

  const [status, setStatus] = useState<TransactionStatus>('processing')

  useEffect(() => {
    if (!routeState) {
      navigate('/', { replace: true })
      return
    }

    setStatus('processing')
    const timeoutId = setTimeout(() => setStatus(simulateTransactionOutcome()), PROCESSING_DELAY_MS)
    return () => clearTimeout(timeoutId)
  }, [routeState, navigate])

  if (!routeState) return null

  const { transactionId, total, currency, card, delivery } = routeState
  const { icon, title, subtitle, tone } = STATUS_CONFIG[status]
  const isProcessing = status === 'processing'

  const handleBackToStore = () => navigate('/')

  const handleRetry = () => {
    const retryState: RetryCheckoutRouteState = { retryCard: card, retryDelivery: delivery }
    navigate('/', { state: retryState })
  }

  return (
    <div className={styles.paymentStatus}>
      <div className={styles.paymentStatus__content}>
        <div className={[styles.paymentStatus__badge, styles[`paymentStatus__badge--${tone}`]].join(' ')}>
          {icon}
        </div>

        <h1 className={styles.paymentStatus__title}>{title}</h1>
        <p className={styles.paymentStatus__subtitle}>{subtitle}</p>

        {!isProcessing && (
          <div className={styles.paymentStatus__details}>
            <p className={styles.paymentStatus__amount}>{formatCurrency(total, currency)}</p>
            <p className={styles.paymentStatus__transactionId}>Referencia {transactionId}</p>
          </div>
        )}
      </div>

      {!isProcessing && (
        <div className={styles.paymentStatus__footer}>
          {status === 'failed' && <PurchaseButton onClick={handleRetry}>Reintentar pago</PurchaseButton>}

          <button type="button" className={styles.paymentStatus__secondary} onClick={handleBackToStore}>
            <RiStore2Line /> Volver a la tienda
          </button>
        </div>
      )}

      <div className={styles.paymentStatus__preview}>
        <span>Vista previa:</span>
        <button type="button" onClick={() => setStatus('approved')}>
          Aprobado
        </button>
        <button type="button" onClick={() => setStatus('pending')}>
          Pendiente
        </button>
        <button type="button" onClick={() => setStatus('failed')}>
          Fallida
        </button>
      </div>
    </div>
  )
}
