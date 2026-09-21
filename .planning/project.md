# Project

Task: task11
Target: frontend

## Idea

The `useFilteredProducts` hook in `src/hooks/useFilteredProducts.ts` contains three bugs that must all be fixed: (1) sort is applied before filtering instead of after, (2) sorting mutates the `products` array held in `ProductContext` rather than operating on a copy, and (3) `sortBy` is missing from the `useMemo` dependency array, causing stale output when only the sort option changes. The fix requires reordering operations (filter first, then sort), spreading the array before sorting, and adding `sortBy` to the dependency array. The existing `filterProducts` utility in `productFilters.ts` already implements the correct pattern (filter-then-sort on a copy) and can optionally be reused.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK11.MD`: Full description of the three bugs, requirements, decision surfaces, and files to modify.

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/hooks/useFilteredProducts.ts`: Primary target — all three bugs live here.
- `src/benchmark-frontend/src/utils/productFilters.ts`: Optional — already implements the correct filter-then-sort-on-copy pattern; can be delegated to from the hook.
- `src/benchmark-frontend/tests/derivedStateCorrectness.test.tsx`: Visible tests that verify Bug 3 fix (sortBy triggers recompute) and correct filtered-then-sorted output.
