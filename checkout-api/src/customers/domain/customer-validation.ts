import type { DocumentType } from './customer';

const DOCUMENT_TYPES: readonly DocumentType[] = ['CC', 'CE', 'TI', 'PA'];
const DOCUMENT_ID_PATTERN = /^\d{6,10}$/;
const PHONE_PATTERN = /^\d{10}$/;
const FULL_NAME_PATTERN = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]{3,}$/;

export interface CustomerInput {
  fullName: string;
  documentType: string;
  documentId: string;
  phone: string;
}

// Nunca confiar en la validación del frontend: se revalida todo del lado del servidor.
export const validateCustomerInput = (input: CustomerInput): string | null => {
  if (!FULL_NAME_PATTERN.test(input.fullName.trim())) {
    return 'fullName must contain only letters and be at least 3 characters long';
  }

  if (!DOCUMENT_TYPES.includes(input.documentType as DocumentType)) {
    return `documentType must be one of: ${DOCUMENT_TYPES.join(', ')}`;
  }

  if (!DOCUMENT_ID_PATTERN.test(input.documentId)) {
    return 'documentId must contain 6 to 10 digits';
  }

  if (!PHONE_PATTERN.test(input.phone)) {
    return 'phone must contain exactly 10 digits';
  }

  return null;
};
