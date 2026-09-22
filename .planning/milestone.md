# Milestone

Task: task11
Target: backend

## Requirements addressed

- Requirement 1 (timestamp pruning): verified — `rateLimiter.ts` line 23: `const active = timestamps.filter(ts => now - ts < WINDOW_MS);` filters out all entries where `now - ts >= WINDOW_MS` before the count check and push; `pnpm test` ran 21 tests, all passed.
- Requirement 2 (computed Retry-After): verified — `rateLimiter.ts` line 26: `const retryAfter = Math.ceil((active[0] + WINDOW_MS - now) / 1000);` derives the value from the oldest in-window timestamp; the literal `60` is not passed to `RateLimitError`; `pnpm test` ran 21 tests, all passed.
- Requirement 3 (health-check exemption): verified — `rateLimiter.ts` lines 14–17: `if (req.path === '/health') { next(); return; }` uses exact string `'/health'` with leading slash, placed before any rate-limit logic; `pnpm test` ran 21 tests, all passed.

## Files changed

- `src/benchmark-backend/src/middleware/rateLimiter.ts`: fixed three bugs — added timestamp pruning via filter, computed `Retry-After` from oldest in-window timestamp, corrected health-check path guard from `'health'` to `'/health'`

## Checks

- pnpm test: 21 passed, 0 failed
- pnpm run build: pass
