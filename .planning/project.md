# Project

Task: task10
Target: backend

## Idea

Fix three pagination bugs in `src/services/productService.ts` so that `GET /products` with active filters returns correct `total`, `totalPages`, and `data` values. Bug 1: the COUNT query ignores active WHERE filters so `total` always reflects the full catalogue. Bug 2: the `featured` filter is applied in JavaScript after the paginated database rows are fetched instead of being included in the SQL WHERE clause, meaning the results are filtered from an already-paginated slice rather than the full dataset. Bug 3: `totalPages` is computed with `Math.floor` instead of `Math.ceil`, so any remainder is silently discarded.

## Spec pointers

- `src/benchmark-backend/instructions/task10.md`: full task description including objective, context, three numbered bugs, requirements, constraints, and success criteria

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/services/productService.ts`: the only file that may be modified; contains all three bugs (annotated with comments in the source)
