# Requirements

1. `filterProducts` in `src/utils/productFilters.ts` filters by search term: given a non-empty `search` string, only products whose `name` contains the trimmed search value (case-insensitive, partial match) are returned.
   - Verified by: `tests/filtering.test.tsx` — "filters products by search term": typing `'mouse'` in the search input leaves only "Wireless Mouse" visible and `results-count` reads "Showing 1 products".

2. `filterProducts` filters by category: when `category` is not `'All'`, only products whose `category` field exactly matches the selected value are returned; when `category` is `'All'`, all products pass through.
   - Verified by: `tests/filtering.test.tsx` — "filters products by category": selecting `'Fitness'` shows 5 products (Yoga Mat, Resistance Bands, Foam Roller included) and hides Wireless Mouse; selecting `'All'` (default) shows all products.

3. `filterProducts` filters by in-stock status: when `inStockOnly` is `true`, only products with `inStock === true` are returned.
   - Verified by: `tests/filtering.test.tsx` — "filters products by in-stock only": checking the checkbox removes USB-C Hub, Noise-Cancelling Headphones, Dumbbell Set, and Desk Lamp, leaving 11 products shown.

4. `filterProducts` sorts results: `'price-asc'` produces ascending price order, `'price-desc'` produces descending price order, `'rating-desc'` produces descending rating order, and `'default'` preserves the original (unmodified) input order. Sorting is applied after filtering.
   - Verified by: `tests/sorting.test.tsx` — "sorts by price ascending": all 15 h3 headings match the exact expected array starting with "Jump Rope"; "sorts by price descending": first is "Noise-Cancelling Headphones", second is "Mechanical Keyboard", last is "Jump Rope"; "sorts by rating descending": first is "Yoga Mat", second is "Mechanical Keyboard".

5. `filterProducts` does not mutate its input array: the original `products` array passed in is unchanged after the function returns.
   - Verified by: `tests/sorting.test.tsx` passing (sorting uses `[...products].sort(...)` not `products.sort(...)`); additionally `pnpm --filter benchmark-frontend build` completes without error.

6. `FilterPanel` search input calls `onChange` with an updated `FilterState` (spreading previous filters, setting `search` to the current input value) on every keystroke.
   - Verified by: `tests/filtering.test.tsx` — "filters products by search term" and `tests/clearFilters.test.tsx` — the search input has a non-empty value after typing and clears to `''` after "Clear filters" is clicked.

7. `FilterPanel` category `<select>` calls `onChange` with an updated `FilterState` (spreading previous filters, setting `category` to the selected option value) when the selection changes.
   - Verified by: `tests/filtering.test.tsx` — "filters products by category": `getByLabelText(/category/i)` resolves and selecting `'Fitness'` updates results; `tests/clearFilters.test.tsx` — category resets to value `'All'` after Clear.

8. `FilterPanel` in-stock checkbox calls `onChange` with an updated `FilterState` (spreading previous filters, setting `inStockOnly` to the checkbox's checked state) when toggled.
   - Verified by: `tests/filtering.test.tsx` — "filters products by in-stock only": `getByLabelText(/in-stock only/i)` resolves and clicking it reduces product count to 11; `tests/clearFilters.test.tsx` — checkbox is not checked after Clear.

9. `FilterPanel` "Clear filters" button resets all filter state to `{ search: '', category: 'All', inStockOnly: false, sortBy: 'default' }` when clicked.
   - Verified by: `tests/clearFilters.test.tsx` — "resets filters back to default values": after setting search, category, and in-stock, clicking `getByRole('button', { name: /clear filters/i })` results in search input value `''`, category value `'All'`, checkbox unchecked, sort value `'default'`, and results-count "Showing 15 products".

10. `SortSelect` `<select>` calls `onChange` with the selected `sortBy` value (typed as `FilterState['sortBy']`) when the selection changes.
    - Verified by: `tests/sorting.test.tsx` — all three sort tests use `getByLabelText(/sort by/i)` to change the select and observe reordered product headings.

11. When `filterProducts` returns an empty array (no products match the active filters), `ProductList` renders a `<p>` with text "No products found." and role `"status"`.
    - Verified by: `ProductList.tsx` already contains this branch (no code change needed); confirmed by running `pnpm --filter benchmark-frontend test` — any filter combination that yields zero results will render that paragraph, detectable in tests via `screen.getByText(/no products found/i)`.

12. The app builds without TypeScript errors after all changes.
    - Verified by: `pnpm --filter benchmark-frontend build` exits with code 0 and emits no TypeScript diagnostic errors.

---

## Edge cases

- Leading/trailing whitespace in search input: covered by requirement 1 (trim before matching).
- Search term `'mouse'` matching `'Wireless Mouse'` (case difference): covered by requirement 1 (case-insensitive).
- `category === 'All'` passes every product through, not just those literally named `'All'`: covered by requirement 2.
- `sortBy === 'default'` must not reorder relative to the original fetched array: covered by requirement 4 (preserves original order).
- Filters combine: e.g. in-stock + category applied together — `filterProducts` applies all active filters in sequence before sorting; covered by requirements 1–4 (each filter is applied independently, results feed into the next).
- Clear resets `sortBy` to `'default'` in addition to the filter controls: covered by requirement 9 (`tests/clearFilters.test.tsx` checks `getByLabelText(/sort by/i)` has value `'default'`).
