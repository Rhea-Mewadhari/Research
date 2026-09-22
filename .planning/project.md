# Project

Task: task11
Target: backend

## Idea

Fix three correctness bugs in `src/middleware/rateLimiter.ts`. The middleware enforces a per-IP sliding 60-second window rate limit (max 10 requests). Bug 1: expired timestamps are never pruned from the per-IP array, so the window never resets and memory grows unboundedly under sustained traffic. Bug 2: the `Retry-After` response header always returns a hardcoded `60` instead of the actual seconds until the oldest in-window timestamp expires. Bug 3: the health-check exemption compares `req.path` against `'health'` (missing the leading `/`), so `GET /health` is never exempted and gets rate-limited like any other route.

## Spec pointers

- `src/benchmark-backend/instructions/task11.md`: full bug descriptions, requirements, technical constraints, and success criteria

## Affected areas (initial read, not final)

- `src/middleware/rateLimiter.ts`: the only file that must be changed — contains all three bugs
