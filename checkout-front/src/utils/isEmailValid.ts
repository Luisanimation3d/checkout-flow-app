const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const isEmailValid = (email: string) => EMAIL_PATTERN.test(email)
