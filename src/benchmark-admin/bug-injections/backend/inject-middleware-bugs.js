import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../benchmark-backend');

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

// Bug 1: favouriteController.add catches ProductNotFoundError inline and sends
// res.status(404).json({ message: ... }) instead of delegating to next(err).
// The error handler is bypassed; the response shape is { message } not { error, code, requestId }.
write(
  path.join(repoRoot, 'src', 'controllers', 'favouriteController.ts'),
  `import type { Request, Response, NextFunction } from 'express';
import {
  addFavourite,
  removeFavourite,
  getFavourites,
} from '../services/favouritesService';
import { ProductNotFoundError } from '../errors';

export const list = (_req: Request, res: Response): void => {
  const favourites = getFavourites();
  res.json({ favourites, count: favourites.length });
};

export const add = (req: Request, res: Response, next: NextFunction): void => {
  const productId = req.validated['productId'] as string;
  try {
    const { favourite, created } = addFavourite(productId);
    res.status(created ? 201 : 200).json(favourite);
  } catch (err) {
    if (err instanceof ProductNotFoundError) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    next(err);
  }
};

export const remove = (req: Request, res: Response): void => {
  const raw = req.params['productId'];
  const productId = typeof raw === 'string' ? raw : '';
  const removed = removeFavourite(productId);
  if (!removed) {
    res.status(404).json({ error: 'Favourite not found' });
    return;
  }
  res.status(204).send();
};
`
);

// Bug 2: compareController.compare catches service errors but calls next() without
// the error argument. The error is swallowed; Express falls through to the 404 handler
// instead of the error handler, so the response is 404 Not Found instead of 400.
write(
  path.join(repoRoot, 'src', 'controllers', 'compareController.ts'),
  `import type { Request, Response, NextFunction } from 'express';
import { getComparison } from '../services/compareService';

export const compare = (req: Request, res: Response, next: NextFunction): void => {
  const ids = req.validated['ids'] as string[];
  try {
    const result = getComparison(ids);
    res.json(result);
  } catch (_err) {
    next();
  }
};
`
);

// Bug 3: rateLimiter passes a plain Error to next(err) instead of a RateLimitError.
// The error handler does not recognise it as an AppError and falls through to the
// generic 500 handler, returning 500 with no Retry-After header instead of 429.
write(
  path.join(repoRoot, 'src', 'middleware', 'rateLimiter.ts'),
  `import type { Request, Response, NextFunction } from 'express';

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
    next(new Error(\`Rate limit exceeded, retry after \${retryAfter}s\`));
    return;
  }

  timestamps.push(now);
  store.set(ip, timestamps);
  next();
}
`
);

console.log('Middleware bugs injected successfully.');
