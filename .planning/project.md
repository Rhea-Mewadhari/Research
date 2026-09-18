# Project

Task: task3
Target: backend

## Idea

Write comprehensive Vitest + Supertest tests for the `GET /products` endpoint. The backend is already fully implemented. Tests must cover: category and inStock filtering, case-insensitive/partial/trimmed search, all four sort options (price_asc, price_desc, name_asc, name_desc), pagination envelope shape and clamping, combined query params, and Bearer token authentication (missing header → 401, odd digit-sum token → 401, even digit-sum token → 200, /health skips auth). The mock for `fetchAllProducts` is already hoisted via `vi.hoisted`/`vi.mock` in the existing test file; tests must use that mock setup and the in-memory `products` fixture from `src/data/products.ts`. No application source files may be modified.

## Spec pointers

- `src/benchmark-backend/instructions/TASK3.md`: full requirements — filtering, search, sorting, pagination, combined filters, authentication, constraints, and success criteria

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/tests/visible/products.test.ts`: the ONLY file to modify — tests go inside the existing `describe` blocks (GET /products, Pagination, Auth middleware)
- `src/benchmark-backend/src/data/products.ts`: 15-product in-memory fixture used as mock return value; provides known categories (electronics, clothing, furniture, sports, books), inStock values, prices, and names to assert against
- `src/benchmark-backend/src/services/dataFetcher.ts`: mocked via `vi.mock` — `fetchAllProducts` is replaced by `mockFetchAllProducts` before each test run
- `src/benchmark-backend/src/services/productService.ts`: filtering/sorting/pagination logic that the tests exercise indirectly through the HTTP layer
- `src/benchmark-backend/src/middleware/auth.ts`: `requireAuth` — validates Bearer token by summing digits and checking evenness; `benchmark-token-2024` digits: 2+0+2+4=8 (even, valid)
- `src/benchmark-backend/src/utils/queryParser.ts`: parses and normalises query params including limit clamping to max 50
- `src/benchmark-backend/src/app.ts`: mounts `/health` (no auth) and `/products` (auth required) routes
