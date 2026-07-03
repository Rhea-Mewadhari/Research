import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../benchmark-backend');

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

// Three bugs in rateLimiter.ts:
//   Bug 1: timestamps never pruned — the array for each IP grows indefinitely.
//          Old entries outside the 60-second window are never removed, so under
//          sustained traffic the Map values grow without bound.  In tests this
//          also means the rate limit never resets after the window expires.
//   Bug 2: Retry-After is hardcoded to 60 instead of being computed as the actual
//          seconds until the oldest in-window request will expire.
//   Bug 3: the /health exemption path check uses 'health' (missing leading slash)
//          so req.path === 'health' is never true and /health is always rate-limited.
//
// MAX_REQUESTS is lowered to 10 to make visible-test scenarios practical.
// The correctness bugs are the three items above, not the limit value itself.
write(
  path.join(repoRoot, 'src', 'middleware', 'rateLimiter.ts'),
  `import type { Request, Response, NextFunction } from 'express';
import { RateLimitError } from '../errors';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

const store = new Map<string, number[]>();

function getIp(req: Request): string {
  return req.ip ?? req.socket.remoteAddress ?? 'unknown';
}

export function rateLimiter(req: Request, _res: Response, next: NextFunction): void {
  if (req.path === 'health') {  // Bug 3: missing leading slash — never matches '/health'
    next();
    return;
  }

  const ip = getIp(req);
  const now = Date.now();

  // Bug 1: no pruning — expired timestamps accumulate in the array indefinitely
  const timestamps = store.get(ip) ?? [];

  if (timestamps.length >= MAX_REQUESTS) {
    const retryAfter = 60;  // Bug 2: hardcoded — ignores how much window actually remains
    next(new RateLimitError(retryAfter));
    return;
  }

  timestamps.push(now);
  store.set(ip, timestamps);
  next();
}
`
);

console.log('Rate limiter bugs injected successfully.');
