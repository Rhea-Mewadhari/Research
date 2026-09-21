# Project

Task: task8
Target: backend

## Idea

Three backend files were changed in a way that breaks consistent error propagation through the centralised `errorHandler` middleware. The fix requires: (1) removing the inline 404 response in `favouriteController.ts` so `ProductNotFoundError` is forwarded to `next(err)` instead, (2) fixing `compareController.ts` to pass the caught error to `next(err)` rather than calling `next()` with no argument, and (3) replacing the plain `new Error(...)` in `rateLimiter.ts` with a `new RateLimitError(retryAfter)` so the error handler can recognise it and set the `Retry-After` header with a 429 status.

## Spec pointers

- `src/benchmark-backend/instructions/task8.md`: Full task description — objectives, requirements, technical constraints, files to investigate, and success criteria

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/controllers/favouriteController.ts`: Bug 1 — `add` handler catches `ProductNotFoundError` and sends `{ message: 'Product not found' }` inline (lines 20-23) instead of calling `next(err)`
- `src/benchmark-backend/src/controllers/compareController.ts`: Bug 2 — `compare` handler catches errors and calls `next()` with no argument (line 10), swallowing the error instead of forwarding it as `next(_err)`
- `src/benchmark-backend/src/middleware/rateLimiter.ts`: Bug 3 — passes `new Error(...)` to `next()` (line 27) instead of `new RateLimitError(retryAfter)`, which the error handler cannot match to set the 429 status and `Retry-After` header
- `src/benchmark-backend/src/middleware/errorHandler.ts`: Read-only reference — defines the expected error types (`RateLimitError`, `AppError`) and response shape `{ error, code, requestId }`
- `src/benchmark-backend/src/errors/index.ts`: Read-only reference — defines `RateLimitError`, `ProductNotFoundError`, `AppError`, etc.
