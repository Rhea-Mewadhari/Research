# Requirements

1. Search matching is case-insensitive and ignores leading/trailing whitespace.
   `filterProducts` must normalize the search term with `.trim().toLowerCase()` and
   compare against `product.name.toLowerCase()`. The trimmed term must also be used for
   the truthiness gate — a whitespace-only input (`"   "`) must behave identically to an
   empty string (no search filter applied).
   - Verified by: `tests/filtering.test.tsx` — "filters products by search term" types
     lowercase `mouse` and asserts `Wireless Mouse` (capital W) appears and results-count
     reads `Showing 1 products`.

2. Sorting is applied **after** all filters (search, category, inStockOnly) have been
   applied. In `src/utils/productFilters.ts`, the sort block must be moved to execute on
   the fully-filtered `result` array, not on the unfiltered copy.
   - Verified by: `tests/sorting.test.tsx` — all three cases pass:
     - "sorts by price ascending" asserts exact order of all 15 names starting with
       `Jump Rope`.
     - "sorts by price descending" asserts `names[0] === 'Noise-Cancelling Headphones'`,
       `names[1] === 'Mechanical Keyboard'`, last item is `Jump Rope`.
     - "sorts by rating descending" asserts `names[0] === 'Yoga Mat'`,
       `names[1] === 'Mechanical Keyboard'`.

3. Default sort preserves original dataset order. When `sortBy === 'default'` no sort
   comparator is applied; items are returned in the order they appear in `products` after
   filtering.
   - Verified by: `tests/filtering.test.tsx` — all three filter tests pass without a
     sort step, meaning the returned order matches the data-source order (no spurious
     reordering introduced by the sort block).

4. Sorting must not mutate the input `products` array. The spread copy
   (`let result = [...products]`) must remain the first operation; all sort calls must
   operate on `result`, never on `products` directly.
   - Verified by: `tests/sorting.test.tsx` — sequential sort tests each render a fresh
     `<App />` and get consistent results, confirming no shared-array side-effects.

5. "Clear filters" resets ALL filter fields including `sortBy`. The `onClick` handler on
   the Clear filters button in `src/components/FilterPanel.tsx` must emit a `FilterState`
   with `search: ''`, `category: 'All'`, `inStockOnly: false`, AND `sortBy: 'default'`.
   - Verified by: `tests/clearFilters.test.tsx` — after setting search, category, and
     inStockOnly then clicking "Clear filters":
     - search input value is `''`
     - category select value is `'All'`
     - inStockOnly checkbox is unchecked
     - sortBy select value is `'default'`
     - results-count reads `Showing 15 products`

6. Filters combine additively (AND logic). Search, category, and inStockOnly must each
   reduce the set produced by the previous step; no filter may start over from the full
   dataset or override a previous filter's result.
   - Verified by: `tests/filtering.test.tsx` — "filters products by in-stock only"
     asserts exactly 11 products remain (15 total minus 4 out-of-stock items), confirming
     the inStockOnly filter does not reset category or search state.

---

## Edge cases

- **Whitespace-only search (`"   "`)**: after `.trim()` yields `""` which is falsy — the
  search filter is skipped and all products pass. Covered by requirement 1.
- **Search matches product name only**: the `.includes()` check is against `product.name`
  exclusively; no match against category or any other field. Covered by requirement 1.
- **`sortBy === 'default'`**: no comparator runs; original insertion order is preserved.
  Covered by requirement 3.
- **Sort applied to filtered subset**: when both a category filter and sort are active,
  sorting must order only the items that passed the category filter, not the full dataset.
  Covered by requirement 2.
- **Clear filters with active sort**: if `sortBy` is `'price-asc'` when Clear is clicked,
  the emitted state must include `sortBy: 'default'`, resetting the sort control to its
  default value. Covered by requirement 5.
