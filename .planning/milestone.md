# Milestone

Task: task11
Target: backend

## Requirements addressed

- Requirement 1 (timestamp pruning): verified — rateLimiter.ts line 22 filters the per-IP array with `filter(ts => now - ts < WINDOW_MS)` on every request; the pruned array is used for both the `>= MAX_REQUESTS` check and `store.set`. No background interval.
- Requirement 2 (computed Retry-After): verified — line 25 computes `Math.ceil((timestamps[0] + WINDOW_MS - now) / 1000)` from the oldest in-window timestamp; no hardcoded `60` is passed to `new RateLimitError(...)`.
- Requirement 3 (health-check exemption): verified — lines 14-17 compare `req.path === '/health'` (with leading slash), calling `next()` and returning before any store access.
- Requirement 4 (single file changed): verified — only `src/benchmark-backend/src/middleware/rateLimiter.ts` was modified; errorHandler.ts and errors/index.ts are unchanged.
- Requirement 5 (tests pass): verified — `pnpm test` from `src/benchmark-backend/` exits 0; 2 test files, 21 tests, all passed.

## Files changed

- `src/benchmark-backend/src/middleware/rateLimiter.ts`: fixed three bugs — expired timestamp pruning, computed `Retry-After` header, and `/health` path comparison with leading slash.

## Checks

- pnpm test: 21 passed, 0 failed
- pnpm run build: not applicable (vitest-only project; no separate build step)
