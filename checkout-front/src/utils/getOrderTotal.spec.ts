import { getOrderTotal } from './getOrderTotal'

describe('getOrderTotal', () => {
  it('sums product amount, base fee and delivery fee', () => {
    expect(getOrderTotal(149000, 5000, 9000)).toBe(163000)
  })

  it('handles a zero delivery fee', () => {
    expect(getOrderTotal(100000, 5000, 0)).toBe(105000)
  })
})
