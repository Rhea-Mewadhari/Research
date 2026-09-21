# Milestone

Task: task11
Target: frontend

## Requirements addressed

- Filtering must occur before sorting: verified — Code inspection of `src/hooks/useFilteredProducts.ts` confirms lines 20-28 apply `.filter()` for term, category, and inStockOnly; lines 30-36 apply `.sort()` only after all filter steps. All 4 tests in `tests/derivedStateCorrectness.test.tsx` passed (vitest: '✓ tests/derivedStateCorrectness.test.tsx (4 tests) 223ms').
- Sorting must not mutate the ProductContext array: verified — Lines 31, 33, 35 all use `[...result].sort(...)` (spread copy). No bare `products.sort()` call exists. All 21 tests passed including tests that apply a sort then change a filter and assert original insertion order.
- All five useMemo dependencies present: verified — Line 39 shows `[products, debouncedSearch, category, inStockOnly, sortBy]`. Test 3 ('changing sortBy alone — with no other filter changes — triggers recomputation') passed.
- Changing sortBy alone triggers immediate recomputation: verified — Test 3 sets `sortBy` to `'price-asc'` with no other filter changes and asserts `filteredProducts[0].name === 'Jump Rope'` ($15, cheapest). Passed.

## Files changed

- `src/benchmark-frontend/src/hooks/useFilteredProducts.ts`: fixed sort-before-filter bug (filters now precede sort), replaced mutating `products.sort()` with non-mutating `[...result].sort(...)`, added `sortBy` to the `useMemo` dependency array

## Checks

- pnpm test: 21 passed, 0 failed (7 test files)
- pnpm run build: pass
