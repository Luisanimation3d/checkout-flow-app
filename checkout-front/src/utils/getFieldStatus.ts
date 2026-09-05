import type { FieldStatus } from '@/types/fieldStatus'

export const getFieldStatus = (isComplete: boolean, isValid: boolean): FieldStatus => {
  if (!isComplete) return undefined
  return isValid ? 'valid' : 'invalid'
}
