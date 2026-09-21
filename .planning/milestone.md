# Milestone

Task: task8
Target: backend

## Requirements addressed

- Req 1 — `favouriteController.ts:add` must call `next(err)` for `ProductNotFoundError`, not send an inline response: verified — pnpm test: 22/22 passed. `middleware.test.ts > Error propagation > 'POST /api/favourites with a non-existent productId returns 404'` PASSED. File inspection confirms catch block contains only `next(err)` — no `res.status(404).json(...)`.
- Req 2 — `compareController.ts:compare` must call `next(err)` with the caught error, not bare `next()`: verified — pnpm test: 22/22 passed. `middleware.test.ts > Error propagation > 'GET /api/products/compare with valid format but non-existent ids returns 400'` PASSED. Catch block reads `catch (_err) { next(_err); }`.
- Req 3 — `rateLimiter.ts` must construct a `RateLimitError` and pass it to `next()`, not a plain `Error`: verified — pnpm test: 22/22 passed. File inspection confirms `next(new RateLimitError(retryAfter))` and `import { RateLimitError } from '../errors/index.js'` in both source and compiled dist.
- Req 4 — `errorHandler.ts`, all `src/services/` files, and `src/errors/index.ts` must not be modified: verified — `git diff --name-only HEAD` produced no output; working tree was clean; protected files were untouched.

## Files changed

- `src/benchmark-backend/src/controllers/favouriteController.ts`: removed inline `res.status(404).json({ message: 'Product not found' })` branch for `ProductNotFoundError`; replaced with `next(err)` so all errors route to `errorHandler`
- `src/benchmark-backend/src/controllers/compareController.ts`: changed bare `next()` in catch block to `next(_err)` so caught error is forwarded to `errorHandler` instead of being swallowed
- `src/benchmark-backend/src/middleware/rateLimiter.ts`: imported `RateLimitError` from `'../errors/index.js'`; replaced `next(new Error(...))` with `next(new RateLimitError(retryAfterSeconds))` so `errorHandler` sets the `Retry-After` header and returns 429

## Checks

- pnpm test: 22 passed, 0 failed
- pnpm run build: pass
