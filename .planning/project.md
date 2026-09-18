# Project

Task: task2
Target: backend

## Idea

Refactor `src/services/productService.ts` to improve structure and maintainability without changing observable behaviour. The three inline blocks of logic inside `getAllProducts` (filtering by search/category/inStock, sorting by price/name, and pagination) should be split: filtering extracted into a dedicated `filterProducts` helper, sorting into a dedicated `sortProducts` helper, so `getAllProducts` becomes a thin orchestrator (fetch → filter → sort → paginate → return). Additionally, the exported `sanitizeSearch` function is dead code that was never cleaned up and must be removed, redundant boolean checks (`=== true`, `!== undefined`) must be replaced with idiomatic equivalents, and the four separate `if` blocks for sort variants should use a consistent `else if` chain.

## Spec pointers

- `src/benchmark-backend/instructions/TASK2.md`: defines all four requirements (separation of concerns, dead code removal, readability, no regressions) and calls out the single file to change

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/services/productService.ts`: only file in scope — contains `getAllProducts` with inlined filter/sort logic, the unused `sanitizeSearch` export, redundant `=== true`/`!== undefined` checks, and four independent `if` blocks for sorting
- `src/benchmark-backend/src/tests/visible/products.test.ts`: must not be modified; all tests must continue to pass after the refactor
- `src/benchmark-backend/src/types/product.ts`: `ProductQuery` and `PaginatedResponse` types referenced by the service — read-only reference
- `src/benchmark-backend/src/services/dataFetcher.ts`: `fetchAllProducts` called by the service — read-only reference
