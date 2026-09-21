# Requirements

1. `favouriteController.ts` `add` handler must not send any direct HTTP response for `ProductNotFoundError`; it must call `next(err)` so the centralised `errorHandler` produces the response.
   - Verified by: `POST /api/favourites` with `productId: '99999'` returns HTTP 404 with a JSON body whose top-level keys are `error`, `code`, and `requestId` — not `message`. Confirmed by the visible test in `src/tests/visible/middleware.test.ts` ("POST /api/favourites with a non-existent productId returns 404") passing, combined with inspecting the response body shape (the inline handler emits `{ message }`, while `errorHandler` emits `{ error, code, requestId }`).

2. `compareController.ts` `compare` handler must call `next(_err)` (forwarding the caught error) instead of `next()` (no argument) so errors from `getComparison` reach `errorHandler`.
   - Verified by: `GET /api/products/compare?ids=9999,9998` returns HTTP 400. `getComparison` throws `ValidationError` (an `AppError` with `statusCode: 400`) when product IDs are not found; calling `next()` with no argument drops the error and the request falls through to the Express default 404 handler. The visible test "GET /api/products/compare with valid format but non-existent ids returns 400" in `src/tests/visible/middleware.test.ts` must pass.

3. `rateLimiter.ts` must pass `new RateLimitError(retryAfter)` to `next()` instead of `new Error(...)` so that `errorHandler` can match it by type, set `Retry-After`, and return 429.
   - Verified by: when the rate limit is exceeded, the response has HTTP status 429 and includes a `Retry-After` header with a positive integer value. `errorHandler` only sets this header when `err instanceof RateLimitError`; a plain `Error` falls through to the generic 500 branch. Confirmed by running `pnpm test` (all visible tests pass) and by source inspection that `rateLimiter.ts` imports `RateLimitError` from `../errors` and uses it in the `next()` call.

4. `errorHandler.ts`, all files under `src/services/`, and `src/errors/index.ts` must not be modified.
   - Verified by: `git diff -- src/middleware/errorHandler.ts src/services/ src/errors/index.ts` produces no output.

5. All visible tests pass.
   - Verified by: `pnpm test` run from `src/benchmark-backend/` exits with code 0 and reports no failing test cases in `src/tests/visible/middleware.test.ts` or `src/tests/visible/products.test.ts`.

## Edge cases

- `POST /api/favourites` with a non-existent `productId` must return `{ error, code, requestId }` — not `{ message }`: covered by requirement 1.
- `GET /api/products/compare?ids=9999,9998` (valid format, non-existent IDs) — `getComparison` throws `ValidationError` with `statusCode 400`; `next()` with no arg would drop this and yield a 404 from Express, not a 400: covered by requirement 2.
- `GET /api/products/compare?ids=1` (fewer than two IDs) returns 400 — this is caught upstream by request validation before the controller runs; the `next(_err)` fix in the controller must not break this existing path: covered by requirement 2 (the visible test for the single-id case must also pass).
- Rate-limit `retryAfter` computation: calculated as `Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000))` — `RateLimitError` stores this value and `errorHandler` forwards it verbatim as the `Retry-After` header: covered by requirement 3.
- Plain `Error` passed to `next()` in `rateLimiter.ts` currently results in a 500 instead of 429; after the fix only `RateLimitError` must be used for the rate-limit path: covered by requirement 3.
