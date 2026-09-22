# Milestone

Task: task11
Target: backend

## Requirements addressed

- Requirement 1 (timestamp pruning): verified — `rateLimiter.ts` line 22 applies `filter(ts => ts >= now - WINDOW_MS)` before the count check and before pushing the new timestamp. `pnpm test`: 21 passed, exit code 0.
- Requirement 2 (dynamic Retry-After): verified — `rateLimiter.ts` line 25 computes `Math.ceil((Math.min(...pruned) + WINDOW_MS - now) / 1000)` from the oldest in-window timestamp; no hardcoded `60` passed to `RateLimitError`. `pnpm test`: 21 passed, exit code 0.
- Requirement 3 (/health exemption): verified — `rateLimiter.ts` line 14 checks `req.path === '/health'` (with leading slash), calling `next()` and returning before any rate-limit logic. `pnpm test`: 21 passed, exit code 0.

## Files changed

- `src/benchmark-backend/src/middleware/rateLimiter.ts`: fixed three bugs — added timestamp pruning filter, replaced hardcoded `retryAfter = 60` with dynamic calculation, corrected `/health` exemption path comparison from `'health'` to `'/health'`

## Checks

- pnpm test: 21 passed, 0 failed
- pnpm run build: pass (TypeScript compiled successfully; tests ran without type errors)
