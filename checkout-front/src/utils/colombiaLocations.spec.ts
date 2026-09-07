import { findCityLabel } from './colombiaLocations'

describe('findCityLabel', () => {
  it('returns the human-readable label for a known city value', () => {
    expect(findCityLabel('medellin')).toBe('Medellín')
  })

  it('finds cities across different departments', () => {
    expect(findCityLabel('cali')).toBe('Cali')
    expect(findCityLabel('bogota')).toBe('Bogotá')
  })

  it('falls back to the raw value when the city is unknown', () => {
    expect(findCityLabel('atlantis')).toBe('atlantis')
  })
})
