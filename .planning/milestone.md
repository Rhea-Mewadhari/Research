# Milestone

Task: task8
Target: backend

## Requirements addressed

- Req 1 — POST /api/favourites with non-existent productId returns 404 via errorHandler: verified — Test 'Error propagation > POST /api/favourites with a non-existent productId returns 404' PASSED (22/22 tests passed); favouriteController.ts:add now calls next(err) instead of inline res.status(404).json({ message: '...' }).
- Req 2 — GET /api/products/compare with valid-format but non-existent ids returns 400 via errorHandler: verified — Test 'Error propagation > GET /api/products/compare with valid format but non-existent ids returns 400' PASSED (22/22 tests passed); compareController.ts catch block changed from next() to next(_err).
- Req 3 — GET /api/products/compare with fewer than two ids returns 400: verified — Test 'Error propagation > GET /api/products/compare with fewer than two ids returns 400' PASSED; validation middleware left unchanged.
- Req 4 — Rate-limit violations return HTTP 429 with Retry-After header via errorHandler's RateLimitError branch: verified — pnpm test exited 0 (22/22 tests); rateLimiter.ts imports RateLimitError and calls next(new RateLimitError(retryAfter)).
- Req 5 — All changes confined to three permitted files only: verified — git diff confirms only favouriteController.ts, compareController.ts, and rateLimiter.ts were modified; errorHandler.ts, src/services/, and src/errors/index.ts untouched.
- Req 6 — pnpm test exits with code 0: verified — 'Test Files 2 passed (2), Tests 22 passed (22)'; both middleware.test.ts and products.test.ts passed.

## Files changed

- src/benchmark-backend/src/controllers/favouriteController.ts: Replaced inline `res.status(404).json({ message: 'Product not found' })` with `next(err)` in the ProductNotFoundError catch block of the `add` handler.
- src/benchmark-backend/src/controllers/compareController.ts: Changed `next()` to `next(_err)` in the compare function's catch block so the error is forwarded to errorHandler instead of being swallowed.
- src/benchmark-backend/src/middleware/rateLimiter.ts: Added `import { RateLimitError } from '../errors'` and replaced `next(new Error(...))` with `next(new RateLimitError(retryAfter))` so errorHandler's instanceof RateLimitError branch executes and sets the Retry-After header.

## Checks

- pnpm test: 22 passed, 0 failed (Test Files 2 passed (2))
- pnpm run build: pass
