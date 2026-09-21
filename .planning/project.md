# Project

Task: task11
Target: frontend

## Idea

Fix three bugs in `useFilteredProducts.ts`, the central hook that combines `ProductContext` products with `FilterContext` filter state into the visible product list. Bug 1: sort is applied before filtering instead of after. Bug 2: `products.sort(...)` mutates the context array in place — must sort a copy. Bug 3: `sortBy` is absent from the `useMemo` dependency array, so changing only the sort option does not trigger a recompute.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK11.MD`: full bug descriptions, requirements, decision surfaces, and the list of files to modify

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/hooks/useFilteredProducts.ts`: primary target — all three bugs live here (sort order, mutation, missing dep)
- `src/benchmark-frontend/src/utils/productFilters.ts`: existing utility that already does filter-then-sort correctly with non-mutating sort; optionally used to replace inline logic in the hook
- `src/benchmark-frontend/tests/derivedStateCorrectness.test.tsx`: visible test file — must not be modified, but exercises Bug 3 (sortBy dep) and combined category+sort order
