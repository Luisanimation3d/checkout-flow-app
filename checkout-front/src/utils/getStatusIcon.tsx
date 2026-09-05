import { RiCheckboxCircleFill, RiCloseCircleFill } from 'react-icons/ri'
import type { FieldStatus } from '@/types/fieldStatus'

export const getStatusIcon = (status: FieldStatus) => {
  if (status === 'valid') return <RiCheckboxCircleFill />
  if (status === 'invalid') return <RiCloseCircleFill />
  return undefined
}
