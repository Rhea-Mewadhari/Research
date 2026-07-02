# FE-T2-5: Derived State Correctness — useFilteredProducts

## Context

`useFilteredProducts` is the central hook that combines products from `ProductContext` with filter state
from `FilterContext` to produce the list of products shown in the UI. It wraps the filtering and sorting
logic in a `useMemo` to avoid recomputing on every render.

The hook has been introduced with **three bugs**. Your task is to identify and fix all of them.

## Broken behaviour

1. **Sort is applied before filtering.** The current implementation sorts the full product list first,
   then applies category, search, and inStock filters. The correct order is: filter first, then sort
   the result. With the current product dataset the output is the same either way (prices and ratings
   are globally unique), but the ordering dependency is architecturally wrong and breaks the contract
   that the sort acts on the _filtered_ set.

2. **The source array is mutated.** The implementation calls `products.sort(...)` directly on the array
   reference held in `ProductContext`. `Array.prototype.sort` sorts in-place, so `ProductContext`'s
   `products` array is permanently reordered the first time a sort is applied. Any subsequent filter
   change then operates on a mutated array rather than the original insertion order. Sort with `[...products].sort(...)` (or `products.slice().sort(...)`) to operate on a copy.

3. **`sortBy` is missing from the `useMemo` dependency array.** Because `sortBy` is not listed as a
   dependency, React skips re-running the memo when _only_ the sort option changes. The displayed order
   stays stale until some other dependency (e.g. category or search) triggers a recompute. Add `sortBy`
   to the dependency array.

## Requirements

- Filter the products in this order: search term → category → inStockOnly → sort.
- Sorting must produce a new array (no mutation of the context's `products` reference).
- All five values — `products`, `debouncedSearch`, `category`, `inStockOnly`, `sortBy` — must appear in
  the `useMemo` dependency array.
- Changing the sort dropdown alone must immediately reorder the visible product list.

## Decision surfaces

- **Where the sort lives**: you can implement sort logic directly in `useFilteredProducts`, or delegate to
  the existing `filterProducts` utility in `src/utils/productFilters.ts`. Either approach is valid.
- **Copy strategy**: spread (`[...arr]`) and `slice()` are both acceptable. `toSorted()` also works if
  you prefer a non-mutating built-in.

## Key trap

Bug 3 (missing dependency) is easy to fix in isolation — just add `sortBy` to the dep array. But fixing
Bug 3 while leaving Bug 2 makes the mutation visible. Once `sortBy` triggers a recompute, the sort call
runs, mutates `products`, and subsequent filter changes operate on the wrong base array. You must fix
**both** Bug 2 (no mutation) and Bug 3 (dep array) together.

Bug 1 (sort before filter) is architecturally incorrect even though the current fixture data does not
produce an observable difference in output.

## Files to modify

`src/hooks/useFilteredProducts.ts` (primary target)

Optionally: `src/utils/productFilters.ts` if you choose to delegate sort logic there.

## What the tests verify

**Visible tests** (`tests/derivedStateCorrectness.test.tsx`):
- Category + sort combined produces the correct filtered-then-sorted order.
- Changing `sortBy` alone — without changing any other filter — triggers a recomputation.

**Scoring note**: passing the visible tests demonstrates Bug 3 is fixed. Passing the hidden tests
also requires Bug 2 to be fixed (the mutation trap).
