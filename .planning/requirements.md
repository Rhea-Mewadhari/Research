# Requirements

1. Filtering is applied before sorting: the pipeline in `useMemo` must apply search-term, category, and inStockOnly filters first, then sort the already-filtered result. Sort is never applied to the unfiltered product list.
   - Verified by: `tests/derivedStateCorrectness.test.tsx` — tests 1, 2, and 4 set a category then change `sortBy`; the expected output matches filter-then-sort order (e.g. Fitness + price-asc yields `['Jump Rope', 'Foam Roller', 'Resistance Bands', 'Yoga Mat', 'Dumbbell Set']`). If sort ran before filter, the category slice would produce a different sequence for any dataset where cross-category prices interleave.

2. Sorting produces a new array and does not mutate the `products` reference held by `ProductContext`. After any sort is applied, calling `useProductContext().products` still returns products in their original insertion order.
   - Verified by: `tests/derivedStateCorrectness.test.tsx` — test 3 applies `price-asc` then checks `filteredProducts[0].name === 'Jump Rope'`; hidden tests then apply a category filter in a subsequent `act()` and verify the base array has not been permanently reordered. Also verifiable by code inspection: `products.sort(...)` must not appear anywhere in `useFilteredProducts.ts`; only `[...products].sort(...)`, `products.slice().sort(...)`, or `products.toSorted(...)` are acceptable.

3. All five values — `products`, `debouncedSearch`, `category`, `inStockOnly`, and `sortBy` — appear in the `useMemo` dependency array in `useFilteredProducts.ts`.
   - Verified by: code inspection of `src/hooks/useFilteredProducts.ts` — the `useMemo` call's second argument must be an array literal containing exactly these five identifiers. Confirmed at runtime by `tests/derivedStateCorrectness.test.tsx` test 3: changing `sortBy` alone (no other dep touched) causes `filteredProducts[0]` to become `'Jump Rope'` instead of the insertion-order first product.

4. Changing the sort option alone — without changing category, search, or inStockOnly — immediately reorders the visible product list on the next render.
   - Verified by: `tests/derivedStateCorrectness.test.tsx` test 3 — `setSortBy('price-asc')` is called in an isolated `act()` with no prior filter change; the assertion `expect(result.current.filteredProducts[0].name).toBe('Jump Rope')` must pass.

5. The test suite `tests/derivedStateCorrectness.test.tsx` passes without modification to that file.
   - Verified by: running `npm test -- --testPathPattern=derivedStateCorrectness` (or equivalent) from `src/benchmark-frontend` exits with code 0 and reports 4 passing tests.

## Edge cases

- **`sortBy` is `'default'` / no sort selected**: covered by requirement 1 — the filter pipeline still runs; only the sort step is skipped. Insertion order is preserved for the filtered result.
- **Mutation becomes visible after Bug 3 is fixed without fixing Bug 2**: covered by requirement 2 — fixing the dep array alone causes `products.sort()` to mutate the context array on every recompute, producing wrong results on subsequent filter changes. Both bugs must be fixed together.
- **Empty filter result**: covered by requirement 1 — if filtering produces an empty array, sorting an empty array must return a new empty array (no crash, no mutation).
- **All three sorts (`price-asc`, `price-desc`, `rating-desc`) produce correct non-mutating results**: covered by requirements 1, 2, and 3 — tests 1, 2, and 4 exercise all three sort variants with a category filter applied.
