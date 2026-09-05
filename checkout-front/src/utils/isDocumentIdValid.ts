const DOCUMENT_ID_PATTERN = /^\d{6,10}$/

export const isDocumentIdValid = (documentId: string) => DOCUMENT_ID_PATTERN.test(documentId)
