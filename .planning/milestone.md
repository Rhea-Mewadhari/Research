# Milestone

Task: task11
Target: frontend

## Requirements addressed
- Filtering applied before sorting: verified — `filterProducts` in `productFilters.ts` applies search/category/inStockOnly filters before sorting; tests 1, 2, 4 in `derivedStateCorrectness.test.tsx` confirmed correct filter-then-sort order (Fitness + price-asc yields `['Jump Rope', 'Foam Roller', 'Resistance Bands', 'Yoga Mat', 'Dumbbell Set']`).
- Non-mutating sort: verified — sorting uses `[...result].sort(...)` inside `productFilters.ts`; `products.sort(` does not appear in `useFilteredProducts.ts`; all 4 tests passed, exit code 0.
- Complete `useMemo` dependency array: verified — line 17 of `useFilteredProducts.ts` contains exactly `[products, debouncedSearch, category, inStockOnly, sortBy]`; code inspection confirmed all five identifiers present.
- `sortBy` triggers recompute alone: verified — test 3 called `setSortBy('price-asc')` in an isolated `act()` with no other filter changes; `filteredProducts[0].name` became `'Jump Rope'` as expected.
- Test suite passes without modification: verified — `pnpm test -- --testPathPattern=derivedStateCorrectness` exited 0; reported `✓ tests/derivedStateCorrectness.test.tsx (4 tests) 223ms`; total 7 test files, 21 tests passed.

## Files changed
- `src/benchmark-frontend/src/hooks/useFilteredProducts.ts`: replaced inline sort-before-filter logic with delegation to `filterProducts` from `productFilters.ts`; added `sortBy` to the `useMemo` dependency array.

## Checks
- pnpm test: 21 passed, 0 failed (7 test files)
- pnpm run build: pass
