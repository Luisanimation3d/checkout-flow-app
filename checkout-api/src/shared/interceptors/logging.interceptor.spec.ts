import { BadRequestException, Logger } from '@nestjs/common';
import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

const makeContext = (body: unknown, statusCode = 200): ExecutionContext => {
  const request = { method: 'POST', originalUrl: '/transactions', body };
  const response = { statusCode };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ExecutionContext;
};

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs the incoming request and the successful response with its real status', (done) => {
    const context = makeContext({ foo: 'bar' }, 201);
    const handler: CallHandler = { handle: () => of({ ok: true }) };

    interceptor.intercept(context, handler).subscribe(() => {
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('--> POST /transactions'));
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('<-- POST /transactions 201'));
      done();
    });
  });

  it('redacts cardToken in the logged request body', () => {
    const context = makeContext({ cardToken: 'secret', other: 'value' });
    const handler: CallHandler = { handle: () => of(null) };

    interceptor.intercept(context, handler).subscribe();

    const requestLog = logSpy.mock.calls.find((call) => String(call[0]).includes('-->'));
    expect(requestLog?.[0]).toContain('[REDACTED]');
    expect(requestLog?.[0]).not.toContain('secret');
  });

  it('redacts cardToken nested inside another object', () => {
    const context = makeContext({ payment: { cardToken: 'secret' } });
    const handler: CallHandler = { handle: () => of(null) };

    interceptor.intercept(context, handler).subscribe();

    const requestLog = logSpy.mock.calls.find((call) => String(call[0]).includes('-->'));
    expect(requestLog?.[0]).not.toContain('secret');
  });

  it('logs an empty body as an empty string, not "{}"', () => {
    const context = makeContext({});
    const handler: CallHandler = { handle: () => of(null) };

    interceptor.intercept(context, handler).subscribe();

    const requestLog = logSpy.mock.calls.find((call) => String(call[0]).includes('-->'));
    expect(requestLog?.[0]).toBe('--> POST /transactions ');
  });

  it('derives the logged status from an HttpException, not from response.statusCode', (done) => {
    // response.statusCode sigue en 201 (valor previo al error real) a propósito:
    // el interceptor NO debe confiar en él para el path de error.
    const context = makeContext(undefined, 201);
    const handler: CallHandler = {
      handle: () => throwError(() => new BadRequestException('bad input')),
    };

    interceptor.intercept(context, handler).subscribe({
      error: () => {
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('400'));
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('bad input'));
        done();
      },
    });
  });

  it('defaults to 500 for a plain (non-HttpException) error', (done) => {
    const context = makeContext(undefined);
    const handler: CallHandler = { handle: () => throwError(() => new Error('boom')) };

    interceptor.intercept(context, handler).subscribe({
      error: () => {
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('500'));
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('boom'));
        done();
      },
    });
  });
});
