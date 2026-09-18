# Project

Task: task2
Target: backend

## Idea

Refactor `productService.ts` to separate filtering and sorting logic out of the monolithic `getAllProducts` function into dedicated named helper functions, remove dead code (the unused `sanitizeSearch` export and the `DEFAULT_LIMIT` constant that is never used), and replace verbose boolean checks with idiomatic equivalents — all without changing any observable behaviour or breaking existing tests.

## Spec pointers

- `src/benchmark-backend/instructions/TASK2.md`: Full requirements — separation of concerns (filter helper, sort helper), dead code removal (`sanitizeSearch`, unused constants), readability improvements, no regressions

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/services/productService.ts`: The only file that needs to change — extract `filterProducts` and `sortProducts` helpers, remove `sanitizeSearch` export, remove `DEFAULT_LIMIT` constant (defined but never used), simplify `inStock` boolean checks
