# Requirements

1. On every request for a given IP, the per-IP timestamp array must be filtered to remove
   entries older than 60 seconds (i.e. `timestamp < now - WINDOW_MS`) before the count is
   compared against `MAX_REQUESTS`. The pruning must occur inline on each request, not via
   a background interval.
   - Verified by: Code inspection of `src/benchmark-backend/src/middleware/rateLimiter.ts` —
     the array stored in `store` is derived from `filter(ts => now - ts < WINDOW_MS)` (or
     equivalent) and that filtered array (not the raw one) is used for the `>= MAX_REQUESTS`
     check and the `store.set` call. `pnpm test` passes.

2. When a 429 response is returned, the `Retry-After` response header must equal the
   computed number of whole seconds until the oldest in-window timestamp will fall outside
   the 60-second window, rounded up. Specifically: `Math.ceil((oldestTimestamp + WINDOW_MS
   - now) / 1000)` where `oldestTimestamp` is the earliest timestamp in the (already-pruned)
   in-window array. The value must not be hardcoded.
   - Verified by: Code inspection of `src/benchmark-backend/src/middleware/rateLimiter.ts` —
     no literal `60` is used as the `retryAfterSeconds` argument to `new RateLimitError(...)`;
     the value is instead derived from the oldest remaining timestamp and `WINDOW_MS`.
     `pnpm test` passes (the visible test asserts `retry-after` header is defined).

3. A `GET /health` request must bypass the rate-limit check entirely and call `next()`
   without incrementing the IP's request count, regardless of how many prior requests that
   IP has made. The exemption check must compare `req.path` against `'/health'` (with
   leading slash).
   - Verified by: Code inspection of `src/benchmark-backend/src/middleware/rateLimiter.ts` —
     the string literal in the exemption check is `'/health'` (not `'health'`). `pnpm test`
     passes.

4. Only `src/benchmark-backend/src/middleware/rateLimiter.ts` is modified. No other source
   file (error handler, error classes, route files) is changed.
   - Verified by: `git diff --name-only` lists exactly one file:
     `src/benchmark-backend/src/middleware/rateLimiter.ts`.

5. All visible tests pass without modification.
   - Verified by: `pnpm test` exits with code 0 from within
     `src/benchmark-backend/`.

## Edge cases

- IP with exactly 10 in-window requests (at the limit): the 11th request triggers the 429.
  After those timestamps age past 60 s, a subsequent request from the same IP receives a
  non-429 response. Covered by requirement 1.
- `Retry-After` varies based on when in the window the 11th request arrives (a request
  arriving 1 s after the first in-window request returns ~59 s; one arriving 59 s after
  returns ~1 s). Covered by requirement 2.
- `GET /health` when the IP is already over the 10-request limit must still return 200, not
  429. Covered by requirement 3.
- Paths like `/healthcheck`, `/health/status`, or `health` (no slash) must NOT be exempted
  — only exact `'/health'` match. Covered by requirement 3.
