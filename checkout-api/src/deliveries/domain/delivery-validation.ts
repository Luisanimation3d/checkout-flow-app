const MIN_ADDRESS_LENGTH = 5;

export interface DeliveryInput {
  address: string;
  city: string;
  department: string;
}

// Nunca confiar en la validación del frontend: se revalida todo del lado del servidor.
export const validateDeliveryInput = (input: DeliveryInput): string | null => {
  if (input.address.trim().length < MIN_ADDRESS_LENGTH) {
    return `address must be at least ${MIN_ADDRESS_LENGTH} characters long`;
  }

  if (input.city.trim().length === 0) {
    return 'city is required';
  }

  if (input.department.trim().length === 0) {
    return 'department is required';
  }

  return null;
};
