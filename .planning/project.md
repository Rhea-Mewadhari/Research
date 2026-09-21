# Project

Task: task8
Target: backend

## Idea

Three backend files have bugs that prevent errors from reaching the centralised Express error handler (`src/middleware/errorHandler.ts`). The fixes are: (1) `favouriteController.ts` currently catches `ProductNotFoundError` and sends a 404 response inline — it must call `next(err)` instead so the error handler produces the standard `{ error, code, requestId }` shape; (2) `compareController.ts` catches errors but calls `next()` with no argument, swallowing the error — it must pass the error: `next(err)`; (3) `rateLimiter.ts` passes a plain `Error` to `next(err)`, but the error handler only sets the `Retry-After` header and 429 status when it receives a `RateLimitError` instance — it must construct and pass `new RateLimitError(retryAfter)`.

## Spec pointers

- `src/benchmark-backend/instructions/task8.md`: Full task description, three bugs identified, requirements, technical constraints, and success criteria

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/controllers/favouriteController.ts`: Bug #1 — inline 404 response bypasses error handler; `add` function lines 19-25
- `src/benchmark-backend/src/controllers/compareController.ts`: Bug #2 — `next()` called without error argument in `compare` function; line 10
- `src/benchmark-backend/src/middleware/rateLimiter.ts`: Bug #3 — plain `Error` passed to `next()` instead of `RateLimitError`; line 27
- `src/benchmark-backend/src/errors/index.ts`: Defines `RateLimitError`, `ProductNotFoundError`, `AppError` — read-only per constraints
- `src/benchmark-backend/src/middleware/errorHandler.ts`: Centralised handler — read-only per constraints; checks `instanceof RateLimitError` then `instanceof AppError`
- `src/benchmark-backend/src/tests/visible/`: Visible tests that must pass after fixes
