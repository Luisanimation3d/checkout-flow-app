import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const REDACTED_FIELDS = ['cardToken', 'password'];

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, originalUrl } = request;
    const startedAt = Date.now();

    this.logger.log(`--> ${method} ${originalUrl} ${this.safeBody(request.body)}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const elapsedMs = Date.now() - startedAt;
          this.logger.log(`<-- ${method} ${originalUrl} ${response.statusCode} (${elapsedMs}ms)`);
        },
        error: (err: unknown) => {
          const elapsedMs = Date.now() - startedAt;
          // Este handler corre ANTES que el exception filter de Nest escriba la
          // respuesta real, así que response.statusCode todavía no refleja el
          // status final — hay que derivarlo del propio error, no leerlo de ahí.
          const status = err instanceof HttpException ? err.getStatus() : 500;
          const message = err instanceof Error ? err.message : 'Unknown error';
          this.logger.warn(`<-- ${method} ${originalUrl} ${status} (${elapsedMs}ms) - ${message}`);
        },
      }),
    );
  }

  private safeBody(body: unknown): string {
    if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
      return '';
    }

    const redacted = JSON.parse(JSON.stringify(body)) as Record<string, unknown>;
    this.redactSensitiveFields(redacted);
    return JSON.stringify(redacted);
  }

  private redactSensitiveFields(value: Record<string, unknown>): void {
    for (const [key, nested] of Object.entries(value)) {
      if (REDACTED_FIELDS.includes(key)) {
        value[key] = '[REDACTED]';
      } else if (nested && typeof nested === 'object') {
        this.redactSensitiveFields(nested as Record<string, unknown>);
      }
    }
  }
}
