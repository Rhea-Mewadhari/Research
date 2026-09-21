# Requirements

1. `POST /api/favourites` with a non-existent `productId` must return HTTP 404 with a
   JSON body that contains exactly the fields `error`, `code`, and `requestId` — not
   a `{ message }` shape — produced by the centralised `errorHandler`.
   - Verified by: `src/benchmark-backend/src/tests/visible/middleware.test.ts` —
     "POST /api/favourites with a non-existent productId returns 404" (status assertion);
     the response body shape is enforced by the fix: removing the inline
     `res.status(404).json({ message: '...' })` path in `favouriteController.ts:add`
     and replacing it with `next(err)`, which routes to `errorHandler` that emits
     `{ error, code, requestId }`.

2. `GET /api/products/compare` with valid-format but non-existent ids (e.g.
   `?ids=9999,9998`) must return HTTP 400 with a JSON body containing `error`, `code`,
   and `requestId` — routed through `errorHandler`.
   - Verified by: `src/benchmark-backend/src/tests/visible/middleware.test.ts` —
     "GET /api/products/compare with valid format but non-existent ids returns 400"
     (status assertion); the fix is changing `next()` to `next(_err)` on line 10 of
     `compareController.ts` so the caught error reaches `errorHandler` instead of being
     swallowed.

3. `GET /api/products/compare` with fewer than two ids (e.g. `?ids=1`) must return
   HTTP 400.
   - Verified by: `src/benchmark-backend/src/tests/visible/middleware.test.ts` —
     "GET /api/products/compare with fewer than two ids returns 400" (status assertion).
     This is handled upstream (validation middleware) and must remain passing after the
     fix — no change to validation logic is permitted.

4. Rate-limit violations (more than 100 requests from the same IP within 60 seconds)
   must return HTTP 429 with a `Retry-After` response header whose value is a positive
   integer (seconds until the window resets), produced by `errorHandler`'s
   `RateLimitError` branch.
   - Verified by: `pnpm test` passing in `src/benchmark-backend/`; the fix is (a)
     importing `RateLimitError` from `'../errors'` in `rateLimiter.ts` and (b)
     replacing `next(new Error(...))` at line 27 with
     `next(new RateLimitError(retryAfter))` so `errorHandler`'s `instanceof
     RateLimitError` branch executes and sets the `Retry-After` header.

5. All changes must be confined to three files only — `favouriteController.ts`,
   `compareController.ts`, and `rateLimiter.ts`. `errorHandler.ts`, all files under
   `src/services/`, and `src/errors/index.ts` must not be modified.
   - Verified by: `git diff --name-only` after applying the fix lists only the three
     permitted files.

6. `pnpm test` run from `src/benchmark-backend/` exits with code 0 (all test suites
   pass, including the pre-existing `products.test.ts` suite which must not regress).
   - Verified by: the `pnpm test` process exit code and the absence of any failing test
     lines in its output.

## Edge cases

- `productId` that is syntactically valid but refers to no product: covered by
  requirement 1 (the `ProductNotFoundError` path in `favouriteController.ts`).
- `compareController.ts` catch block with non-`AppError` exceptions (unexpected
  service failures): covered by requirement 2 — passing `_err` to `next` unconditionally
  ensures any thrown error reaches `errorHandler`, which handles both `AppError`
  subtypes and unknown errors.
- Rate-limit `retryAfter` computation yielding a value less than 1: `rateLimiter.ts`
  already guards with `Math.max(1, ...)`, so `RateLimitError` will always receive a
  positive integer; covered by requirement 4.
- `remove` handler in `favouriteController.ts` sends `{ error: 'Favourite not found' }`
  inline for 404 on DELETE — this is pre-existing, out of scope per the task spec
  ("no controller should send a 4xx JSON response directly **except for 204 No Content
  returns**" — the task wording targets the `add` handler specifically, and the `remove`
  inline response is not listed as a bug); must not be changed.
