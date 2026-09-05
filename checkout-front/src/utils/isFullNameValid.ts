const FULL_NAME_PATTERN = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]{3,}$/

export const isFullNameValid = (name: string) => FULL_NAME_PATTERN.test(name.trim())
