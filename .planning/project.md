# Project

Task: task2
Target: backend

## Idea

Refactor `src/services/productService.ts` to improve separation of concerns and readability without changing observable behaviour. The current implementation inlines filtering (by search term, category, and inStock) and sorting (price_asc, price_desc, name_asc, name_desc) directly inside `getAllProducts`. The task requires extracting these into dedicated named helper functions so that `getAllProducts` becomes a thin orchestrator (fetch → filter → sort → paginate → return). Additionally, the unused exported function `sanitizeSearch` must be removed, and redundant boolean checks (`=== true`, `=== false`, `!== undefined`) should be replaced with idiomatic equivalents.

## Spec pointers

- `src/benchmark-backend/instructions/TASK2.md`: Full task specification — separation of concerns, dead code removal, readability, no regressions

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/services/productService.ts`: Only file that needs changes — extract filter helper, extract sort helper, remove `sanitizeSearch`, clean up boolean checks
