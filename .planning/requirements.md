# Requirements

1. On every request from a given IP, timestamps older than `now - WINDOW_MS` (60 000 ms)
   must be removed from that IP's entry in the store before the count is checked or a new
   timestamp is added. After the full 60-second window has elapsed since the last recorded
   request, subsequent requests from the same IP must be allowed (not rate-limited).
   - Verified by: Code inspection of `src/benchmark-backend/src/middleware/rateLimiter.ts`
     confirms a filter step (e.g. `timestamps.filter(ts => ts >= now - WINDOW_MS)`) is
     applied to the retrieved array before the `>= MAX_REQUESTS` check. Running
     `pnpm test` inside `src/benchmark-backend` must exit with code 0.

2. When a 429 is returned, the `Retry-After` header must reflect the actual seconds
   remaining until the oldest in-window timestamp expires. Specifically, the value passed
   to `new RateLimitError(retryAfter)` must be computed as
   `Math.ceil((oldestInWindowTimestamp + WINDOW_MS - now) / 1000)`, where
   `oldestInWindowTimestamp` is the minimum value in the (already-pruned) timestamps array.
   The hardcoded literal `60` must not appear as the `retryAfter` argument.
   - Verified by: Code inspection of `src/benchmark-backend/src/middleware/rateLimiter.ts`
     confirms no hardcoded `60` is passed to `RateLimitError`; the value is derived from
     the oldest in-window timestamp. Running `pnpm test` inside `src/benchmark-backend`
     must exit with code 0 (the visible test asserts `retry-after` header is defined, which
     continues to pass).

3. `GET /health` must be exempt from rate limiting regardless of how many requests the
   same IP has previously made. The path comparison must use the string `'/health'`
   (with a leading slash) so that it matches `req.path` as set by Express.
   - Verified by: Code inspection of `src/benchmark-backend/src/middleware/rateLimiter.ts`
     confirms the exemption check reads `req.path === '/health'` (not `'health'`).
     Running `pnpm test` inside `src/benchmark-backend` must exit with code 0.

---

## Edge cases

- IP with no prior requests: `store.get(ip)` returns `undefined`; the middleware must
  treat this as an empty array and allow the request. Covered by requirement 1.
- All timestamps have expired: after pruning the array is empty, so the IP is below the
  limit and the request is allowed. Covered by requirement 1.
- `Retry-After` at the start of a window (oldest request ~0 s ago): computed value
  approaches 60 s. Covered by requirement 2.
- `Retry-After` near the end of a window (oldest request ~59 s ago): computed value
  approaches 1 s. Covered by requirement 2.
- `/health` with query parameters: Express sets `req.path` to the pathname without the
  query string, so `GET /health?foo=bar` still yields `req.path === '/health'`.
  Covered by requirement 3.
- Only `src/benchmark-backend/src/middleware/rateLimiter.ts` is modified; no test files
  or other source files are changed. Covered by all three requirements (each is a targeted
  single-line or minimal fix).
