import { Result } from './result';

describe('Result', () => {
  describe('ok', () => {
    it('creates a success result carrying the value', () => {
      const result = Result.ok(42);

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      if (result.isSuccess) {
        expect(result.value).toBe(42);
      }
    });
  });

  describe('fail', () => {
    it('creates a failure result carrying the error', () => {
      const error = new Error('boom');
      const result = Result.fail(error);

      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error).toBe(error);
      }
    });
  });

  it('narrows to .value only after checking isSuccess (compile-time + runtime)', () => {
    const result = Result.ok<string, Error>('hello');

    if (result.isSuccess) {
      // Si esto compila y pasa, el discriminated union está narrowing bien.
      expect(result.value.toUpperCase()).toBe('HELLO');
    } else {
      throw new Error('expected success');
    }
  });
});
