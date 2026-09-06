import type { DeliveryFormValues } from '@/types/delivery'
import { isDeliveryFormValid } from './isDeliveryFormValid'

const validDelivery: DeliveryFormValues = {
  fullName: 'John Doe',
  documentType: 'CC',
  documentId: '1000099928',
  phone: '3001234567',
  email: 'john@example.com',
  address: 'Calle 123 #45-67',
  city: 'medellin',
  department: 'antioquia',
}

describe('isDeliveryFormValid', () => {
  it('accepts a fully valid delivery form', () => {
    expect(isDeliveryFormValid(validDelivery)).toBe(true)
  })

  it('rejects an invalid full name', () => {
    expect(isDeliveryFormValid({ ...validDelivery, fullName: 'Jo' })).toBe(false)
  })

  it('rejects an invalid documentId', () => {
    expect(isDeliveryFormValid({ ...validDelivery, documentId: '123' })).toBe(false)
  })

  it('rejects an invalid phone', () => {
    expect(isDeliveryFormValid({ ...validDelivery, phone: '300' })).toBe(false)
  })

  it('rejects an invalid email', () => {
    expect(isDeliveryFormValid({ ...validDelivery, email: 'not-an-email' })).toBe(false)
  })

  it('rejects an address shorter than 5 characters', () => {
    expect(isDeliveryFormValid({ ...validDelivery, address: 'Cl 1' })).toBe(false)
  })

  it('rejects an empty city or department', () => {
    expect(isDeliveryFormValid({ ...validDelivery, city: '' })).toBe(false)
    expect(isDeliveryFormValid({ ...validDelivery, department: '' })).toBe(false)
  })
})
