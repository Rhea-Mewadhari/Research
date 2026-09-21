# Project

Task: task8
Target: backend

## Idea

Three API endpoint bugs prevent errors from reaching the centralised Express error handler (`src/middleware/errorHandler.ts`). The error handler is the sole source of the consistent `{ error, code, requestId }` response shape. Bug 1: `favouriteController.add` catches `ProductNotFoundError` and sends a raw 404 JSON inline, bypassing the handler. Bug 2: `compareController.compare` catches errors but calls `next()` with no argument, silently swallowing the error. Bug 3: `rateLimiter` passes a plain `new Error(...)` to `next(err)` instead of `new RateLimitError(retryAfterSeconds)`, so the error handler cannot recognise it as a rate-limit error, returns 500 instead of 429, and omits the `Retry-After` header.

## Spec pointers

- `src/benchmark-backend/instructions/task8.md`: Full task description — three bugs, success criteria, and technical constraints (do not modify errorHandler, services, or errors/index.ts)

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/controllers/favouriteController.ts`: Bug 1 — inline 404 response in `add()` must become `next(err)` to route through errorHandler
- `src/benchmark-backend/src/controllers/compareController.ts`: Bug 2 — `next()` with no argument in `compare()` must be `next(_err)` to propagate the error
- `src/benchmark-backend/src/middleware/rateLimiter.ts`: Bug 3 — `new Error(...)` must be replaced with `new RateLimitError(retryAfterSeconds)` (imported from `../errors`) so errorHandler sets 429 + Retry-After header
- `src/benchmark-backend/src/middleware/errorHandler.ts`: Read-only reference — defines the typed error handling logic (RateLimitError → 429 + Retry-After, AppError → statusCode/code, else 500)
- `src/benchmark-backend/src/errors/index.ts`: Read-only reference — defines AppError, RateLimitError, ProductNotFoundError, ValidationError, etc.
- `src/benchmark-backend/src/tests/visible/`: Visible tests that must pass after fixes (auth, compare, favourites, pagination, rateLimiter, userProfile)
