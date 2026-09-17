# Requirements

1. `filterProducts` filters by name: given a non-empty `filters.search`, only products whose `name` contains the trimmed search string (case-insensitive) are returned.
   - Verified by: `tests/filtering.test.tsx` — "filters products by search term" test types `'mouse'` into the search input and expects exactly one product (`Wireless Mouse`) visible and `results-count` showing `Showing 1 products`.

2. `filterProducts` filters by category: when `filters.category` is not `"All"`, only products whose `category` exactly matches `filters.category` are returned; when `filters.category` is `"All"`, no category filtering is applied.
   - Verified by: `tests/filtering.test.tsx` — "filters products by category" test selects `'Fitness'` and expects exactly 5 products (`Yoga Mat`, `Resistance Bands`, `Foam Roller` visible; `Wireless Mouse` absent; count shows `Showing 5 products`).

3. `filterProducts` filters by in-stock status: when `filters.inStockOnly` is `true`, only products where `inStock === true` are returned; when `false`, all products pass.
   - Verified by: `tests/filtering.test.tsx` — "filters products by in-stock only" test clicks the checkbox and expects `USB-C Hub`, `Noise-Cancelling Headphones`, `Dumbbell Set`, and `Desk Lamp` to be absent, with count showing `Showing 11 products`.

4. `filterProducts` sorts output after filtering — `price-asc` by `product.price` ascending, `price-desc` descending, `rating-desc` by `product.rating` descending. `sortBy: 'default'` leaves order unchanged. The input array must not be mutated.
   - Verified by: `tests/sorting.test.tsx` — all three sort tests assert exact heading order (`price-asc` full list, `price-desc` first/last, `rating-desc` first two). Non-mutation verified structurally: implementation must use `[...products].sort()` or `filter().sort()` patterns, never `products.sort()` directly.

5. `FilterPanel.tsx` search input `onChange` handler calls the `onChange` prop with the updated `FilterState` (spreading existing filters and setting `search` to the new input value).
   - Verified by: `tests/filtering.test.tsx` — "filters products by search term" test types into the element found by `getByLabelText(/search/i)` and expects the product list to update. If the handler is a no-op, the list will not change and the test will fail.

6. `FilterPanel.tsx` category `<select>` `onChange` handler calls the `onChange` prop with `category` set to the selected option value.
   - Verified by: `tests/filtering.test.tsx` — "filters products by category" test uses `selectOptions` on `getByLabelText(/category/i)` and expects the product list to update.

7. `FilterPanel.tsx` in-stock `<input type="checkbox">` `onChange` handler calls the `onChange` prop with `inStockOnly` set to the checkbox's new `checked` value.
   - Verified by: `tests/filtering.test.tsx` — "filters products by in-stock only" test clicks the element found by `getByLabelText(/in-stock only/i)` and expects the product list to update.

8. `FilterPanel.tsx` Clear Filters button `onClick` calls the `onChange` prop with the default filter values: `{ search: '', category: 'All', inStockOnly: false, sortBy: 'default' }`.
   - Verified by: `tests/clearFilters.test.tsx` — after typing a search, selecting a category, and checking in-stock, clicking the button found by `getByRole('button', { name: /clear filters/i })` must restore all four controls to their defaults and the results count to `Showing 15 products`.

9. `SortSelect.tsx` sort `<select>` `onChange` handler calls the `onChange` prop with the selected sort key.
   - Verified by: `tests/sorting.test.tsx` — all three sort tests use `selectOptions` on `getByLabelText(/sort by/i)` and expect the product order to change.

10. `App.tsx` wraps `setFilters` in a handler (`handleFiltersChange`) that calls both `setFilters(next)` and `setPage(1)` together, and passes this wrapper to `FilterPanel` (`onChange`) and `SortSelect` (`onChange`) instead of the raw `setFilters`.
    - Verified by: `tests/pagination.test.tsx` — existing page tests continue to pass (no regression). The wrapper is required structurally per the task spec; any direct `setFilters` pass-through to child components is a defect. Confirmed by `tests/clearFilters.test.tsx` which applies multiple filter changes and expects a full result set (consistent with page being reset).

11. The category `<select>` in `FilterPanel.tsx` is populated exclusively from the `categories` prop (which `App.tsx` derives dynamically from the fetched product data via `useMemo`). No hardcoded category list exists anywhere in the component tree.
    - Verified by: `tests/filtering.test.tsx` — "filters products by category" test selects `'Fitness'` which must exist as a rendered `<option>`; it is absent from any static list in the component and must come from fetched data. Build-time TypeScript check confirms `categories` prop is consumed.

12. The project TypeScript build succeeds with no type errors in any modified file.
    - Verified by: `pnpm --filter benchmark-frontend build` exits with code 0.

13. All visible test suites pass: `app.render.test.tsx`, `clearFilters.test.tsx`, `filtering.test.tsx`, `loadingError.test.tsx`, `pagination.test.tsx`, `sorting.test.tsx`.
    - Verified by: `pnpm --filter benchmark-frontend test --run` exits with code 0 and zero failing tests.

## Edge cases

- Search with leading/trailing whitespace (e.g. `" mouse "`): trimmed before matching — covered by requirement 1 (trim is explicit in the spec and the implementation must handle it).
- `inStockOnly: false` + `category: "All"` + `search: ""` returns all products unmodified — covered by requirement 13 (app.render test expects `Showing 15 products` on initial load with default filters).
- `sortBy: 'default'` does not reorder the returned array — covered by requirement 4.
- `filterProducts` called with an empty products array returns an empty array without error — covered by requirements 1–4 (no crash on empty input is an implicit correctness expectation; the sort/filter operations on `[]` must not throw).
- Clear Filters resets `sortBy` to `'default'` as well, not just the search/category/inStockOnly fields — covered by requirement 8 (the full default state is specified).
- Changing a filter while on page 2+ resets to page 1 — covered by requirement 10; the wrapper must always call `setPage(1)` regardless of which field changes.
