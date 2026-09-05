import type { ButtonHTMLAttributes } from 'react'
import styles from './PurchaseButton.module.scss'

export const PurchaseButton = ({
  type = 'button',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button type={type} className={[styles.btn, className].filter(Boolean).join(' ')} {...props} />
)
