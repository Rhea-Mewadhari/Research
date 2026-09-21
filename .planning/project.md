# Project

Task: task11
Target: frontend

## Idea

Fix three bugs in the `useFilteredProducts` hook: (1) sort is applied before filtering instead of after, (2) `products.sort()` mutates the array stored in `ProductContext` in place rather than sorting a copy, and (3) `sortBy` is missing from the `useMemo` dependency array so sort-only changes do not trigger a recompute. All three must be fixed together: fixing the missing dep (Bug 3) without fixing the mutation (Bug 2) makes the mutation visible on every sort-triggered recompute.

## Spec pointers

- src/benchmark-frontend/instructions/TASK11.MD: full bug descriptions, requirements, decision surfaces, files to modify, and test coverage notes

## Affected areas (initial read, not final)

- src/benchmark-frontend/src/hooks/useFilteredProducts.ts: primary target — contains all three bugs; sort runs before filter, uses mutating `products.sort()`, and `sortBy` is absent from the dep array
- src/benchmark-frontend/src/utils/productFilters.ts: already implements filter-then-sort correctly with non-mutating spread; could be delegated to from the hook (optional)
- src/benchmark-frontend/tests/derivedStateCorrectness.test.tsx: visible tests that verify category+sort combined order and sortBy-alone recomputation (must not be modified)
