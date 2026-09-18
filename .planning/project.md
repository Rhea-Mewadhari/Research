# Project

Task: task3
Target: backend

## Idea

Write comprehensive Vitest + Supertest tests for the `GET /products` endpoint in the existing test file `src/tests/visible/products.test.ts`. The backend is already fully implemented; the task is purely test-writing. Tests must mock `fetchAllProducts` using `vi.mock` (pattern already established in the file), use `MOCK_PRODUCTS` from the data layer, and cover filtering by category and stock status, search (case-insensitive, partial, whitespace trimming), all four sort orders, pagination envelope shape and behaviour (including limit clamping), combined filters, and authentication (missing header → 401, odd digit-sum token → 401, even digit-sum token → 200, /health requires no auth).

## Spec pointers

- `src/benchmark-backend/instructions/TASK3.md`: Full requirements — filtering, search, sorting, pagination, combined filters, authentication. Specifies the file to write (`src/tests/visible/products.test.ts`), the mocking approach (`vi.mock` on `fetchAllProducts`), and success criteria (all tests pass, each asserts specific values, all areas covered, self-contained and deterministic).

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/tests/visible/products.test.ts`: The only file to modify — currently has empty describe blocks for `GET /products`, `Pagination`, and `Auth middleware`. All test code goes here.
- `src/benchmark-backend/src/data/products.ts`: Read-only source of `MOCK_PRODUCTS` used in test setup (already imported in the test file).
- `src/benchmark-backend/src/app.ts`: The Express app under test — imported by the test file via supertest.
- `src/benchmark-backend/src/middleware/auth.ts`: Auth logic to understand token validation (digit-sum even/odd rule).
- `src/benchmark-backend/src/services/productService.ts`: Business logic for filtering/sorting/pagination — understanding it ensures tests assert correct behaviour.
- `src/benchmark-backend/src/services/dataFetcher.ts`: The module being mocked — `fetchAllProducts`.
- `src/benchmark-backend/src/utils/queryParser.ts`: Query parameter parsing — relevant for understanding how filters/sort/pagination params are normalised.
