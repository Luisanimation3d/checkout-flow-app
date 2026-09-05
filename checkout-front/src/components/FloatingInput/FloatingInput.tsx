import { useState } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import type { FieldStatus } from '@/types/fieldStatus'
import styles from './FloatingInput.module.scss'

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  active?: boolean
  status?: FieldStatus
  helperText?: string
  trailingIcon?: ReactNode
}

export const FloatingInput = ({
  label,
  id,
  value,
  className,
  active = false,
  status,
  helperText,
  trailingIcon,
  onFocus,
  onBlur,
  ...props
}: FloatingInputProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const isElevated = isFocused || Boolean(value)

  return (
    <div className={styles.floatingInputWrapper}>
      <div
        className={[
          styles.floatingInput,
          isElevated && styles['floatingInput--elevated'],
          (isFocused || active) && styles['floatingInput--active'],
          status && styles[`floatingInput--${status}`],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <input
          id={id}
          value={value}
          className={styles.floatingInput__input}
          onFocus={(event) => {
            setIsFocused(true)
            onFocus?.(event)
          }}
          onBlur={(event) => {
            setIsFocused(false)
            onBlur?.(event)
          }}
          {...props}
        />
        <label htmlFor={id} className={styles.floatingInput__label}>
          {label}
        </label>
        {trailingIcon && <span className={styles.floatingInput__trailing}>{trailingIcon}</span>}
      </div>

      {helperText && status === 'invalid' && (
        <span className={styles.floatingInputWrapper__helperText}>{helperText}</span>
      )}
    </div>
  )
}
