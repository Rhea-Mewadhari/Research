# Milestone

Task: task8
Target: backend

## Requirements addressed

- Req 1 — `favouriteController.add` must call `next(err)` for `ProductNotFoundError`: verified — catch branch checks `err instanceof ProductNotFoundError` and calls `next(err); return;` with no inline `res.status(404).json` in that branch; test "POST /api/favourites with a non-existent productId returns 404" passed; response shape is `{ error, code, requestId }` via errorHandler.
- Req 2 — `compareController.compare` must call `next(_err)` passing the caught error: verified — catch block is `catch (_err) { next(_err); }`, error is forwarded not swallowed; test "GET /api/products/compare with valid format but non-existent ids returns 400" passed.
- Req 3 — `rateLimiter` must pass a `RateLimitError` instance to `next`: verified — `import { RateLimitError } from '../errors/index.js'` added and call site changed to `next(new RateLimitError(retryAfter))`; health bypass intact; errorHandler sets `Retry-After` header only for `RateLimitError` instances.
- Req 4 — Fixes confined to the three listed files; `errorHandler.ts`, `errors/index.ts`, and service files unmodified: verified — file content inspection confirms read-only files are intact; only `favouriteController.ts`, `compareController.ts`, and `rateLimiter.ts` were changed.
- Req 5 — Full visible test suite passes without modifying any test file: verified — `pnpm test` exited 0; 2 test files, 22 tests, 0 failed.

## Files changed

- `src/benchmark-backend/src/controllers/favouriteController.ts`: replaced inline `res.status(404).json(...)` in `ProductNotFoundError` catch branch with `next(err); return;`
- `src/benchmark-backend/src/controllers/compareController.ts`: changed `next()` to `next(_err)` in the compare handler's catch block
- `src/benchmark-backend/src/middleware/rateLimiter.ts`: added `RateLimitError` import from `../errors/index.js`; changed `next(new Error('Rate limit exceeded'))` to `next(new RateLimitError(retryAfter))`

## Checks

- pnpm test: 22 passed, 0 failed
- pnpm run build: pass
