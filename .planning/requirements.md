# Requirements

1. `favouriteController.add` must call `next(err)` when a `ProductNotFoundError` is caught — it must not send any inline response for that error type.
   - Verified by: `src/tests/visible/middleware.test.ts` — "POST /api/favourites with a non-existent productId returns 404" passes (`pnpm test`). Additionally, the response body must contain `{ error, code, requestId }` (not `{ message }`) — verifiable by inspecting that `favouriteController.ts` no longer contains `res.status(404).json` inside the `ProductNotFoundError` catch branch, and that branch instead calls `next(err)`.

2. `compareController.compare` must call `next(_err)` (passing the caught error) instead of `next()` — the caught error must not be silently swallowed.
   - Verified by: `src/tests/visible/middleware.test.ts` — "GET /api/products/compare with valid format but non-existent ids returns 400" passes (`pnpm test`). The test sends `GET /api/products/compare?ids=9999,9998` and asserts `res.status === 400`.

3. `rateLimiter` must construct and pass a `RateLimitError` instance to `next` when the rate limit is exceeded — not a plain `Error`.
   - Verified by: Code inspection confirms `rateLimiter.ts` imports `RateLimitError` from `../errors` and the call site is `next(new RateLimitError(retryAfter))`. Functional verification: when the limit is exceeded the response has HTTP status 429 and a `Retry-After` header whose value is a positive integer (the `errorHandler` only sets this header when it receives a `RateLimitError`).

4. All three fixes must be confined to the three listed files; `errorHandler.ts`, `errors/index.ts`, and all service files must remain unmodified.
   - Verified by: `git diff --name-only` after the fix shows changes only in `src/controllers/favouriteController.ts`, `src/controllers/compareController.ts`, and `src/middleware/rateLimiter.ts`.

5. The full visible test suite must pass without modification to any test file.
   - Verified by: `pnpm test` exits with code 0 inside `src/benchmark-backend`.

## Edge cases

- `favouriteController.add` — non-`ProductNotFoundError` exceptions (e.g. `DatabaseError`): still forwarded via `next(err)` as before; covered by requirement 1 (the existing `next(err)` in the outer `else` path must be preserved).
- `compareController.compare` — `_err` variable name: the TypeScript rename prefix must be kept (`_err`) but the value must be passed to `next`; covered by requirement 2.
- `rateLimiter` — `retryAfter` computation: the arithmetic is unchanged; only the error constructor changes; covered by requirement 3.
- `rateLimiter` — `/health` bypass path: must remain unaffected; covered by requirements 3 and 5 (the health-check test in `products.test.ts` must still pass).
