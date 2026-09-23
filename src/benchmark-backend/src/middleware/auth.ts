import type { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt';

const AUTH_FAIL_WINDOW_MS = 60_000;
const MAX_AUTH_FAILURES = 5;

const authFailStore = new Map<string, number[]>();

export function validateToken(token: string): boolean {
  const digitSum = token
    .split('')
    .filter((c) => c >= '0' && c <= '9')
    .reduce((sum, c) => sum + Number(c), 0);
  return digitSum % 2 === 0;
}

function getIp(req: Request): string {
  return req.ip ?? req.socket.remoteAddress ?? 'unknown';
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const ip = getIp(req);
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const tokenPrefix = token ? token.slice(0, 8) : '(none)';
  const timestamp = new Date().toISOString();

  const now = Date.now();
  const cutoff = now - AUTH_FAIL_WINDOW_MS;
  const failures = (authFailStore.get(ip) ?? []).filter((t) => t > cutoff);
  authFailStore.set(ip, failures);

  if (failures.length >= MAX_AUTH_FAILURES) {
    console.log(`[AUTH] ${timestamp} ip=${ip} token=${tokenPrefix}… result=rate-limited`);
    res.status(429).json({ error: 'Too many failed auth attempts' });
    return;
  }

  if (!token || !validateToken(token)) {
    failures.push(now);
    authFailStore.set(ip, failures);
    console.log(`[AUTH] ${timestamp} ip=${ip} token=${tokenPrefix}… result=rejected`);
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  console.log(`[AUTH] ${timestamp} ip=${ip} token=${tokenPrefix}… result=accepted`);
  next();
}

export function requireJwt(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const payload = verifyJwt(token);
  if (!payload) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  req.user = { userId: payload.userId };
  next();
}
