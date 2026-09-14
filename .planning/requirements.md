# Requirements

1. `filterProducts` applies a case-insensitive, partial-match search on `Product.name` using the trimmed value of `filters.search`; when `search` is empty (or all whitespace) no products are excluded by this step.
   - Verified by: `tests/filtering.test.tsx` — "filters products by search term": typing `'mouse'` into the Search input leaves only `'Wireless Mouse'` visible and the results-count element reads `'Showing 1 products'`; `'Yoga Mat'` is absent from the DOM.

2. `filterProducts` returns only products whose `category` exactly equals `filters.category` when that value is not `'All'`; when `filters.category === 'All'` no products are excluded by this step.
   - Verified by: `tests/filtering.test.tsx` — "filters products by category": selecting `'Fitness'` shows Yoga Mat, Resistance Bands, Foam Roller; hides Wireless Mouse; results-count reads `'Showing 5 products'`.

3. `filterProducts` excludes products with `inStock === false` when `filters.inStockOnly` is `true`; when `false`, all products pass this step regardless of stock status.
   - Verified by: `tests/filtering.test.tsx` — "filters products by in-stock only": after checking the checkbox, USB-C Hub, Noise-Cancelling Headphones, Dumbbell Set, and Desk Lamp are all absent from the DOM; results-count reads `'Showing 11 products'`.

4. `filterProducts` with `sortBy === 'price-asc'` returns the filtered set sorted by `price` ascending (lowest first); the exact order for the full unfiltered set must be: Jump Rope, Cable Organiser, Foam Roller, Wireless Mouse, Ergonomic Wrist Rest, Resistance Bands, Monitor Riser, Yoga Mat, Desk Lamp, Laptop Stand, USB-C Hub, Webcam HD, Dumbbell Set, Mechanical Keyboard, Noise-Cancelling Headphones.
   - Verified by: `tests/sorting.test.tsx` — "sorts by price ascending": `getAllByRole('heading', {level:3})` returns that exact ordered list of text content.

5. `filterProducts` with `sortBy === 'price-desc'` returns the filtered set sorted by `price` descending (highest first); the first product must be `'Noise-Cancelling Headphones'`, the second `'Mechanical Keyboard'`, and the last `'Jump Rope'`.
   - Verified by: `tests/sorting.test.tsx` — "sorts by price descending": `names[0]`, `names[1]`, and `names[names.length - 1]` are asserted.

6. `filterProducts` with `sortBy === 'rating-desc'` returns the filtered set sorted by `rating` descending (highest first); the first product must be `'Yoga Mat'` and the second `'Mechanical Keyboard'`.
   - Verified by: `tests/sorting.test.tsx` — "sorts by rating descending": `names[0]` and `names[1]` are asserted.

7. `filterProducts` with `sortBy === 'default'` preserves the original product order without reordering.
   - Verified by: `tests/app.render.test.tsx` — "renders the page heading and initial product count": results-count reads `'Showing 15 products'` (all 15 products returned in default order with default filters).

8. `filterProducts` must not mutate the original input `products` array; sort operations must operate on a copy (e.g. via spread or `slice`).
   - Verified by: `tests/sorting.test.tsx` passes without test-observable side-effects; additionally, the implementation must use `[...products]` or `.slice()` before calling `.sort()` — confirmed by code inspection of `src/utils/productFilters.ts`.

9. The `FilterPanel` search `<input>` must call `onChange({ ...filters, search: event.target.value })` on every `change` event, causing `filterProducts` to re-run with the new search term.
   - Verified by: `tests/filtering.test.tsx` "filters products by search term" — `userEvent.type` on the element matched by `getByLabelText(/search/i)` triggers results filtering; and `tests/clearFilters.test.tsx` confirms the input reverts to `''` after Clear.

