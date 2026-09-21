import type { Request, Response, NextFunction } from 'express';
import { RateLimitError } from '../errors';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 100;

const store = new Map<string, number[]>();

function getIp(req: Request): string {
  return req.ip ?? req.socket.remoteAddress ?? 'unknown';
}

export function rateLimiter(req: Request, _res: Response, next: NextFunction): void {
  if (req.path === '/health') {
    next();
    return;
  }

  const ip = getIp(req);
  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  const timestamps = (store.get(ip) ?? []).filter((t) => t > cutoff);

  if (timestamps.length >= MAX_REQUESTS) {
    const oldest = timestamps[0];
    const retryAfter = Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000));
    next(new RateLimitError(retryAfter));
    return;
  }

  timestamps.push(now);
  store.set(ip, timestamps);
  next();
}
