# Project

Task: task11
Target: frontend

## Idea

Fix three bugs in `useFilteredProducts`, the central hook that combines product and filter context state. Bug 1: sort is applied before filtering — correct order is filter first, then sort. Bug 2: `products.sort(...)` mutates the context's array in-place — must sort a copy via `[...products].sort(...)`. Bug 3: `sortBy` is missing from the `useMemo` dependency array, so changing the sort dropdown alone does not trigger a recompute. All three bugs must be fixed together because fixing Bug 3 without Bug 2 makes the mutation immediately visible and harmful.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK11.MD`: full description of all three bugs, requirements, decision surfaces, and files to modify

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/hooks/useFilteredProducts.ts`: primary target — all three bugs live here
- `src/benchmark-frontend/src/utils/productFilters.ts`: optional delegation target for sort logic; already has correct non-mutating sort implementation
- `src/benchmark-frontend/tests/derivedStateCorrectness.test.tsx`: visible test file (must not be modified; verifies Bug 3 fix and filter-then-sort ordering)
