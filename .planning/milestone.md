# Milestone

Task: task8
Target: backend

## Requirements addressed

- Requirement 1 — `favouriteController.ts` add handler must not send any direct HTTP response for `ProductNotFoundError`; it must call `next(err)` so the centralised `errorHandler` produces the response: verified — catch block is `catch (err) { next(err); }` with no inline `res.status`/`res.json`; visible test "POST /api/favourites with a non-existent productId returns 404" passed (22/22 tests).
- Requirement 2 — `compareController.ts` compare handler must call `next(err)` (forwarding the caught error) instead of `next()` (no argument) so errors from `getComparison` reach `errorHandler`: verified — catch block renamed variable from `_err` to `err` and calls `next(err)`; visible test "GET /api/products/compare with valid format but non-existent ids returns 400" passed.
- Requirement 3 — `rateLimiter.ts` must pass `new RateLimitError(retryAfter)` to `next()` instead of `new Error(...)` so that `errorHandler` can match it by type, set `Retry-After`, and return 429: verified — `import { RateLimitError } from '../errors';` added and `next(new RateLimitError(retryAfter));` used; all 22 tests passed.
- Requirement 4 — `errorHandler.ts`, all files under `src/services/`, and `src/errors/index.ts` must not be modified: verified — `git diff -- src/middleware/errorHandler.ts src/services/ src/errors/index.ts` produced no output.
- Requirement 5 — All visible tests pass: verified — `pnpm test` exited with code 0; Test Files 2 passed (2), Tests 22 passed (22).

## Files changed

- `src/benchmark-backend/src/controllers/favouriteController.ts`: Removed inline `ProductNotFoundError` catch branch that called `res.status(404).json({ message: 'Product not found' })`; replaced with a single `catch (err) { next(err); }` forwarding all errors to `errorHandler`.
- `src/benchmark-backend/src/controllers/compareController.ts`: Renamed catch variable from `_err` to `err` and changed `next()` to `next(err)` so `ValidationError` and other errors from `getComparison` reach `errorHandler`.
- `src/benchmark-backend/src/middleware/rateLimiter.ts`: Added `import { RateLimitError } from '../errors';` and replaced `next(new Error(...))` with `next(new RateLimitError(retryAfter))` so the error handler can set the `Retry-After` header and return 429.

## Checks

- pnpm test: 22 passed, 0 failed (Test Files 2 passed)
- pnpm run build: pass
