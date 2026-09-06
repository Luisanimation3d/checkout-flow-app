import { Skeleton } from '@/components/Skeleton'
import styles from './ProductCardSkeleton.module.scss'

export const ProductCardSkeleton = () => (
  <div className={styles.productCardSkeleton}>
    <div className={styles.productCardSkeleton__imageWrapper}>
      <Skeleton width="100%" height="100%" borderRadius="16px" />
    </div>
    <Skeleton width="70%" height="14px" />
    <Skeleton width="40%" height="15px" />
  </div>
)
