# Task 3: Fix Syntax and Runtime Errors

## Objective
Fix all compile-time and runtime errors in the backend so the application starts and all endpoints respond correctly.

## What to Look For

The codebase contains errors that prevent it from compiling or running. Find and fix all of them:

- Broken or missing imports/exports
- TypeScript type errors
- Incorrect async/await usage
- Undefined variables or properties
- Crashing route handlers

## Expected Architecture

When working correctly, the backend has:
- `GET /health` — responds without auth
- `GET /products` — requires a valid Bearer token (digit-sum rule), returns `PaginatedResponse<Product>`
- Auth middleware at `src/middleware/auth.ts` applied to the `/products` route
- An async service at `src/services/productService.ts` that fetches data via `src/services/dataFetcher.ts`

If any of the above is missing or broken by the injected errors, restore it.

## Expected Files to Check
All files under `src/` may contain errors — check `app.ts`, `server.ts`, `routes/`, `controllers/`, `services/`, `utils/`, and `types/`.

## Constraints
- Do not change functionality beyond fixing errors
- Do not restructure files unnecessarily

## Success Criteria
- The server starts without errors
- `GET /products` with a valid Bearer token returns a `PaginatedResponse<Product>` JSON object
- `GET /health` responds with `{ "status": "ok" }`
- All visible tests pass
- No uncaught runtime errors in the server log
