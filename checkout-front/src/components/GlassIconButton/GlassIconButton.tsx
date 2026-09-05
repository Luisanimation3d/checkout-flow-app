import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './GlassIconButton.module.scss'

interface GlassIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  active?: boolean
}

export const GlassIconButton = ({
  icon,
  active = false,
  className,
  type = 'button',
  ...props
}: GlassIconButtonProps) => (
  <button
    type={type}
    className={[styles.btn, active && styles['btn--active'], className]
      .filter(Boolean)
      .join(' ')}
    {...props}
  >
    {icon}
  </button>
)