10. The `FilterPanel` category `<select>` must render one `<option>` for every entry in the `categories` prop (which already includes `'All'` as its first element, derived by `App.tsx`) and call `onChange({ ...filters, category: event.target.value })` on change.
    - Verified by: `tests/filtering.test.tsx` "filters products by category" — `userEvent.selectOptions` on `getByLabelText(/category/i)` with value `'Fitness'` succeeds (option exists) and triggers filtering; and `tests/clearFilters.test.tsx` confirms the select reverts to `'All'` after Clear.

11. The `FilterPanel` in-stock `<input type="checkbox">` must call `onChange({ ...filters, inStockOnly: event.target.checked })` on change.
    - Verified by: `tests/filtering.test.tsx` "filters products by in-stock only" — `userEvent.click` on `getByLabelText(/in-stock only/i)` triggers filtering; `tests/clearFilters.test.tsx` confirms checkbox is unchecked after Clear.

12. The `FilterPanel` "Clear filters" button must call `onChange({ search: '', category: 'All', inStockOnly: false, sortBy: 'default' })` on click, restoring the full product list.
    - Verified by: `tests/clearFilters.test.tsx` — "resets filters back to default values": after setting search to `'lamp'`, category to `'Accessories'`, and checking in-stock, clicking the button (matched by `getByRole('button', {name: /clear filters/i})`) causes search input to have value `''`, category select to have value `'All'`, checkbox to be unchecked, sort select to have value `'default'`, and results-count to read `'Showing 15 products'`.

13. The `SortSelect` `<select>` must call `onChange(event.target.value as FilterState['sortBy'])` on change; the four options (`default`, `price-asc`, `price-desc`, `rating-desc`) must be present.
    - Verified by: `tests/sorting.test.tsx` — all three sorting tests use `userEvent.selectOptions` on `getByLabelText(/sort by/i)` and assert on the resulting product order; the `sort by` label is already linked via `htmlFor="sortBy"` in the existing markup.

14. When `filterProducts` returns an empty array (no products match active filters), the UI displays the text `"No products found."`.
    - Verified by: `src/components/ProductList.tsx` already renders `<p role="status">No products found.</p>` when `products.length === 0` — the requirement is that `filterProducts` returns `[]` when all products are excluded; confirmed by manually applying all filters with values that yield zero results in a browser run.

15. Running `pnpm run build` inside `src/benchmark-frontend` exits with code 0 and produces no TypeScript or Vite errors.
    - Verified by: executing `cd src/benchmark-frontend && pnpm run build` in the shell and confirming exit code 0.

16. All automated tests pass: running `pnpm run test` (or equivalent vitest command) inside `src/benchmark-frontend` reports 0 failing tests across all test files (`app.render.test.tsx`, `filtering.test.tsx`, `sorting.test.tsx`, `clearFilters.test.tsx`, `loadingError.test.tsx`, `pagination.test.tsx`).
    - Verified by: executing `cd src/benchmark-frontend && pnpm run test` in the shell and confirming all suites green.

---

## Edge cases

- Search with leading/trailing whitespace (e.g. `'  lamp '`): covered by requirement 1 — trimming before matching ensures `'  lamp '` matches `'Desk Lamp'`.
- Search is case-insensitive (e.g. `'MOUSE'` matches `'Wireless Mouse'`): covered by requirement 1.
- `category === 'All'` shows every product regardless of actual category values: covered by requirement 2.
- Combining multiple active filters (search + category + inStockOnly): covered by requirements 1–3 — filters are applied sequentially; `tests/clearFilters.test.tsx` exercises multi-filter state before Clear.
- Sorting applies after all filters are applied (sort order is over the filtered subset, not the full set): covered by requirements 4–6 — the implementation applies filters first, then sorts.
- `sortBy === 'default'` with no other filters yields all 15 products in original API order: covered by requirement 7.
- Sorting must not mutate the input array: covered by requirement 8 — sorting tests run sequentially in the same component instance; mutation would corrupt state across tests.
- Empty result set when filters exclude all products: covered by requirement 14.
- Category dropdown must include `'All'` as a selectable option: covered by requirement 10 — `App.tsx` prepends `'All'` to the categories list before passing it as a prop.
