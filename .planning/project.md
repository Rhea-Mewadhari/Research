# Project

Task: task3
Target: backend

## Idea

Write comprehensive Vitest + Supertest tests for the `GET /products` endpoint of the backend API. The endpoint supports filtering by category (case-insensitive exact match) and stock status, full-text search with case-insensitive partial name matching and whitespace trimming, four sort modes (price_asc, price_desc, name_asc, name_desc), and pagination with a clamped limit (max 50). It is protected by Bearer token auth where the token's digits must sum to an even number. Tests must mock `fetchAllProducts` via `vi.mock`, use the existing mock product data from `src/data/products.ts`, and be placed in the already-scaffolded `src/tests/visible/products.test.ts` without modifying any source files.

## Spec pointers

- `src/benchmark-backend/instructions/TASK3.md`: Full task definition — all six areas to cover (filtering, search, sorting, pagination, combined filters, authentication), constraints (use Vitest + Supertest, mock fetchAllProducts, follow existing patterns), and the expected file to modify.

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/tests/visible/products.test.ts`: The only file to modify — currently scaffolded with empty describe blocks and the vi.mock + beforeAll setup already in place.
- `src/benchmark-backend/src/data/products.ts`: Source of MOCK_PRODUCTS used in tests — 15 products across five categories (electronics, clothing, furniture, sports, books) with varying inStock, price, and name values.
- `src/benchmark-backend/src/services/productService.ts`: The service under indirect test — implements filtering, searching, sorting, and pagination so tests can assert correct output based on known product data.
- `src/benchmark-backend/src/middleware/auth.ts`: Auth middleware — requireAuth checks for Bearer token with even digit sum; tests must cover 401 cases (missing header, odd digit sum) and 200 case (even digit sum).
- `src/benchmark-backend/src/services/dataFetcher.ts`: The module being mocked via `vi.mock('../../services/dataFetcher', ...)` — mockFetchAllProducts replaces fetchAllProducts so tests are deterministic.
