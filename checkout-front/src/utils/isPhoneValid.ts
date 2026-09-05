const PHONE_PATTERN = /^\d{10}$/

export const isPhoneValid = (phone: string) => PHONE_PATTERN.test(phone)
