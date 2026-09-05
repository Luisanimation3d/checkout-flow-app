// Mock temporal: el número de transacción real debería asignarlo el backend al crear el registro PENDING.
export const generateTransactionId = () => `TXN-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
