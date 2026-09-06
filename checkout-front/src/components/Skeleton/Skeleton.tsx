import styles from './Skeleton.module.scss'

interface SkeletonProps {
  width?: string
  height?: string
  borderRadius?: string
  className?: string
}

export const Skeleton = ({ width, height, borderRadius, className }: SkeletonProps) => (
  <span
    className={[styles.skeleton, className].filter(Boolean).join(' ')}
    style={{ width, height, borderRadius }}
  />
)
