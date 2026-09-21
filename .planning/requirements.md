# Requirements

1. Filtering must be applied before sorting: the hook processes search term → category → inStockOnly first, then sorts the resulting subset.
   - Verified by: `tests/derivedStateCorrectness.test.tsx` — all four tests set a category filter then change `sortBy` in a separate `act()` call; the expected product order assumes sort acts on the already-filtered subset (e.g. "price-asc sort within Fitness category" expects only the five Fitness products sorted by price, not all 15 products sorted then filtered).

2. Sorting must not mutate the `products` array held by `ProductContext`: the hook must produce a new array (via `[...products].sort(...)`, `products.slice().sort(...)`, or `.toSorted()`) rather than calling `products.sort(...)` directly.
   - Verified by: hidden tests that (a) apply a sort, then (b) change a filter and assert the filtered result is drawn from the original insertion order — a mutated context array would produce the wrong base set. Also verifiable by reading `useFilteredProducts.ts` and confirming no bare `products.sort(...)` call exists.

3. `sortBy` must appear in the `useMemo` dependency array so that changing the sort dropdown alone — with no other filter value changing — immediately triggers a recomputation and reorders the visible list.
   - Verified by: `tests/derivedStateCorrectness.test.tsx` — the test "changing sortBy alone — with no other filter changes — triggers recomputation" changes only `sortBy` (no prior category/search/inStock change) and asserts `filteredProducts[0].name === 'Jump Rope'`; if `sortBy` is absent from the dep array the memo is not re-run and the assertion fails.

4. All five values — `products`, `debouncedSearch`, `category`, `inStockOnly`, and `sortBy` — must appear in the `useMemo` dependency array (no additions, no omissions from those five).
   - Verified by: reading the final `useFilteredProducts.ts` and confirming the dep array is `[products, debouncedSearch, category, inStockOnly, sortBy]`.

5. The hook's return type and public interface (`filteredProducts`, `resultCount`) must be unchanged.
   - Verified by: the TypeScript compiler producing no type errors (`pnpm --filter benchmark-frontend exec tsc --noEmit`) and all four visible tests passing without modification to any test file.

## Edge cases

- `sortBy` set to the default/none value with active filters: covered by requirements 1 and 3 — unsorted path must still apply all three filters in order.
- Sort applied, then category changed: covered by requirement 2 — the category filter must operate on the original `products` array from context, not a previously-sorted (mutated) copy.
- Multiple filters active simultaneously when `sortBy` changes: covered by requirement 1 — sort is always the last step, applied to whatever subset the three filters produce.
- `debouncedSearch` and `category` both active with a sort: covered by requirement 1 — search filtering occurs first, then category, then inStock, then sort.
