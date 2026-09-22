# Requirements

1. On each request for a given IP, all timestamps older than 60 seconds
   (`< Date.now() - WINDOW_MS`) must be removed from the in-memory store before the
   request count is compared against `MAX_REQUESTS`. After a full 60-second window
   elapses with no new requests, a subsequent request from the same IP must be allowed
   (HTTP 200), not rejected with 429.
   - Verified by: `src/benchmark-backend/src/middleware/rateLimiter.ts` contains a
     `.filter(ts => ts > now - WINDOW_MS)` (or equivalent) applied to the stored
     timestamp array before the `timestamps.length >= MAX_REQUESTS` guard. The
     behavioural outcome — that the rate limit resets after the window — is verified by
     the hidden test suite; the structural fix is directly readable in the file.

2. When a 429 response is returned, the `Retry-After` header value must equal
   `Math.ceil((timestamps[0] + WINDOW_MS - now) / 1000)`, where `timestamps[0]` is
   the oldest timestamp remaining in the window after pruning. The value must not be
   the literal constant `60`.
   - Verified by: `src/benchmark-backend/src/middleware/rateLimiter.ts` no longer
     contains `const retryAfter = 60` (or any other hardcoded numeric literal in that
     position). The value passed to `new RateLimitError(retryAfter)` is derived from
     `timestamps[0] + WINDOW_MS - now`. The visible test `rateLimiter.test.ts` asserts
     that the `retry-after` header is defined; the hidden tests assert its computed
     value varies with timing.

3. A `GET /health` request must always receive HTTP 200 regardless of how many prior
   requests the same IP has made to other endpoints. The exemption check must use
   `req.path === '/health'` (with the leading slash).
   - Verified by: `src/benchmark-backend/src/middleware/rateLimiter.ts` contains
     `req.path === '/health'` (not `'health'`). After issuing 11 or more requests to
     a rate-limited endpoint from the same IP, `GET /health` returns 200 — verifiable
     via `pnpm test` when the hidden test suite runs this scenario.

4. All existing visible tests continue to pass without modification.
   - Verified by: `pnpm test` run from `src/benchmark-backend/` exits with code 0 and
     all test cases in `src/tests/visible/rateLimiter.test.ts` and
     `src/tests/visible/products.test.ts` are reported as passed.

5. Only `src/benchmark-backend/src/middleware/rateLimiter.ts` is modified — no other
   source file, route, error handler, or test file is changed.
   - Verified by: `git diff --name-only` lists exactly one file:
     `src/benchmark-backend/src/middleware/rateLimiter.ts`.

---

## Edge cases

- **`Retry-After` ≥ 1**: If `timestamps[0] + WINDOW_MS - now` computes to less than
  1000 ms (i.e., the window is about to expire), `Math.ceil` ensures the header value
  is at least 1, never 0 or negative. Covered by requirement 2.

- **Pruning happens before the count check**: If pruning follows the count check, a
  window with 10 stale timestamps still blocks the request. The fix must filter
  *before* the `>= MAX_REQUESTS` guard. Covered by requirement 1.

- **`/health` check fires before IP lookup and count check**: The exemption must
  short-circuit before any store interaction to avoid accumulating health-check
  timestamps against the IP's quota. The current code structure already does this;
  the fix is only the string value. Covered by requirement 3.

- **Multiple IPs are tracked independently**: Each IP has its own timestamp array in
  `store`; pruning one IP's array must not affect another's. Covered implicitly by
  requirement 1 (the filter operates on the array retrieved for the specific IP).
