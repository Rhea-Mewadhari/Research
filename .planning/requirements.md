# Requirements

1. On every request for a given IP, timestamps older than 60,000 ms must be removed
   from the in-memory store before the request count is evaluated or a new timestamp
   is appended. Specifically, any entry where `now - timestamp >= WINDOW_MS` must be
   filtered out, so the rate-limit counter reflects only the current 60-second window.
   - Verified by: Code inspection of `src/benchmark-backend/src/middleware/rateLimiter.ts`
     confirms a filter step that discards stale timestamps before the `timestamps.length >= MAX_REQUESTS`
     check. `pnpm test` (run from `src/benchmark-backend/`) exits 0, including hidden tests
     that advance `Date.now` past 60 s and assert subsequent requests from the same IP return
     a non-429 status.

2. When the rate limit is exceeded, the `Retry-After` response header must carry a
   computed integer: the ceiling of `(oldestTimestamp + WINDOW_MS - now) / 1000`, where
   `oldestTimestamp` is the earliest entry in the already-pruned in-window array. The
   literal value `60` must not appear as the argument passed to `RateLimitError`.
   - Verified by: Code inspection of `rateLimiter.ts` confirms the `retryAfter` variable
     is derived from the oldest in-window timestamp rather than a hardcoded constant.
     `pnpm test` exits 0, including any hidden tests that check the header differs
     between a limit hit near the start of the window versus near the end.

3. When `req.path` equals `'/health'` (with leading slash), the middleware must call
   `next()` immediately and skip all rate-limit logic. The string literal used in the
   comparison must be `'/health'`, not `'health'`.
   - Verified by: Code inspection of `rateLimiter.ts` confirms the guard is
     `req.path === '/health'`. `pnpm test` exits 0, including any hidden tests that exhaust
     the rate limit against another endpoint and then assert `GET /health` returns HTTP 200.

## Edge cases

- IP with no prior requests: empty array after pruning — covered by requirement 1
  (filter on an empty array is a no-op; the count check proceeds normally).
- Timestamp exactly at the window boundary (`now - timestamp === WINDOW_MS`): must be
  pruned (>= comparison) — covered by requirement 1.
- Rate limit is hit on the very first request in the window (all 10 prior timestamps
  are within 1 ms of `now`): `Retry-After` must be close to 60 s — covered by requirement 2.
- Rate limit is hit when the oldest in-window timestamp is 59 s old: `Retry-After`
  must be 1 s (ceil of ≤ 1000 ms / 1000) — covered by requirement 2.
- `/health` with query parameters (e.g. `GET /health?foo=bar`): `req.path` does not
  include the query string, so `'/health'` still matches — covered by requirement 3.
- Only the exact path `/health` is exempt; `/api/health`, `/healthz`, etc. remain
  rate-limited — covered by requirement 3 (the comparison is exact string equality).
