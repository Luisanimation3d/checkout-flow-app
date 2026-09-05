import { useEffect, useRef, useState } from 'react'
import { PriceBox } from '@/components/PriceBox'
import styles from './ProductInfo.module.scss'

interface ProductInfoProps {
  title: string
  description: string
  price: number
  currency: string
  stock: number
}

export const ProductInfo = ({ title, description, price, currency, stock }: ProductInfoProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isTruncated, setIsTruncated] = useState(false)
  const descriptionRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = descriptionRef.current
    if (!el || isExpanded) return

    const measure = () => setIsTruncated(el.scrollHeight > el.clientHeight)
    measure()

    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [description, isExpanded])

  return (
    <div className={styles.info}>
      <h1 className={styles.info__title}>{title}</h1>

      <div className={styles.info__descriptionGroup}>
        <p
          ref={descriptionRef}
          className={[styles.info__description, isExpanded && styles['info__description--expanded']]
            .filter(Boolean)
            .join(' ')}
        >
          {description}
        </p>

        {isTruncated && (
          <button
            type="button"
            className={styles.info__toggle}
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            {isExpanded ? 'Ver menos' : 'Ver más'}
          </button>
        )}
      </div>

      <PriceBox price={price} currency={currency} stock={stock} />
    </div>
  )
}
