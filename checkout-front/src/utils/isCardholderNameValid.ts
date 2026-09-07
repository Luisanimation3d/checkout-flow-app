// El proveedor de pagos rechaza en tokenización nombres de menos de 5 caracteres
// ("no debe contener menos de 5 caracteres"): validamos con el mismo mínimo
// acá para que el formulario lo detecte antes de intentar tokenizar.
const CARDHOLDER_NAME_PATTERN = /^[A-ZÁÉÍÓÚÑ\s]{5,}$/

export const isCardholderNameValid = (name: string) => CARDHOLDER_NAME_PATTERN.test(name.trim())
