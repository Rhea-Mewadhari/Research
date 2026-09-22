# Milestone

Task: task11
Target: backend

## Requirements addressed
- Req 1 (timestamp pruning): verified — `const pruned = timestamps.filter(t => t > now - WINDOW_MS)` applied at line 23, before the `pruned.length >= MAX_REQUESTS` guard at line 25
- Req 2 (Retry-After header): verified — `const retryAfter = Math.ceil((pruned[0] + WINDOW_MS - now) / 1000)` at line 26; no hardcoded `60` remains; all 21 tests passed including the Retry-After assertion
- Req 3 (/health exemption): verified — `req.path === '/health'` (with leading slash) at line 14
- Req 4 (existing tests pass): verified — `pnpm test` from `src/benchmark-backend/`: 2 test files passed, 21 tests passed, exit code 0
- Req 5 (only one file changed): verified — `git diff --name-only` shows 0 uncommitted files; only `src/benchmark-backend/src/middleware/rateLimiter.ts` was modified

## Files changed
- `src/benchmark-backend/src/middleware/rateLimiter.ts`: Fixed three bugs — corrected `/health` path check, added timestamp pruning before count guard, replaced hardcoded `retryAfter = 60` with computed value

## Checks
- pnpm test: 21 passed, 0 failed
- pnpm run build: pass
