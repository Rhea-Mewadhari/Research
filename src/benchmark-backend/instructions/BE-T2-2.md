# Task BE-T2-2: Bug Fix — Inconsistent Error Propagation

## Objective

Several API endpoints are not routing errors through the centralised error handler correctly. Fix all three issues so that every error response has a consistent shape and the correct status code.

---

## Context

The backend uses a centralised Express error handler (`src/middleware/errorHandler.ts`) as the single source of truth for error response shape. All error responses should be `{ error, code, requestId }` with the appropriate status code.

After recent changes to three files, errors are not reaching the error handler consistently:

1. One controller catches a specific error type and sends a response inline, bypassing the error handler entirely
2. One controller catches errors but calls `next()` without the error argument — the error is swallowed and the request falls through to the 404 handler
3. One middleware passes a plain `Error` to `next(err)` instead of the typed error class the handler expects — the error handler cannot recognise it and returns 500

---

## Requirements

1. All error responses must be produced by `errorHandler` — no controller should send a 4xx JSON response directly except for `204 No Content` returns
2. `POST /api/favourites` with a non-existent `productId` must return 404 with `{ error, code, requestId }`
3. `GET /api/products/compare` with valid-format but non-existent ids must return 400 with `{ error, code, requestId }`
4. Rate-limit violations must return 429 with a `Retry-After` header

---

## Technical Constraints

- Do not modify `src/middleware/errorHandler.ts`
- Do not modify `src/services/` files
- Do not modify `src/errors/index.ts`

---

## Files to Investigate

- `src/controllers/favouriteController.ts`
- `src/controllers/compareController.ts`
- `src/middleware/rateLimiter.ts`

---

## Success Criteria

- All visible tests pass (`pnpm test`)
- `POST /api/favourites` with a non-existent productId returns `{ error, code, requestId }` with status 404
- `GET /api/products/compare` with non-existent ids returns `{ error, code, requestId }` with status 400
- Rate-limit errors produce 429 with a `Retry-After` header
