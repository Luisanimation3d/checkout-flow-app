import { Skeleton } from '@/components/Skeleton'
import pdpStyles from './PDP.module.scss'
import styles from './PDPSkeleton.module.scss'

export const PDPSkeleton = () => (
  <div className={pdpStyles.pdp}>
    <div className={styles.pdpSkeleton__galleryWrapper}>
      <Skeleton width="100%" height="100%" borderRadius="0" />
    </div>

    <div className={pdpStyles.pdp__body}>
      <div className={styles.pdpSkeleton__info}>
        <Skeleton width="80%" height="24px" />
        <Skeleton width="100%" height="14px" />
        <Skeleton width="100%" height="14px" />
        <Skeleton width="60%" height="14px" />
        <Skeleton width="35%" height="26px" className={styles.pdpSkeleton__price} />
      </div>

      <Skeleton height="52px" borderRadius="999px" />
    </div>
  </div>
)
