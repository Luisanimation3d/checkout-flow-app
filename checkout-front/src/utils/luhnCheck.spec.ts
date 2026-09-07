import { luhnCheck } from './luhnCheck'

describe('luhnCheck', () => {
  it('accepts a valid Visa test number', () => {
    expect(luhnCheck('4242424242424242')).toBe(true)
  })

  it('rejects a number with an invalid check digit', () => {
    expect(luhnCheck('4242424242424241')).toBe(false)
  })
})
