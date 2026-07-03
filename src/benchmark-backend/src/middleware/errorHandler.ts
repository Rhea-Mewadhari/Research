import type { Request, Response, NextFunction } from 'express';
import { AppError, RateLimitError } from '../errors';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.id ?? 'no-id';
  console.error(`[${requestId}]`, err);

  if (err instanceof RateLimitError) {
    res.setHeader('Retry-After', String(err.retryAfterSeconds));
    res.status(err.statusCode).json({ error: err.message, code: err.code, requestId });
    return;
  }

  if (err instanceof AppError) {
    const isServerError = err.statusCode >= 500;
    const message =
      isServerError && process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;
    res.status(err.statusCode).json({ error: message, code: err.code, requestId });
    return;
  }

  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err instanceof Error
        ? err.message
        : 'Unknown error';
  res.status(500).json({ error: message, requestId });
}
