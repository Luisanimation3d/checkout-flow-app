import { maskCvv } from './maskCvv'

describe('maskCvv', () => {
  it('pads a partial cvv with X to the full length', () => {
    expect(maskCvv('1')).toBe('1XX')
  })

  it('leaves a complete cvv unchanged', () => {
    expect(maskCvv('123')).toBe('123')
  })

  it('strips non-digit characters before padding', () => {
    expect(maskCvv('1a2')).toBe('12X')
  })
})
