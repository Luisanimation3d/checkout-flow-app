export type DocumentType = 'CC' | 'CE' | 'TI' | 'PA';

export interface Customer {
  id: string;
  fullName: string;
  documentType: DocumentType;
  documentId: string;
  phone: string;
  email: string;
}
