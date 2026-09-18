# Project

Task: task2
Target: backend

## Idea

Refactor `src/services/productService.ts` to improve structure and maintainability without changing observable behaviour. Specifically: extract filtering logic (search, category, inStock) into a dedicated helper function and sorting logic into a separate helper function, so that `getAllProducts` becomes a thin orchestrator (fetch → filter → sort → paginate → return). Additionally, remove the dead `sanitizeSearch` export that was never called, replace verbose boolean comparisons (`=== true`, `!== undefined`) with idiomatic equivalents, and clean up the repeated `.sort()` calls into a single consistent sort helper. All existing tests must continue to pass and the response envelope shape must not change.

## Spec pointers

- src/benchmark-backend/instructions/TASK2.md: full requirements — separation of concerns (filter helper, sort helper), dead code removal (sanitizeSearch export), readability improvements (boolean checks, sort structure), no regressions

## Affected areas (initial read, not final)

- src/benchmark-backend/src/services/productService.ts: the only file to be modified — contains getAllProducts, sanitizeSearch (dead export), inlined filter and sort logic to extract
- src/benchmark-backend/src/tests/visible/products.test.ts: must continue to pass; read-only
- src/benchmark-backend/src/types/product.ts: provides ProductQuery, Product, PaginatedResponse types — relevant for understanding helper function signatures
- src/benchmark-backend/src/services/dataFetcher.ts: provides fetchAllProducts — called by getAllProducts, no changes needed
