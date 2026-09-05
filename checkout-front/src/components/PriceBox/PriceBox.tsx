import { formatCurrency } from '@/utils/formatCurrency'
import styles from './PriceBox.module.scss'

interface PriceBoxProps {
  price: number
  currency: string
  stock: number
}

export const PriceBox = ({ price, currency, stock }: PriceBoxProps) => (
  <div className={styles.priceBox}>
    <span className={styles.priceBox__label}>Precio</span>
    <strong className={styles.priceBox__price}>{formatCurrency(price, currency)}</strong>
    <span className={styles.priceBox__stock}>{stock} unidades disponibles</span>
  </div>
)
