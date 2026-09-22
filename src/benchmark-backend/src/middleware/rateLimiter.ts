import type { Request, Response, NextFunction } from 'express';
import { RateLimitError } from '../errors';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

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

  const timestamps = (store.get(ip) ?? []).filter(t => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - timestamps[0])) / 1000);
    next(new RateLimitError(retryAfter));
    return;
  }

  timestamps.push(now);
  store.set(ip, timestamps);
  next();
}
