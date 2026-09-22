# Project

Task: task11
Target: backend

## Idea

Fix three correctness bugs in the rate-limiting middleware (`src/middleware/rateLimiter.ts`). The middleware enforces a per-IP request limit of 10 within a sliding 60-second window, but: (1) expired timestamps are never pruned, so the count only ever grows and the limit never resets; (2) the `Retry-After` header always returns the hardcoded value `60` instead of the actual seconds remaining until the oldest in-window request expires; and (3) the `/health` endpoint exemption check compares against `'health'` (missing the leading slash) so it never matches `'/health'` and the endpoint is incorrectly rate-limited.

## Spec pointers

- `src/benchmark-backend/instructions/task11.md`: full bug descriptions, requirements, technical constraints, and success criteria

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/middleware/rateLimiter.ts`: the only file to be modified — contains all three bugs
- `src/benchmark-backend/src/tests/visible/rateLimiter.test.ts`: visible tests that must continue to pass (read-only)
- `src/benchmark-backend/src/errors/index.ts`: defines `RateLimitError` which accepts `retryAfter` — no changes needed but relevant context for computing the correct value
