# Requirements

1. `filterProducts` filters by name: only products whose `name` contains the trimmed, case-insensitive search term are returned. An empty or whitespace-only search term matches all products.
   - Verified by: `filtering.test.tsx` — "filters products by search term" types 'mouse' and expects exactly 1 result ('Wireless Mouse' visible, 'Yoga Mat' absent, results-count shows "Showing 1 products")

2. `filterProducts` filters by category: only products whose `category` exactly equals `filters.category` are returned. When `filters.category` is `"All"`, no category filter is applied and all products are returned.
   - Verified by: `filtering.test.tsx` — "filters products by category" selects 'Fitness' and expects 5 results (yoga mat, resistance bands, foam roller visible; wireless mouse absent)

3. `filterProducts` filters by in-stock status: when `filters.inStockOnly` is `true`, only products where `inStock === true` are returned. When `filters.inStockOnly` is `false`, all products are returned regardless of stock status.
   - Verified by: `filtering.test.tsx` — "filters products by in-stock only" clicks the checkbox and expects 11 results (USB-C Hub, Noise-Cancelling Headphones, Dumbbell Set, Desk Lamp absent)

4. `filterProducts` sorts results: `price-asc` orders by price ascending, `price-desc` orders by price descending, `rating-desc` orders by rating descending, `default` preserves original order. Sorting is applied after all filters.
   - Verified by: `sorting.test.tsx` — "sorts by price ascending" checks exact full product name order; "sorts by price descending" checks first=Noise-Cancelling Headphones, second=Mechanical Keyboard, last=Jump Rope; "sorts by rating descending" checks first=Yoga Mat, second=Mechanical Keyboard

5. `filterProducts` does not mutate the input array. The original `products` array passed in must remain in its original order after the function returns.
   - Verified by: `sorting.test.tsx` — multiple sorting tests render App multiple times, each rendering from the same unmodified source data; a second render showing the full 15 products in default order after a previous sort-by-price test confirms the input was not mutated

6. `FilterPanel` search input calls `onChange` with `{ ...filters, search: e.target.value }` on every keystroke. The `onChange: _onChange` rename in the destructuring must be corrected to make `onChange` callable.
   - Verified by: `filtering.test.tsx` — "filters products by search term" types into the search input (found by label text "Search") and sees the product list update

7. `FilterPanel` category `<select>` calls `onChange` with `{ ...filters, category: e.target.value }` when a new option is selected.
   - Verified by: `filtering.test.tsx` — "filters products by category" selects 'Fitness' from the dropdown (found by label text "Category") and sees the product list update

8. `FilterPanel` in-stock checkbox calls `onChange` with `{ ...filters, inStockOnly: e.target.checked }` when toggled.
   - Verified by: `filtering.test.tsx` — "filters products by in-stock only" clicks the checkbox (found by label text "In-stock only") and sees the product list update

9. `FilterPanel` "Clear filters" button calls `onChange` with the reset FilterState `{ search: '', category: 'All', inStockOnly: false, sortBy: 'default' }` when clicked.
   - Verified by: `clearFilters.test.tsx` — "resets filters back to default values" clicks "Clear filters" after applying search, category, and in-stock filters; asserts all four controls return to default values and results-count shows "Showing 15 products"

10. `SortSelect` sort `<select>` calls `onChange` with the selected sort value (cast to `FilterState['sortBy']`) when a new option is selected. The `onChange: _onChange` rename in the destructuring must be corrected to make `onChange` callable.
    - Verified by: `sorting.test.tsx` — all three sort tests select a sort option (found by label text "Sort by") and see the product list reorder accordingly

11. In `App.tsx`, the handler passed to `FilterPanel` as `onChange` calls both `setFilters(nextFilters)` and `setPage(1)`. The raw `setFilters` must not be passed directly.
    - Verified by: code inspection of `App.tsx` confirms `FilterPanel` receives a wrapper function, not `setFilters` itself; the wrapper body contains both a `setFilters(...)` call and a `setPage(1)` call

12. In `App.tsx`, the handler passed to `SortSelect` as `onChange` calls both `setFilters(prev => ({ ...prev, sortBy }))` and `setPage(1)`. The current partial wrapper omits `setPage(1)`.
    - Verified by: code inspection of `App.tsx` confirms the `SortSelect` `onChange` wrapper body contains `setPage(1)` in addition to the existing `setFilters` call

13. The project builds without TypeScript errors.
    - Verified by: running `pnpm build` in `src/benchmark-frontend/` exits with code 0

14. All visible tests pass.
    - Verified by: running `pnpm test --run` in `src/benchmark-frontend/` exits with code 0, with all tests in `tests/app.render.test.tsx`, `tests/filtering.test.tsx`, `tests/sorting.test.tsx`, `tests/clearFilters.test.tsx`, `tests/pagination.test.tsx`, and `tests/loadingError.test.tsx` reporting as passed

## Edge cases

- Search term with leading/trailing whitespace (e.g. `" mouse "`): covered by requirement 1 — trim is applied before matching
- `category: "All"`: covered by requirement 2 — treated as "no filter", all products returned
- `inStockOnly: false`: covered by requirement 3 — no filtering by stock, all products returned
- `sortBy: "default"`: covered by requirement 4 — no sort applied, original order preserved
- Mutating the input array during sort: covered by requirement 5 — sort must operate on a copy (`[...products].sort(...)`)
- Clear Filters also resets `sortBy` to `"default"`: covered by requirement 9 — the reset object includes `sortBy: 'default'`, confirmed by `clearFilters.test.tsx` asserting `getByLabelText(/sort by/i)` has value `"default"`
- Filter change while on page > 1: covered by requirements 11 and 12 — any filter or sort change calls `setPage(1)`
