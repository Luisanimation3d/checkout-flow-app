export interface LocationOption {
  value: string
  label: string
}

export interface DepartmentOption extends LocationOption {
  cities: LocationOption[]
}

// Mock temporal: este catálogo debería venir de un endpoint del backend
// (ej. GET /departments y GET /departments/:id/cities).
export const COLOMBIA_DEPARTMENTS: DepartmentOption[] = [
  {
    value: 'antioquia',
    label: 'Antioquia',
    cities: [
      { value: 'medellin', label: 'Medellín' },
      { value: 'envigado', label: 'Envigado' },
      { value: 'itagui', label: 'Itagüí' },
    ],
  },
  {
    value: 'cundinamarca',
    label: 'Cundinamarca',
    cities: [
      { value: 'bogota', label: 'Bogotá' },
      { value: 'soacha', label: 'Soacha' },
      { value: 'chia', label: 'Chía' },
    ],
  },
  {
    value: 'valle-del-cauca',
    label: 'Valle del Cauca',
    cities: [
      { value: 'cali', label: 'Cali' },
      { value: 'palmira', label: 'Palmira' },
      { value: 'buenaventura', label: 'Buenaventura' },
    ],
  },
  {
    value: 'atlantico',
    label: 'Atlántico',
    cities: [
      { value: 'barranquilla', label: 'Barranquilla' },
      { value: 'soledad', label: 'Soledad' },
    ],
  },
  {
    value: 'santander',
    label: 'Santander',
    cities: [
      { value: 'bucaramanga', label: 'Bucaramanga' },
      { value: 'floridablanca', label: 'Floridablanca' },
    ],
  },
]

export const findCityLabel = (cityValue: string) => {
  for (const department of COLOMBIA_DEPARTMENTS) {
    const city = department.cities.find((option) => option.value === cityValue)
    if (city) return city.label
  }
  return cityValue
}
