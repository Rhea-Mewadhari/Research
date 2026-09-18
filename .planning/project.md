# Project

Task: task3
Target: backend

## Idea

Write comprehensive Vitest + Supertest tests for the `GET /products` endpoint in the existing backend. The backend is already fully implemented; the job is to fill in the empty `describe` blocks in `src/tests/visible/products.test.ts` with test cases covering filtering (by category, inStock), search (case-insensitive, partial, whitespace trimming), sorting (price and name, asc/desc), pagination (envelope shape, paging, limit clamping), combined filters, and Bearer token authentication (missing header → 401, invalid odd-digit-sum token → 401, valid even-digit-sum token → 200, /health exempt). `fetchAllProducts` must be mocked via `vi.mock`; no application source files may be modified.

## Spec pointers

- src/benchmark-backend/instructions/TASK3.md: full requirements — filtering, search, sorting, pagination, combined filters, auth; constraints (Vitest + Supertest, mock fetchAllProducts, follow existing patterns, do not modify app source); expected file to modify: `src/tests/visible/products.test.ts`

## Affected areas (initial read, not final)

- src/benchmark-backend/src/tests/visible/products.test.ts: the only file to modify; contains scaffold with empty describe blocks and mock setup
- src/benchmark-backend/src/data/products.ts: in-memory product fixtures used as mock return value
- src/benchmark-backend/src/services/dataFetcher.ts: the module being mocked (fetchAllProducts)
- src/benchmark-backend/src/services/productService.ts: business logic (filtering, sorting, pagination) — read to understand behaviour
- src/benchmark-backend/src/app.ts: Express app imported by supertest
- src/benchmark-backend/src/middleware/: auth middleware logic — understand token validation rule (digit sum even)
- src/benchmark-backend/src/routes/: route definitions — confirm /health is unauthenticated
