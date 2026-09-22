# Requirements

1. On each request for a given IP, timestamps older than the 60-second window
   (`timestamp < now - WINDOW_MS`) must be removed from the in-memory store **before**
   the request count is checked against `MAX_REQUESTS`.
   - Verified by: Code inspection of `src/benchmark-backend/src/middleware/rateLimiter.ts`
     — the `timestamps` array is filtered (e.g. `timestamps.filter(t => t > now - WINDOW_MS)`)
     and the result replaces the raw store value before the `length >= MAX_REQUESTS` check.
     A background interval is explicitly disallowed; pruning must be inline per request.

2. The `Retry-After` header must reflect the actual seconds until the oldest in-window
   timestamp expires, not a hardcoded constant. Specifically, the value passed to
   `RateLimitError` must be computed as `Math.ceil((timestamps[0] + WINDOW_MS - now) / 1000)`
   (or an equivalent expression), where `timestamps[0]` is the oldest entry remaining
   after pruning.
   - Verified by: Code inspection of `rateLimiter.ts` — the literal `60` no longer appears
     as the argument to `RateLimitError`; the argument is a computed expression that
     references `timestamps[0]` (or the first element of the filtered array) and `WINDOW_MS`.

3. `GET /health` must be exempt from rate limiting. The path comparison must use
   `'/health'` (with the leading slash) so it matches `req.path` when the route is
   `/health`.
   - Verified by: Code inspection of `rateLimiter.ts` — the exemption check reads
     `req.path === '/health'` (not `'health'`). Additionally, `pnpm test` passes in
     `src/benchmark-backend/`, and if a hidden test issues more than 10 requests to `/health`,
     none receive a 429.

4. All visible tests pass without modification to any file under `src/tests/`.
   - Verified by: Running `pnpm test` inside `src/benchmark-backend/` exits with code 0.

5. Only `src/benchmark-backend/src/middleware/rateLimiter.ts` is modified.
   - Verified by: `git diff --name-only` from the repo root lists only
     `src/benchmark-backend/src/middleware/rateLimiter.ts`.

---

## Edge cases

- **Timestamp exactly at the window boundary** (`timestamp === now - WINDOW_MS`): treated
  as expired and pruned; covered by requirement 1 (filter condition is `t > now - WINDOW_MS`
  or `now - t < WINDOW_MS`, excluding the boundary value).
- **`Retry-After` varies with position in window**: a 429 triggered near the start of the
  window reports close to 60 s; one triggered near the end reports near 0 s; covered by
  requirement 2.
- **`GET /health` when rate limit is already exhausted for that IP**: still returns 200
  because the exemption check runs before the count check; covered by requirement 3.
- **Pruning via background `setInterval`**: explicitly prohibited by the task constraints;
  the implementation must prune inline; covered by requirement 1.
- **IP with no prior entries** (`store.get(ip)` returns `undefined`): defaults to an empty
  array, no pruning needed, request is allowed; existing logic handles this correctly and
  must be preserved; covered by requirement 4 (visible tests still pass).
