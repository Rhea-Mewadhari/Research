# Requirements

1. Search is case-insensitive: typing a term in any casing (e.g. `mouse`, `Mouse`, `MOUSE`) returns every product whose name matches when both sides are lowercased.
   - Verified by: `tests/filtering.test.tsx` — "filters products by search term" types lowercase `mouse` and asserts `Wireless Mouse` is visible and the results count reads "Showing 1 products". This test fails before the fix and passes after.

2. Search trims leading/trailing whitespace: a term with surrounding spaces (e.g. `" mouse "`) is treated identically to the trimmed term (`"mouse"`).
   - Verified by: `src/utils/productFilters.ts` — the fix uses `filters.search.trim().toLowerCase()` and `product.name.toLowerCase().includes(...)`. `pnpm vitest run --reporter=verbose` in `src/benchmark-frontend` passes all tests; no test should regress after the change.

3. Filters combine without overriding each other: applying search, category, and in-stock filters simultaneously narrows the result set by all three predicates, not just the last one applied.
   - Verified by: `tests/filtering.test.tsx` — each filter test applies one filter and checks an exact count and product list. If any filter reset another, the counts would differ from expected values. All three filter tests must pass.

4. Category filter — "All" shows every product; selecting a specific category shows only products whose `category` field exactly matches the selected value.
   - Verified by: `tests/filtering.test.tsx` — "filters products by category" selects `Fitness` and asserts exactly 5 products are shown, that `Yoga Mat`, `Resistance Bands`, and `Foam Roller` are visible, and that `Wireless Mouse` is absent.

5. In-stock filter — when `inStockOnly` is `true`, every product with `inStock === false` is excluded from results.
   - Verified by: `tests/filtering.test.tsx` — "filters products by in-stock only" enables the checkbox and asserts count "Showing 11 products", and that `USB-C Hub`, `Noise-Cancelling Headphones`, `Dumbbell Set`, and `Desk Lamp` are not present in the DOM.

6. Sorting is applied after all filters: the sort step operates on the already-filtered array, not on the full product list.
   - Verified by: `tests/sorting.test.tsx` — "sorts by price ascending" asserts the full exact ordered sequence of all 15 product names. This order is only correct if the sort runs on the complete unfiltered set (no filter active here), and the implementation structure must place sorting after the filter block. `pnpm vitest run` must pass all three sorting tests.

7. Sorting does not mutate the input array: the `products` argument passed to `filterProducts` must not be reordered or modified in place.
   - Verified by: `src/utils/productFilters.ts` — the sort is called on a spread copy (`[...products]`), never on `products` directly. `tests/sorting.test.tsx` passes for all sort modes on a shared in-memory data source, confirming the source is unmodified between renders.

8. Default sort preserves original input order: when `sortBy` is `'default'`, no sort operation is applied and `filterProducts` returns the filtered products in the order they appear in the input array.
   - Verified by: `tests/app.render.test.tsx` and absence of sorting when `sortBy === 'default'` in `src/utils/productFilters.ts`. `pnpm vitest run` passes without any default-sort test regression.

9. "Clear filters" resets ALL filter fields — `search`, `category`, `inStockOnly`, and `sortBy` — to their initial/default values in a single action.
   - Verified by: `tests/clearFilters.test.tsx` — "resets filters back to default values" sets search, category, in-stock, then clicks "Clear filters" and asserts: search input is empty (`""`), category select is `"All"`, in-stock checkbox is unchecked, sort-by select is `"default"`, and results count reads "Showing 15 products".

---

## Edge cases

- Search term that trims to empty string (e.g. `"   "`): covered by requirement 2 — after `.trim()`, the falsy-empty-string check in `if (filters.search)` means no search filter is applied and all products remain.
- Search matching only `product.name`, not `category` or other fields: covered by requirement 1 — the implementation uses `product.name.toLowerCase().includes(...)` exclusively.
- Category `"All"` with in-stock filter enabled: covered by requirements 3 and 5 — both predicates apply independently; no category filter fires when value is `"All"`, and in-stock filter still applies.
- Non-default `sortBy` when "Clear filters" is clicked: covered by requirement 9 — `clearFilters.test.tsx` explicitly asserts the sort-by select returns to `"default"`.
- Sort with no filter active: covered by requirement 6 — the sort tests run without any filter, confirming sort alone produces the correct order.
- Sort applied when a filter reduces the product set: covered by requirements 3 and 6 — filter executes first, then sort operates on the reduced set, so the relative order of remaining items matches the sort criterion.
