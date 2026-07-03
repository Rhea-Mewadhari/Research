# Task BE-T2-5: Bug Fix — Rate Limiter Correctness

## Objective

The rate-limiting middleware has three correctness issues. Fix all of them so the middleware behaves correctly under sustained traffic and correctly exempts the health-check endpoint.

---

## Context

`src/middleware/rateLimiter.ts` enforces a per-IP request limit within a sliding 60-second window. The visible tests verify that requests beyond the limit receive a 429 response. However the implementation has three issues that are not caught by those tests:

1. The timestamp array stored for each IP is never cleaned up — entries outside the current window accumulate indefinitely, causing unbounded memory growth under sustained traffic and preventing the rate limit from ever resetting
2. The `Retry-After` header always reports the same fixed value instead of reflecting the actual time remaining until the oldest in-window request expires
3. The `/health` endpoint should be exempt from rate limiting, but the exemption check never succeeds due to a string comparison error

---

## Requirements

1. Timestamps older than the 60-second window must be removed on each request for that IP so the rate limit resets correctly after the window expires
2. The `Retry-After` header must report the actual seconds until the oldest in-window timestamp will expire — computed, not hardcoded
3. `GET /health` must return 200 regardless of how many requests the same IP has made to other endpoints

---

## Technical Constraints

- Modify only `src/middleware/rateLimiter.ts`
- Do not modify `src/middleware/errorHandler.ts`, `src/errors/index.ts`, or any route file
- Timestamp pruning must happen on each relevant request (not via a background interval — a periodic cleanup is over-engineering for this context)

---

## Files to Investigate

- `src/middleware/rateLimiter.ts`

---

## Success Criteria

- All visible tests pass (`pnpm test`)
- After the 60-second window expires, requests from the same IP succeed again
- `Retry-After` changes depending on when in the window the 429 is triggered
- `GET /health` always returns 200 regardless of rate limit state
