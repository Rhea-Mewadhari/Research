# Requirements

1. Filtering must be applied before sorting: the `useMemo` body in `useFilteredProducts.ts` must apply all three filters (search term, category, inStockOnly) to `products` first, and only then sort the filtered result. Sort must not be the first operation.
   - Verified by: `pnpm --filter benchmark-frontend test` — the "price-asc sort within Fitness category produces correct order" test (`derivedStateCorrectness.test.tsx:20`) passes, confirming that only Fitness products appear sorted by price (not the full 15-product list sorted then filtered).

2. Sorting must not mutate the `products` array held in `ProductContext`. The implementation must create a copy of the array before sorting — using `[...products].sort(...)`, `products.slice().sort(...)`, or `products.toSorted(...)` — so that `ProductContext`'s reference is never reordered in place.
   - Verified by: `pnpm --filter benchmark-frontend test` — hidden tests pass (they apply a sort, then change a filter, and assert the resulting set is drawn from the original insertion-order array, not a pre-sorted one). Locally verifiable by inspecting `src/hooks/useFilteredProducts.ts`: no bare `products.sort(...)` call (without a preceding spread/slice) exists in the file.

3. All five values consumed inside the `useMemo` — `products`, `debouncedSearch`, `category`, `inStockOnly`, and `sortBy` — must appear in the dependency array of the `useMemo` call in `src/hooks/useFilteredProducts.ts`.
   - Verified by: reading `src/hooks/useFilteredProducts.ts` and confirming the dependency array contains exactly (or at least) `[products, debouncedSearch, category, inStockOnly, sortBy]`.

4. Changing `sortBy` alone (with no change to any other filter) must cause `useMemo` to recompute and return a reordered product list immediately.
   - Verified by: `pnpm --filter benchmark-frontend test` — the "changing sortBy alone — with no other filter changes — triggers recomputation" test (`derivedStateCorrectness.test.tsx:76`) passes, asserting that after a `price-asc` sort the first product is `Jump Rope` ($15) rather than `Wireless Mouse` (insertion-order first).

## Edge cases

- Applying sort after filter in the same `useMemo` call (fixing Bug 1) but still calling `products.sort(...)` directly: covered by requirement 2 — the copy check is independent of order.
- Adding `sortBy` to the dep array (fixing Bug 3) while leaving the mutating sort: covered by requirement 2 — once `sortBy` triggers a recompute, each recompute mutates `products`; hidden tests catch this state corruption.
- `sortBy` set to its default value (no explicit sort): covered by requirement 1 — the fallthrough `result = [...products]` (copy with no comparator) must still be the post-filter array, not the pre-filter array.
- `category` = `'All'` with a non-default `sortBy`: covered by requirement 4 — the all-products test uses no category filter, confirming sort-only changes propagate.
