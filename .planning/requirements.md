# Requirements

1. `favouriteController.ts:add` must call `next(err)` for `ProductNotFoundError` — not send an inline response.
   - `POST /api/favourites` with a `productId` that does not exist in the product catalogue returns HTTP 404 with a JSON body containing exactly the fields `error`, `code`, and `requestId` (produced by `errorHandler`).
   - The body must NOT contain a `message` field (which is what the current inline response returns).
   - Verified by: `pnpm test` passes (all visible tests in `src/benchmark-backend/dist/tests/visible/` pass); additionally, after the fix, `res.status(404).json(...)` is no longer present in `favouriteController.ts` for the `add` handler — only `next(err)` is called in the catch branch for `ProductNotFoundError`.

2. `compareController.ts:compare` must call `next(err)` (with the caught error) — not `next()` with no argument.
   - When `getComparison(ids)` throws (e.g. a `ProductNotFoundError` or `ValidationError` for non-existent IDs), the error reaches `errorHandler` and the response has the correct status code and JSON body `{ error, code, requestId }`.
   - The request must NOT silently fall through to the 404 handler.
   - Verified by: `pnpm test` passes; additionally, after the fix, the catch block in `compareController.ts` reads `next(_err)` (or `next(err)`) — never a bare `next()`.

3. `rateLimiter.ts` must construct a `RateLimitError` instance and pass it to `next()` — not a plain `Error`.
   - When a client's request count within the 60-second window reaches or exceeds 100, the response is HTTP 429 with a `Retry-After` header whose value is a positive integer (seconds) and a JSON body `{ error, code, requestId }`.
   - Verified by: `pnpm test` passes — specifically `rateLimiter.test.js` asserts `res.status === 429` and `res.headers['retry-after']` is defined; this test currently fails and must pass after the fix.

4. `errorHandler.ts`, all files under `src/services/`, and `src/errors/index.ts` must not be modified.
   - Verified by: `git diff --name-only` (or equivalent) shows no changes to those paths after all fixes are applied.

## Edge cases

- `productId` is a syntactically valid string but refers to a product that does not exist: covered by requirement 1 (the `addFavourite` service throws `ProductNotFoundError`, which must now reach `errorHandler`).
- `ids` query param has the right count but references non-existent products: covered by requirement 2 (service throws, error must reach `errorHandler` rather than being swallowed).
- Rate-limit window boundary (exactly 100 requests allowed, request 101 is rejected): covered by requirement 3 (`MAX_REQUESTS = 100`, so the 101st request triggers the `>= MAX_REQUESTS` branch and must return 429 with `Retry-After`).
- `/health` endpoint is exempt from rate limiting: not a changed behaviour — the existing `if (req.path === '/health') { next(); return; }` guard is preserved; the fix only changes the error constructed in the rate-limit branch.
- `retryAfterSeconds` value in `RateLimitError` must be `>= 1`: covered by requirement 3 — `rateLimiter.ts` already computes `Math.max(1, Math.ceil(...))` before constructing the error; the `RateLimitError` constructor stores this value and `errorHandler` writes it to `Retry-After`.
