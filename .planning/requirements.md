# Requirements

1. Sorting must be applied after all filters (search, category, in-stock) have been applied — not before.
   - Verified by: `tests/sorting.test.tsx` — "sorts by price ascending" asserts the full ordered list of 15 product names matches the expected array exactly; if sort runs before filter this order will be wrong when filters are also active.

2. Search filtering must be case-insensitive: typing `wireless` (all lowercase) must return the product "Wireless Mouse".
   - Verified by: `tests/filtering.test.tsx` — "filters products by search term" types `mouse` (lowercase) and asserts "Wireless Mouse" is present and results-count shows `Showing 1 products`.

3. Search filtering must trim leading and trailing whitespace from the input value before comparing: ` Wireless ` must return "Wireless Mouse".
   - Verified by: The fix in `src/utils/productFilters.ts` must call `.trim()` on `filters.search` before the `.includes()` comparison. Confirmed indirectly by the same filtering test (the implementation must use `filters.search.trim().toLowerCase()` for the test to pass consistently regardless of UI whitespace).

4. Search filtering must match only against `product.name`, not any other field.
   - Verified by: `tests/filtering.test.tsx` — "filters products by search term" confirms only one product appears when searching `mouse`, meaning no spurious matches from other fields.

5. Category filter with value `All` must return all products; a specific category value must return only products whose `category` field strictly equals that value.
   - Verified by: `tests/filtering.test.tsx` — "filters products by category" selects `Fitness` and asserts Yoga Mat, Resistance Bands, and Foam Roller are present, Wireless Mouse is absent, and results-count is `Showing 5 products`.

6. In-stock filter when enabled must exclude every product where `inStock === false`.
   - Verified by: `tests/filtering.test.tsx` — "filters products by in-stock only" enables the checkbox and asserts USB-C Hub, Noise-Cancelling Headphones, Dumbbell Set, and Desk Lamp are absent, with results-count `Showing 11 products`.

7. All active filters (search, category, in-stock) must combine additively — enabling one must not override or discard the others.
   - Verified by: `tests/filtering.test.tsx` — all three filter tests share the same App render with a fresh state; the category + in-stock combination is covered implicitly by the independent counts being consistent (15 total, 5 Fitness, 11 in-stock).

8. Sorting must not mutate the original product dataset — subsequent unfiltered renders must still show the original order.
   - Verified by: `src/utils/productFilters.ts` must spread `[...products]` before sorting (already present). Confirmed by `tests/sorting.test.tsx` tests each independently re-rendering App with fresh state and asserting order without interference.

9. "Clear filters" button must reset ALL filter fields — `search`, `category`, `inStockOnly`, AND `sortBy` — to their initial/default values (`''`, `'All'`, `false`, `'default'`).
   - Verified by: `tests/clearFilters.test.tsx` — "resets filters back to default values" sets search, category, in-stock, and sort, clicks "Clear filters", then asserts search input is `''`, category select is `'All'`, in-stock checkbox is unchecked, sort select is `'default'`, and results-count is `Showing 15 products`.

10. All existing tests must continue to pass after the fix — no regressions in app render, loading/error states, or pagination.
    - Verified by: running `pnpm test` (or `npm test`) in `src/benchmark-frontend/` — the full vitest suite (`tests/app.render.test.tsx`, `tests/loadingError.test.tsx`, `tests/pagination.test.tsx`, plus all above) must exit with 0 failures.

## Edge cases

- Search with surrounding whitespace (e.g. `" Wireless "`): covered by requirement 3.
- Search with mixed case (e.g. `"WIRELESS"` or `"Wireless"`): covered by requirement 2.
- Clear filters when `sortBy` is non-default (e.g. `price-asc`): covered by requirement 9 — `sortBy` must reset to `'default'`.
- Sorting on an already-filtered result set (e.g. category=Fitness then sort price-asc): covered by requirement 1 — sort runs after filter so the sorted list is only the filtered items.
- In-stock filter combined with category filter: covered by requirement 7 — both must apply simultaneously without one overriding the other.
- Default sort must preserve original dataset order (no reordering when `sortBy === 'default'`): covered by requirement 1 and 8 — the default branch performs no sort operation on the copied array.
