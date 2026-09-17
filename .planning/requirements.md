# Requirements

1. `filterProducts` filters by search: only products whose `name` contains the trimmed, case-insensitive `filters.search` value are returned. An empty or whitespace-only `search` applies no filter (all products pass).
   - Verified by: `filtering.test.tsx` — typing "mouse" produces exactly 1 result ("Wireless Mouse"); all other products are absent.

2. `filterProducts` filters by category: only products whose `category` exactly matches `filters.category` are returned. When `filters.category === "All"`, no category filter is applied.
   - Verified by: `filtering.test.tsx` — selecting "Fitness" shows exactly 5 products and excludes "Wireless Mouse"; `clearFilters.test.tsx` — after clear, category resets to "All" and 15 products are shown.

3. `filterProducts` filters by in-stock status: when `filters.inStockOnly === true`, only products where `product.inStock === true` are returned. When `false`, all products pass regardless of stock status.
   - Verified by: `filtering.test.tsx` — checking in-stock shows exactly 11 products; USB-C Hub, Noise-Cancelling Headphones, Dumbbell Set, and Desk Lamp are absent from the DOM.

4. `filterProducts` sorts by price ascending: when `filters.sortBy === "price-asc"`, the returned array is ordered by `product.price` from lowest to highest.
   - Verified by: `sorting.test.tsx` — "sorts by price ascending": the complete ordered list of all 15 h3 headings matches the expected array exactly (Jump Rope first, Noise-Cancelling Headphones last).

5. `filterProducts` sorts by price descending: when `filters.sortBy === "price-desc"`, the returned array is ordered by `product.price` from highest to lowest.
   - Verified by: `sorting.test.tsx` — "sorts by price descending": first element is "Noise-Cancelling Headphones", second is "Mechanical Keyboard", last is "Jump Rope".

6. `filterProducts` sorts by rating descending: when `filters.sortBy === "rating-desc"`, the returned array is ordered by `product.rating` from highest to lowest.
   - Verified by: `sorting.test.tsx` — "sorts by rating descending": first element is "Yoga Mat", second is "Mechanical Keyboard".

7. `filterProducts` applies sort after all filters: the sort is applied to the already-filtered result, not to the raw input.
   - Verified by: `sorting.test.tsx` sort tests operate on the unfiltered 15-product set and expect exact orderings — if sorting ran before filtering the count would be wrong; `filtering.test.tsx` category + search tests implicitly confirm this order-of-operations.

8. `filterProducts` does not mutate the input array: the original `products` array is not modified in place; a new array is always returned.
   - Verified by: `sorting.test.tsx` — multiple sort tests render `App` independently; if the array were mutated, a later sort test's "default" rendering would produce already-sorted output and produce wrong orderings. Framework data integrity standard also prohibits mutation.

9. `filterProducts` preserves original order when `sortBy === "default"`: no reordering is applied; the filtered products appear in their original order from the API response.
   - Verified by: `app.render.test.tsx` — initial render shows 15 products with default sort; `filtering.test.tsx` filter tests check specific products are present/absent but do not assert order, meaning default must be stable.

10. `FilterPanel` search input `onChange` is wired: each keystroke in the `id="search"` input calls the `onChange` prop with the updated `FilterState` where `search` reflects the current input value.
    - Verified by: `filtering.test.tsx` — typing "mouse" reduces results to 1; `clearFilters.test.tsx` — typing "lamp" then clearing resets input to empty string.

11. `FilterPanel` category select `onChange` is wired: selecting an option in the `id="category"` select calls the `onChange` prop with the updated `FilterState` where `category` is the selected value.
    - Verified by: `filtering.test.tsx` — selecting "Fitness" shows 5 products; `clearFilters.test.tsx` — selecting "Accessories" then clearing resets select to "All".

12. `FilterPanel` inStockOnly checkbox `onChange` is wired: clicking the `id="inStockOnly"` checkbox calls the `onChange` prop with the updated `FilterState` where `inStockOnly` is toggled.
    - Verified by: `filtering.test.tsx` — clicking the checkbox reduces results to 11; `clearFilters.test.tsx` — checking then clearing resets checkbox to unchecked state.

13. `FilterPanel` Clear Filters button resets all filter state: clicking the "Clear filters" button calls the `onChange` prop with the full default `FilterState`: `{ search: '', category: 'All', inStockOnly: false, sortBy: 'default' }`.
    - Verified by: `clearFilters.test.tsx` — after setting search "lamp", category "Accessories", checking in-stock, then clicking "Clear filters": search input value is `""`, category select value is `"All"`, in-stock checkbox is unchecked, sort select value is `"default"`, and results-count reads "Showing 15 products".

14. `SortSelect` sort select `onChange` is wired: selecting an option in the `id="sortBy"` select calls the `onChange` prop with the new value cast to `FilterState['sortBy']`.
    - Verified by: `sorting.test.tsx` — selecting "price-asc" produces a fully reordered list; selecting "rating-desc" puts "Yoga Mat" first. `clearFilters.test.tsx` — sort select resets to "default" after Clear Filters (confirming it is controlled by `FilterState.sortBy`).

15. `App.tsx` wraps filter updates to reset page to 1: the `onChange` prop passed to `FilterPanel` and the `onChange` prop passed to `SortSelect` are both wrapper functions that call `setFilters` with the new state AND call `setPage(1)` — neither `setFilters` nor a bare inline lambda that omits `setPage(1)` is passed directly.
    - Verified by: `App.tsx` source code inspection — neither prop passes `setFilters` directly or uses a lambda that omits `setPage(1)`. Behavioral check: `pagination.test.tsx` — page navigation works; any filter interaction while on a later page would result in page 1 being shown (code path confirmed by source inspection since no visible test covers this combined scenario).

16. Protected files are not modified: `src/api/productsApi.ts` and `src/hooks/useProductFilters.ts` are unchanged.
    - Verified by: `git diff` shows no changes to those two files.

17. TypeScript build succeeds: `pnpm build` in `src/benchmark-frontend/` exits with code 0 and emits no type errors.
    - Verified by: `pnpm build` stdout/stderr and exit code.

18. All visible tests pass: `pnpm test` in `src/benchmark-frontend/` exits with code 0 with all tests in `tests/` reported as passed.
    - Verified by: `pnpm test` output showing 0 failed tests.

---

## Edge cases

- Search whitespace-only (e.g., `"   "`): trimming yields `""`, which matches all products — no filter applied: covered by requirement 1.
- Search is case-insensitive: `"MOUSE"` matches `"Wireless Mouse"`: covered by requirement 1.
- Category `"All"` passes every product regardless of category value: covered by requirement 2.
- `inStockOnly: false` applies no stock filter: covered by requirement 3.
- `sortBy: "default"` preserves the original API-response order: covered by requirement 9.
- Clear Filters resets `sortBy` to `"default"` as well as the three FilterPanel-local fields: covered by requirement 13.
- Multiple filters combined (e.g., search + category + inStockOnly simultaneously) all apply together in sequence: covered by requirements 1–3 being independent filter steps inside a single `filterProducts` call.
- Pagination reset applies to both `FilterPanel` changes and `SortSelect` changes: covered by requirement 15.
