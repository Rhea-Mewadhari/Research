# Requirements

1. `POST /api/favourites` with a non-existent `productId` must return HTTP 404 with a JSON body
   whose shape is exactly `{ error, code, requestId }` — produced by `errorHandler`, not inline.
   - Verified by: `middleware.test.ts` test "POST /api/favourites with a non-existent productId
     returns 404" passes (`expect(res.status).toBe(404)`); additionally, the response body must
     contain `error`, `code`, and `requestId` keys (errorHandler shape), not `message` (inline shape).

2. `favouriteController.add` must not contain a direct `res.status(404).json(...)` call inside the
   `ProductNotFoundError` catch branch — instead it must call `next(err)` with the caught error.
   - Verified by: Reading `src/benchmark-backend/src/controllers/favouriteController.ts` — the catch
     block for `ProductNotFoundError` contains `next(err)` and no `res.status(404)` call.

3. `GET /api/products/compare` with valid-format but non-existent ids (e.g. `?ids=9999,9998`) must
   return HTTP 400 with a JSON body whose shape is `{ error, code, requestId }`.
   - Verified by: `middleware.test.ts` test "GET /api/products/compare with valid format but
     non-existent ids returns 400" passes (`expect(res.status).toBe(400)`).

4. `compareController.compare` must pass the caught error to `next(err)` (not call `next()` with no
   argument) so the error reaches `errorHandler` rather than being swallowed.
   - Verified by: Reading `src/benchmark-backend/src/controllers/compareController.ts` — the catch
     block calls `next(_err)` (or `next(err)` after renaming), not bare `next()`.

5. When the rate limit is exceeded, the response must be HTTP 429 and include a `Retry-After` header
   set to the number of seconds until the client may retry.
   - Verified by: `rateLimiter.ts` calls `next(new RateLimitError(retryAfterSeconds))`, which causes
     `errorHandler` to execute `res.setHeader('Retry-After', String(err.retryAfterSeconds))` and
     `res.status(429)`. Confirmed by running `pnpm test` — all rate-limiter test cases pass.

6. `rateLimiter` must import and use `RateLimitError` (from `../errors`) instead of constructing a
   plain `new Error(...)` when the limit is exceeded.
   - Verified by: Reading `src/benchmark-backend/src/middleware/rateLimiter.ts` — `RateLimitError`
     is imported from `'../errors'` and `next(new RateLimitError(retryAfterSeconds))` is called;
     no bare `new Error(...)` is passed to `next` for the rate-limit case.

7. `pnpm test` must exit with code 0 (all visible tests pass) after the three fixes are applied.
   - Verified by: Running `pnpm test` inside `src/benchmark-backend/` and observing exit code 0
     with no failing test cases.

8. None of the following files may be modified: `src/middleware/errorHandler.ts`,
   `src/services/*.ts`, `src/errors/index.ts`.
   - Verified by: `git diff --name-only` shows no changes to those paths after the fix commits.

## Edge cases

- `remove` in `favouriteController.ts` also sends an inline 404 — this is intentional and out of
  scope for task8 (the task specifies only the `add` handler): covered implicitly by requirement 2
  (which scopes the fix to the `ProductNotFoundError` catch block inside `add`).
- `compareController.compare` currently renames the caught error as `_err` (TypeScript unused-var
  convention). The fix must ensure the variable is passed to `next` — either rename to `err` or
  pass `_err` directly: covered by requirement 4.
- `retryAfterSeconds` must be at least 1 (the existing `Math.max(1, ...)` clamp must be preserved
  when constructing `RateLimitError`): covered by requirement 5 (wrong value would cause
  `Retry-After: 0` which diverges from the test expectation).
- Rate-limit bypass for `/health` path must be preserved — `rateLimiter` already has this guard
  and the fix must not remove it: covered by requirement 7 (health-check tests must still pass).
