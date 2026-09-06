import { Link } from 'react-router-dom'
import type { Product } from '@/types/product'
import { formatCurrency } from '@/utils/formatCurrency'
import styles from './ProductCard.module.scss'

interface ProductCardProps {
  product: Product
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const isOutOfStock = product.stock === 0

  return (
    <Link
      to={`/product/${product.id}`}
      className={[styles.productCard, isOutOfStock && styles['productCard--outOfStock']]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.productCard__imageWrapper}>
        <img src={product.images[0]} alt={product.title} className={styles.productCard__image} />
        {isOutOfStock && <span className={styles.productCard__badge}>Agotado</span>}
      </div>

      <div className={styles.productCard__info}>
        <h3 className={styles.productCard__title}>{product.title}</h3>
        <p className={styles.productCard__price}>{formatCurrency(product.price, product.currency)}</p>
        {!isOutOfStock && <p className={styles.productCard__stock}>{product.stock} disponibles</p>}
      </div>
    </Link>
  )
}
