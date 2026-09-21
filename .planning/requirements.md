# Requirements

1. Filtering must occur before sorting: within the `useMemo` in `useFilteredProducts.ts`, the search-term, category, and inStockOnly filters are applied to the raw `products` array first; the sort comparator is applied only to the already-filtered result.
   - Verified by: running `pnpm --filter benchmark-frontend test` — all four tests in `tests/derivedStateCorrectness.test.tsx` pass (each test sets a category filter and then changes `sortBy` in a separate `act()`, confirming the sorted output is drawn from the filtered set). Additionally, code inspection of `src/hooks/useFilteredProducts.ts` confirms the `.filter()` calls precede the `.sort()` call.

2. Sorting must not mutate the `ProductContext` `products` array: the sort step must operate on a copy (e.g. `[...result].sort(...)`, `result.slice().sort(...)`, or `result.toSorted(...)`) so that the reference held by `ProductContext` is never reordered in-place.
   - Verified by: code inspection of `src/hooks/useFilteredProducts.ts` confirms no bare `products.sort(...)` or `result = products.sort(...)` call exists; the sort is performed on a spread/slice copy. The hidden-test suite (`pnpm --filter benchmark-frontend test`) must also pass — those tests apply a sort, then change a filter, and assert the filter operates on the original insertion order.

3. All five values — `products`, `debouncedSearch`, `category`, `inStockOnly`, and `sortBy` — must appear in the `useMemo` dependency array in `useFilteredProducts.ts`.
   - Verified by: code inspection of the `useMemo` call in `src/hooks/useFilteredProducts.ts` confirms the dependency array is `[products, debouncedSearch, category, inStockOnly, sortBy]` (order may vary). Running `pnpm --filter benchmark-frontend test` passes test 3 ("changing sortBy alone — with no other filter changes — triggers recomputation") and all other visible tests.

4. Changing `sortBy` alone (with no change to category, search, or inStockOnly) must immediately produce a reordered product list on the next render.
   - Verified by: test 3 in `tests/derivedStateCorrectness.test.tsx` ("changing sortBy alone...") — sets `sortBy` to `price-asc` without touching any other filter, then asserts `filteredProducts[0].name === 'Jump Rope'` ($15, cheapest). This test fails if `sortBy` is absent from the dependency array.

## Edge cases

- Sort applied with no active filters (all 15 products): covered by requirement 4 — test 3 sorts all 15 products and checks the first result.
- Sort applied after a category filter (smaller filtered set): covered by requirements 1 and 3 — tests 1, 2, and 4 each set a category then change `sortBy` in a separate `act()`.
- Multiple filters active simultaneously (category + inStockOnly or search + category): covered by requirement 1 — the filter-then-sort contract holds regardless of which combination of filters is active.
- Mutation persisting across render cycles: covered by requirement 2 — without a copy, a second sort triggered by a dep change would re-sort an already-mutated array, producing wrong order; hidden tests verify this.
- Default sort (no `sortBy` value / `sortBy === 'default'`): covered by requirement 1 — the filtered result is returned unsorted (insertion order) when no sort comparator applies; the code must not call `.sort()` in that branch.
