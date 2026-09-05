import type { SelectHTMLAttributes } from 'react'
import { RiArrowDownSLine } from 'react-icons/ri'
import styles from './FloatingSelect.module.scss'

interface FloatingSelectOption {
  value: string
  label: string
}

interface FloatingSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: FloatingSelectOption[]
}

export const FloatingSelect = ({ label, id, options, className, ...props }: FloatingSelectProps) => (
  <div className={[styles.floatingSelect, className].filter(Boolean).join(' ')}>
    <select id={id} className={styles.floatingSelect__select} {...props}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <label htmlFor={id} className={styles.floatingSelect__label}>
      {label}
    </label>
    <span className={styles.floatingSelect__chevron}>
      <RiArrowDownSLine />
    </span>
  </div>
)
