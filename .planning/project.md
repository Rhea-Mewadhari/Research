# Project

Task: task11
Target: frontend

## Idea

Fix three bugs in the `useFilteredProducts` hook. Currently the hook sorts the full product list before filtering (wrong order — should filter first, then sort), calls `products.sort()` directly which mutates the `ProductContext` array in-place (should sort a copy), and omits `sortBy` from the `useMemo` dependency array so sort-only changes don't trigger a recompute. All three bugs must be fixed together: fixing the dependency array while leaving the mutation causes the mutation to become visible on every sort change.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK11.MD`: defines the three bugs, the required fix order (filter then sort), the non-mutation requirement, the full dependency array requirement, and points to the primary file to modify.

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/hooks/useFilteredProducts.ts`: primary target — contains all three bugs (sort-before-filter, in-place mutation via `products.sort()`, missing `sortBy` dep)
- `src/benchmark-frontend/src/utils/productFilters.ts`: optional delegation target — already implements filter-then-sort correctly with non-mutating sort (`[...result].sort(...)`)
- `src/benchmark-frontend/tests/derivedStateCorrectness.test.tsx`: visible tests covering category+sort combined output and sortBy-alone recomputation (do not modify)
