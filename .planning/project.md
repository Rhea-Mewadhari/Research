# Project

Task: task8
Target: backend

## Idea

Three backend files were modified and broke consistent error propagation to the centralised Express error handler (`src/middleware/errorHandler.ts`). The fixes are: (1) `favouriteController.ts` catches `ProductNotFoundError` and sends an inline 404 response instead of passing the error to `next(err)` — it must call `next(err)` instead; (2) `compareController.ts` catches errors and calls `next()` with no argument, swallowing the error — it must call `next(_err)` to forward the error; (3) `rateLimiter.ts` creates a plain `new Error(...)` and passes it to `next()`, but the error handler expects a `RateLimitError` instance (with `retryAfterSeconds`) to set the `Retry-After` header and return 429 — it must construct and pass a `RateLimitError` instead.

## Spec pointers

- `src/benchmark-backend/instructions/task8.md`: defines all three bugs, requirements, technical constraints (do not modify errorHandler, services, or errors/index.ts), and success criteria

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/controllers/favouriteController.ts`: Bug 1 — inline 404 response for ProductNotFoundError bypasses errorHandler; must call next(err)
- `src/benchmark-backend/src/controllers/compareController.ts`: Bug 2 — next() called without error argument, swallowing the error; must call next(_err) / next(err)
- `src/benchmark-backend/src/middleware/rateLimiter.ts`: Bug 3 — passes plain Error to next() instead of RateLimitError; error handler cannot set Retry-After or return 429
- `src/benchmark-backend/src/middleware/errorHandler.ts`: Read-only reference — defines the handler that all errors must reach
- `src/benchmark-backend/src/errors/index.ts`: Read-only reference — defines RateLimitError, AppError, ProductNotFoundError classes
