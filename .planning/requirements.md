# Requirements

1. Filtering must be applied before sorting: the `useMemo` body in `useFilteredProducts.ts` must first run all three filter steps (search term → category → inStockOnly) on the full `products` array, and only then sort the resulting subset.
   - Verified by: `tests/derivedStateCorrectness.test.tsx` — tests 1, 2, and 4 set a category filter then a sort and assert the returned names match the expected filter-then-sort order (e.g. only Fitness products returned by the price-asc test, not all products sorted by price).

2. The sort operation must not mutate the `products` array stored in `ProductContext`. The implementation must copy the array before sorting — using `[...arr].sort(...)`, `arr.slice().sort(...)`, or `arr.toSorted(...)` — so `ProductContext`'s reference is unchanged after any sort is applied.
   - Verified by: hidden tests that apply a sort, then change a filter, and assert the unfiltered product count is still 15 (i.e. the original insertion order is preserved). Structural check: no bare `products.sort(...)` call appears in `useFilteredProducts.ts`.

3. `sortBy` must appear in the `useMemo` dependency array alongside `products`, `debouncedSearch`, `category`, and `inStockOnly` — all five dependencies must be present.
   - Verified by: `tests/derivedStateCorrectness.test.tsx` — test 3 ("changing sortBy alone — with no other filter changes — triggers recomputation") sets `sortBy` to `'price-asc'` in a separate `act()` after all other deps are stable and asserts the first product is `'Jump Rope'` ($15). If `sortBy` is absent from the dep array the memo is not re-run and the assertion fails.

4. When `sortBy` is `'price-asc'` the filtered result must be sorted by `price` ascending; when `'price-desc'` by `price` descending; when `'rating-desc'` by `rating` descending. When `sortBy` is the default (no sort) the insertion order of the filtered set must be preserved.
   - Verified by: `tests/derivedStateCorrectness.test.tsx` — tests 1, 2, and 4 assert specific name orderings for `price-asc` within Fitness, `price-desc` within Electronics, and `rating-desc` within Accessories respectively.

5. The only file changed must be `src/hooks/useFilteredProducts.ts` (and optionally `src/utils/productFilters.ts` if sort delegation is chosen). No test files under `tests/` may be modified.
   - Verified by: `git diff --name-only` after the fix shows only `src/benchmark-frontend/src/hooks/useFilteredProducts.ts` (and/or `src/benchmark-frontend/src/utils/productFilters.ts`); no path under `src/benchmark-frontend/tests/` appears in the diff.

## Edge cases

- Changing `sortBy` when no other filter is active (category = 'All', no search, inStockOnly = false): covered by requirement 3. All 15 products must be sorted correctly, not just filtered subsets.
- Applying a sort, then changing category: covered by requirement 2. Because the sort must not mutate `products`, subsequent filter changes still operate on the original 15-product array.
- `sortBy` default value (no sort selected): covered by requirement 4. The filtered set must be returned in its insertion order with no sort applied.
- All three filters active simultaneously with a sort: covered by requirement 1. The sort must act only on the set that passes all three filter predicates.
