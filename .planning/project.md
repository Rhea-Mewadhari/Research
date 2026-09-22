# Project

Task: task11
Target: backend

## Idea

Fix three distinct correctness bugs in `src/middleware/rateLimiter.ts`. Bug 1: expired timestamps are never pruned from the per-IP store, so the in-memory array grows without bound and the rate limit never resets after the 60-second window passes. Bug 2: the `Retry-After` response header always emits the hardcoded value `60` instead of computing how many seconds remain until the oldest in-window timestamp expires. Bug 3: the health-check exemption compares `req.path` against `'health'` (no leading slash), so it never matches the actual path `'/health'`, meaning the `/health` endpoint is incorrectly rate-limited.

## Spec pointers

- `src/benchmark-backend/instructions/task11.md`: full task description covering the three bugs, requirements, technical constraints, and success criteria

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/middleware/rateLimiter.ts`: the only file to modify — contains all three bugs
- `src/benchmark-backend/src/tests/visible/middleware.test.ts`: visible test suite that must pass after the fix (do not modify)
- `src/benchmark-backend/src/errors/index.ts`: referenced by rateLimiter for `RateLimitError`; read-only context
