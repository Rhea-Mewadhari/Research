# Project

Task: task11
Target: backend

## Idea

Fix three correctness bugs in the rate-limiting middleware (`src/middleware/rateLimiter.ts`). The middleware enforces a per-IP request limit within a sliding 60-second window, but: (1) expired timestamps are never pruned, so the in-memory store grows unboundedly and the rate limit never resets after the window passes; (2) the `Retry-After` response header always returns a hardcoded value of 60 seconds instead of computing the actual seconds until the oldest in-window timestamp expires; and (3) the `/health` endpoint exemption check compares against `'health'` (missing the leading slash) so it never matches, meaning the health endpoint is incorrectly rate-limited.

## Spec pointers

- `src/benchmark-backend/instructions/task11.md`: Full task description — lists the three bugs, requirements, technical constraints, files to modify, and success criteria

## Affected areas (initial read, not final)

- `src/middleware/rateLimiter.ts`: The only file to be modified — contains all three bugs:
  - Line 14: `req.path === 'health'` should be `req.path === '/health'`
  - Lines 23–24: Missing timestamp pruning before the window check; `timestamps` should be filtered to only those within the last 60 seconds before any comparison
  - Line 26: `const retryAfter = 60` should compute `Math.ceil((timestamps[0] + WINDOW_MS - now) / 1000)` where `timestamps[0]` is the oldest in-window timestamp
