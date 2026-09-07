import { padCardNumberDisplay } from './padCardNumberDisplay'

describe('padCardNumberDisplay', () => {
  it('pads a partial number with X grouped in blocks of 4', () => {
    expect(padCardNumberDisplay('4242')).toBe('4242 XXXX XXXX XXXX')
  })

  it('leaves a complete number grouped, unpadded', () => {
    expect(padCardNumberDisplay('4242 4242 4242 4242')).toBe('4242 4242 4242 4242')
  })

  it('pads an empty value entirely', () => {
    expect(padCardNumberDisplay('')).toBe('XXXX XXXX XXXX XXXX')
  })
})
