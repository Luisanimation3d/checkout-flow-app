import { validateDeliveryInput } from './delivery-validation';
import type { DeliveryInput } from './delivery-validation';

const validInput: DeliveryInput = {
  address: 'Calle 123 #45-67',
  city: 'medellin',
  department: 'antioquia',
};

describe('validateDeliveryInput', () => {
  it('returns null for a fully valid input', () => {
    expect(validateDeliveryInput(validInput)).toBeNull();
  });

  it('rejects an address shorter than 5 characters', () => {
    const error = validateDeliveryInput({ ...validInput, address: 'Cl 1' });
    expect(error).toMatch(/address/);
  });

  it('rejects an address that is only whitespace', () => {
    const error = validateDeliveryInput({ ...validInput, address: '      ' });
    expect(error).toMatch(/address/);
  });

  it('rejects an empty city', () => {
    const error = validateDeliveryInput({ ...validInput, city: '' });
    expect(error).toMatch(/city/);
  });

  it('rejects an empty department', () => {
    const error = validateDeliveryInput({ ...validInput, department: '   ' });
    expect(error).toMatch(/department/);
  });
});
