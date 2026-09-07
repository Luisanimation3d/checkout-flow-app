import { validateCustomerInput } from './customer-validation';
import type { CustomerInput } from './customer-validation';

const validInput: CustomerInput = {
  fullName: 'John Doe',
  documentType: 'CC',
  documentId: '1000099928',
  phone: '3001234567',
  email: 'john@example.com',
};

describe('validateCustomerInput', () => {
  it('returns null for a fully valid input', () => {
    expect(validateCustomerInput(validInput)).toBeNull();
  });

  it('rejects a full name shorter than 3 characters', () => {
    const error = validateCustomerInput({ ...validInput, fullName: 'Jo' });
    expect(error).toMatch(/fullName/);
  });

  it('rejects a full name containing digits', () => {
    const error = validateCustomerInput({ ...validInput, fullName: 'John3' });
    expect(error).toMatch(/fullName/);
  });

  it('rejects a documentType outside the allowed list', () => {
    const error = validateCustomerInput({ ...validInput, documentType: 'XX' });
    expect(error).toMatch(/documentType/);
  });

  it('rejects a documentId shorter than 6 digits', () => {
    const error = validateCustomerInput({ ...validInput, documentId: '123' });
    expect(error).toMatch(/documentId/);
  });

  it('rejects a documentId longer than 10 digits', () => {
    const error = validateCustomerInput({ ...validInput, documentId: '12345678901' });
    expect(error).toMatch(/documentId/);
  });

  it('rejects a phone that is not exactly 10 digits', () => {
    const error = validateCustomerInput({ ...validInput, phone: '300123' });
    expect(error).toMatch(/phone/);
  });

  it('rejects an invalid email', () => {
    const error = validateCustomerInput({ ...validInput, email: 'not-an-email' });
    expect(error).toMatch(/email/);
  });

  it('checks fields in order and reports the first failure', () => {
    const error = validateCustomerInput({
      ...validInput,
      fullName: '',
      email: 'also-invalid',
    });
    expect(error).toMatch(/fullName/);
  });
});
