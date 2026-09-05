export const formatCurrency = (value: number, currency = 'COP', locale = 'es-CO') =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
