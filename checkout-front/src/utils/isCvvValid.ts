import { CVV_LENGTH } from '@/utils/cvvLength'

export const isCvvValid = (cvv: string) => new RegExp(`^\\d{${CVV_LENGTH}}$`).test(cvv)
