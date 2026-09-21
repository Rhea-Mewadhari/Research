# Milestone

Task: task11
Target: frontend

## Requirements addressed

- Filtering before sorting: verified — all three filters (search term, category, inStockOnly) are applied to `result` at lines 19-28 of `useFilteredProducts.ts` before any sort branch runs at lines 30-36. The "price-asc sort within Fitness category produces correct order" test passed.
- Non-mutating sort: verified — line 18 spreads products into a copy (`let result: Product[] = [...products]`); all `.sort()` calls operate on `result`, not on `products`. No bare `products.sort(...)` exists. Hidden mutation tests passed (21 passed, 0 failed).
- Complete dependency array: verified — line 39 reads `}, [products, debouncedSearch, category, inStockOnly, sortBy]);` with all five dependencies present.
- sortBy triggers recompute: verified — the "changing sortBy alone — with no other filter changes — triggers recomputation" test (derivedStateCorrectness.test.tsx:76) passed; 4/4 visible tests passed, 21/21 total.

## Files changed

- src/benchmark-frontend/src/hooks/useFilteredProducts.ts: fixed all three bugs atomically — filter-before-sort order, non-mutating spread copy, and sortBy added to useMemo dependency array

## Checks

- pnpm test: 21 passed, 0 failed
- pnpm run build: pass
