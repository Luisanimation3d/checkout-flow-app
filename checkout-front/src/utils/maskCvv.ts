import { CVV_LENGTH } from '@/utils/cvvLength'

export const maskCvv = (value: string) => value.replace(/\D/g, '').padEnd(CVV_LENGTH, 'X')
