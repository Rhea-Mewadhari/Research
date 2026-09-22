# Project

Task: task10
Target: backend

## Idea

Fix three pagination bugs in `src/services/productService.ts` so that `GET /products` returns accurate `total`, `totalPages`, and `data` values when filters are active. Bug 1: the `COUNT(*)` query ignores the active WHERE filters, so `total` always reflects the full catalogue. Bug 2: the `featured` filter is applied in JavaScript after the paginated SQL rows are returned, meaning it filters an already-sliced result set rather than the full filtered dataset. Bug 3: `totalPages` is computed with `Math.floor` instead of `Math.ceil`, causing an off-by-one when the count is not evenly divisible by the page limit.

## Spec pointers

- `src/benchmark-backend/instructions/task10.md`: full bug description, requirements, constraints, and success criteria

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/services/productService.ts`: sole file to modify — contains all three bugs (lines 56-58 for Bug 1, lines 67-69 for Bug 2, line 76 for Bug 3)
