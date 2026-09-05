export interface DocumentType {
  value: string
  label: string
}

// Mock temporal: este catálogo debería venir del backend.
export const DOCUMENT_TYPES: DocumentType[] = [
  { value: 'CC', label: 'CC' },
  { value: 'CE', label: 'CE' },
  { value: 'TI', label: 'TI' },
  { value: 'PA', label: 'PA' },
]
