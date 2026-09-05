import type { ReactNode } from 'react'
import styles from './StepHeader.module.scss'

interface StepHeaderProps {
  icon: ReactNode
  title: string
  subtitle: string
}

export const StepHeader = ({ icon, title, subtitle }: StepHeaderProps) => (
  <div className={styles.stepHeader}>
    <div className={styles.stepHeader__badge}>{icon}</div>
    <h3 className={styles.stepHeader__title}>{title}</h3>
    <p className={styles.stepHeader__subtitle}>{subtitle}</p>
  </div>
)
