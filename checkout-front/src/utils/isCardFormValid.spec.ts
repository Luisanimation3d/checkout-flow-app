import type { CardFormValues } from '@/types/card'
import { isCardFormValid } from './isCardFormValid'

const validCard: CardFormValues = {
  cardNumber: '4242 4242 4242 4242',
  name: 'LUIS CORREA',
  expiry: '12/29',
  cvv: '123',
  installments: 1,
}

describe('isCardFormValid', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-06-15'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('accepts a fully valid card', () => {
    expect(isCardFormValid(validCard)).toBe(true)
  })

  it('rejects a card number that fails the Luhn check', () => {
    expect(isCardFormValid({ ...validCard, cardNumber: '4242 4242 4242 4241' })).toBe(false)
  })

  it('rejects a card number with the wrong digit count', () => {
    expect(isCardFormValid({ ...validCard, cardNumber: '4242 4242' })).toBe(false)
  })

  it('rejects a cardholder name shorter than 5 characters', () => {
    expect(isCardFormValid({ ...validCard, name: 'LUIS' })).toBe(false)
  })

  it('rejects an expired date', () => {
    expect(isCardFormValid({ ...validCard, expiry: '01/20' })).toBe(false)
  })

  it('rejects an invalid cvv', () => {
    expect(isCardFormValid({ ...validCard, cvv: '12' })).toBe(false)
  })

  it('rejects installments outside the 1-36 range', () => {
    expect(isCardFormValid({ ...validCard, installments: 0 })).toBe(false)
    expect(isCardFormValid({ ...validCard, installments: 37 })).toBe(false)
  })

  it('accepts installments at the boundaries', () => {
    expect(isCardFormValid({ ...validCard, installments: 1 })).toBe(true)
    expect(isCardFormValid({ ...validCard, installments: 36 })).toBe(true)
  })
})
