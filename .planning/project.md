# Project

Task: task11
Target: backend

## Idea

Fix three correctness bugs in `src/middleware/rateLimiter.ts`. The middleware enforces a per-IP sliding 60-second window rate limit, but: (1) it never prunes expired timestamps from the in-memory store, so old entries accumulate indefinitely and the rate limit never resets; (2) the `Retry-After` header is hardcoded to 60 rather than computed as actual seconds until the oldest in-window timestamp expires; and (3) the health-check exemption check compares `req.path` against `'health'` (missing the leading `/`), so `GET /health` is never exempted and will be rate-limited like any other route.

## Spec pointers

- `src/benchmark-backend/instructions/task11.md`: defines the three bugs, requirements, technical constraints (modify only `rateLimiter.ts`), and success criteria

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/middleware/rateLimiter.ts`: the only file to be modified — contains all three bugs
