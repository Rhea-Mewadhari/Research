# Milestone

Task: task11
Target: frontend

## Requirements addressed

- Filtering applied before sorting: verified — Code inspection of useFilteredProducts.ts lines 20-28 confirms all three filter steps (term, category, inStockOnly) applied before sort at lines 30-36. Tests 1, 2, and 4 in derivedStateCorrectness.test.tsx passed with correct filter-then-sort order.
- No mutation of ProductContext array: verified — No bare `products.sort()` call in useFilteredProducts.ts. All sort branches use `[...result].sort(...)` spread-copy pattern. Structural grep confirmed.
- `sortBy` in useMemo dependency array: verified — Line 39: `}, [products, debouncedSearch, category, inStockOnly, sortBy]);` — all five dependencies present. Test 3 ("changing sortBy alone triggers recomputation") passed in 54ms.
- Correct sort comparators for all sortBy values: verified — price-asc, price-desc, and rating-desc all produce correct orderings. Default preserves insertion order. All sorting.test.tsx and derivedStateCorrectness.test.tsx sort assertions passed.
- Only allowed files changed: verified — `git diff --name-only` shows only `src/benchmark-frontend/src/hooks/useFilteredProducts.ts` was modified. No test files were touched. `src/utils/productFilters.ts` unchanged.

## Files changed

- `src/benchmark-frontend/src/hooks/useFilteredProducts.ts`: Fixed three bugs — reordered to filter-then-sort, replaced bare `products.sort()` with `[...result].sort(...)` to avoid mutation, added `sortBy` to the useMemo dependency array.

## Checks

- pnpm test: 21 passed, 0 failed
- pnpm run build: pass (vite v6.4.2, built in 662ms)
