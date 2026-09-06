interface Success<T> {
  readonly isSuccess: true;
  readonly isFailure: false;
  readonly value: T;
}

interface Failure<E> {
  readonly isSuccess: false;
  readonly isFailure: true;
  readonly error: E;
}

export type Result<T, E = Error> = Success<T> | Failure<E>;

export const Result = {
  ok<T, E = Error>(value: T): Result<T, E> {
    return { isSuccess: true, isFailure: false, value };
  },

  fail<T, E = Error>(error: E): Result<T, E> {
    return { isSuccess: false, isFailure: true, error };
  },
};
