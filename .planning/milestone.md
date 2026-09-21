# Milestone

Task: task11
Target: frontend

## Requirements addressed

- Filtering before sorting: verified — `useFilteredProducts.ts` lines 20-28 apply three filters (debouncedSearch, category, inStockOnly) before lines 30-36 apply sorting. All four `derivedStateCorrectness` tests passed, including "price-asc sort within Fitness category" which expects only the five Fitness products sorted by price.
- No mutation of ProductContext array: verified — lines 31, 33, 35 each use `[...result].sort(...)` (spread-then-sort), creating a new array. No bare `products.sort(` call exists in the file. All 21 tests passed including those that change category after a sort.
- `sortBy` in useMemo dependency array: verified — line 39 reads `[products, debouncedSearch, category, inStockOnly, sortBy]`. Test "changing sortBy alone — with no other filter changes — triggers recomputation" passed.
- Exactly five deps (no additions, no omissions): verified — dep array on line 39 is exactly `[products, debouncedSearch, category, inStockOnly, sortBy]`.
- Return type and public interface unchanged: verified — `pnpm exec tsc --noEmit` exited 0 (no type errors); line 41 returns `{ filteredProducts, resultCount: filteredProducts.length }` matching original interface.

## Files changed

- `src/benchmark-frontend/src/hooks/useFilteredProducts.ts`: fixed all three bugs — filter-then-sort ordering, non-mutating spread sort, and `sortBy` added to `useMemo` dep array

## Checks

- pnpm test: 21 passed, 0 failed
- pnpm run build: pass (tsc --noEmit exit code 0)
