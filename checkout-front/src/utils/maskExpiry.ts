export const maskExpiry = (formattedValue: string) => {
  const [month = '', year = ''] = formattedValue.split('/')
  return `${month.padEnd(2, 'M')}/${year.padEnd(2, 'Y')}`
}
