# Project

Task: task8
Target: backend

## Idea

Three API endpoints have broken error propagation after recent changes. The fixes are surgical: (1) `favouriteController.add` catches `ProductNotFoundError` and sends an inline 404 response instead of forwarding the error to the centralised error handler — fix by calling `next(err)` instead; (2) `compareController.compare` catches errors but calls `next()` with no argument, silently swallowing the error and falling through to the 404 handler — fix by passing the caught error to `next`; (3) `rateLimiter` calls `next(new Error(...))` with a plain `Error` instead of a `RateLimitError`, so the error handler cannot recognise it and cannot set the `Retry-After` header or the 429 status — fix by constructing and passing a `RateLimitError` instead.

## Spec pointers

- `src/benchmark-backend/instructions/task8.md`: full requirements, three bugs described, technical constraints, success criteria

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/controllers/favouriteController.ts`: Bug 1 — inline 404 response in `add` bypasses error handler; must call `next(err)` for `ProductNotFoundError`
- `src/benchmark-backend/src/controllers/compareController.ts`: Bug 2 — `compare` calls `next()` without the error argument, swallowing the error; must call `next(_err)` (pass the error)
- `src/benchmark-backend/src/middleware/rateLimiter.ts`: Bug 3 — passes `new Error(...)` to `next` instead of `new RateLimitError(retryAfter)`; error handler only recognises `RateLimitError` for 429 + Retry-After header
- `src/benchmark-backend/src/middleware/errorHandler.ts`: read-only reference — defines the expected error shape and how `RateLimitError` / `AppError` are handled
- `src/benchmark-backend/src/errors/index.ts`: read-only reference — defines `AppError`, `ProductNotFoundError`, `RateLimitError`, etc.
