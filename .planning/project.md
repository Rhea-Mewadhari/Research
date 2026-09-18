# Project

Task: task2
Target: backend

## Idea

Refactor `productService.ts` to improve separation of concerns and readability without changing any observable behaviour. The main function `getAllProducts` is currently a monolith that inlines filtering, sorting, and pagination. The task requires extracting filtering logic into a dedicated helper and sorting logic into another dedicated helper so `getAllProducts` becomes a thin orchestrator (fetch → filter → sort → paginate → return). Additionally, a dead-code export (`sanitizeSearch`) that was never consumed must be removed, redundant boolean checks (`=== true`, `!== undefined`) must be replaced with idiomatic equivalents, and sort logic must use a consistent structure (the current code uses four separate `if` blocks rather than a single conditional chain). All existing tests must continue to pass.

## Spec pointers

- `src/benchmark-backend/instructions/TASK2.md`: full requirements — separation of concerns, dead code removal, readability fixes, no regressions, constraint to only touch `productService.ts`

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/services/productService.ts`: the only file requiring changes — extract `filterProducts` helper, extract `sortProducts` helper, remove unused `sanitizeSearch` export, replace `=== true` / `!== undefined` checks with idiomatic equivalents, consolidate sort `if` blocks
- `src/benchmark-backend/src/tests/visible/products.test.ts`: read-only reference — all tests here must remain green after refactor
- `src/benchmark-backend/src/services/dataFetcher.ts`: upstream data source called by `getAllProducts` — read-only, no changes needed
- `src/benchmark-backend/src/types/product.ts`: type definitions (`Product`, `ProductQuery`, `PaginatedResponse`) — read-only, referenced by the service
