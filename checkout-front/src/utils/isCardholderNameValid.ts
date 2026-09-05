const CARDHOLDER_NAME_PATTERN = /^[A-ZÁÉÍÓÚÑ\s]{3,}$/

export const isCardholderNameValid = (name: string) => CARDHOLDER_NAME_PATTERN.test(name.trim())
