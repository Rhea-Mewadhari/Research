# Project

Task: task3
Target: backend

## Idea

Write comprehensive Vitest + Supertest tests for the `GET /products` endpoint of the backend, covering filtering (by category and inStock), search (case-insensitive, partial, whitespace-trimmed), all four sort orders (price_asc, price_desc, name_asc, name_desc), pagination (envelope shape, different pages, limit clamping to 50), combined filters, and Bearer token authentication (missing header → 401, invalid odd-digit-sum token → 401, valid even-digit-sum token → 200, `/health` exempt). Tests must use `vi.mock` on `fetchAllProducts` from `dataFetcher` and must not modify any application source files.

## Spec pointers

- `src/benchmark-backend/instructions/TASK3.md`: full requirements — filtering, search, sorting, pagination, combined filters, auth, constraints, success criteria
- `src/benchmark-backend/src/tests/visible/products.test.ts`: the only file to edit; contains skeleton with mock setup and empty describe blocks
- `src/benchmark-backend/src/data/products.ts`: 15-product in-memory fixture used as mock return value
- `src/benchmark-backend/src/services/productService.ts`: business logic (filter, sort, paginate) — shows what the endpoint actually does
- `src/benchmark-backend/src/utils/queryParser.ts`: query parsing — limit clamped to 50, page/limit parsing rules
- `src/benchmark-backend/src/middleware/auth.ts`: token validation — digit sum must be even
- `src/benchmark-backend/src/app.ts`: `/health` is unauthenticated; `/products` requires `requireAuth`

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/tests/visible/products.test.ts`: the only file to write tests in; currently has empty describe blocks and mock wiring
- `src/benchmark-backend/src/data/products.ts`: read-only fixture data providing realistic test inputs (15 products across electronics, clothing, furniture, sports, books categories)
- `src/benchmark-backend/src/middleware/auth.ts`: defines the digit-sum token validation used in auth tests
- `src/benchmark-backend/src/services/productService.ts`: implements filtering/sorting/pagination logic that tests exercise end-to-end
- `src/benchmark-backend/src/utils/queryParser.ts`: limit clamping (max 50), page/inStock/sort parsing — test cases must exercise boundary values here
