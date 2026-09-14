# Requirements

1. `filterProducts` filters by name: case-insensitive, partial match, trims leading/trailing whitespace from `FilterState.search` before comparison. When `search` is empty or whitespace-only, no name filter is applied.
   - Verified by: `tests/filtering.test.tsx` "filters products by search term" — typing `"mouse"` in the labeled search input leaves only "Wireless Mouse" visible and `[data-testid="results-count"]` contains `"Showing 1 products"`.

2. `filterProducts` filters by category: when `FilterState.category !== "All"`, only products whose `category` exactly equals `FilterState.category` are returned; when `category === "All"`, all products pass.
   - Verified by: `tests/filtering.test.tsx` "filters products by category" — selecting `"Fitness"` in the labeled category select shows 5 products (Yoga Mat, Resistance Bands, Foam Roller present; Wireless Mouse absent) and `results-count` contains `"Showing 5 products"`.

3. `filterProducts` filters by stock: when `FilterState.inStockOnly === true`, only products where `product.inStock === true` are returned.
   - Verified by: `tests/filtering.test.tsx` "filters products by in-stock only" — clicking the labeled in-stock checkbox shows 11 products; USB-C Hub, Noise-Cancelling Headphones, Dumbbell Set, and Desk Lamp are absent.

4. `filterProducts` sorts by price ascending: when `FilterState.sortBy === "price-asc"`, returned products are ordered lowest `price` first, producing the exact order: Jump Rope, Cable Organiser, Foam Roller, Wireless Mouse, Ergonomic Wrist Rest, Resistance Bands, Monitor Riser, Yoga Mat, Desk Lamp, Laptop Stand, USB-C Hub, Webcam HD, Dumbbell Set, Mechanical Keyboard, Noise-Cancelling Headphones.
   - Verified by: `tests/sorting.test.tsx` "sorts by price ascending" — after selecting `"price-asc"`, all 15 `<h3>` headings match that exact list in order.

5. `filterProducts` sorts by price descending: when `FilterState.sortBy === "price-desc"`, products are ordered highest `price` first; Noise-Cancelling Headphones is index 0, Mechanical Keyboard is index 1, Jump Rope is the last item.
   - Verified by: `tests/sorting.test.tsx` "sorts by price descending" — `names[0]`, `names[1]`, and `names[names.length - 1]` match those exact values.

6. `filterProducts` sorts by rating descending: when `FilterState.sortBy === "rating-desc"`, products are ordered highest `rating` first; Yoga Mat is index 0, Mechanical Keyboard is index 1.
   - Verified by: `tests/sorting.test.tsx` "sorts by rating descending" — `names[0]` and `names[1]` match those values.

7. `filterProducts` preserves original order: when `FilterState.sortBy === "default"`, the relative order of products in the return value is identical to the relative order in the input array.
   - Verified by: `tests/app.render.test.tsx` initial render — 15 products appear without sorting applied; no heading-order assertions fail.

8. `filterProducts` does not mutate its input: calling `filterProducts(arr, filters)` with any `sortBy` value leaves the `arr` reference and its element order unchanged after the call.
   - Verified by: Sorting is implemented with `[...products].sort(...)` (spread before sort); `tests/sorting.test.tsx` tests run in isolation and each renders a fresh app with the original array — no test-to-test bleed from mutation.

9. Filters combine and sorting applies after filtering: when multiple `FilterState` fields are set simultaneously, only products satisfying ALL active filters are returned, and sorting is applied to that filtered result.
   - Verified by: `tests/clearFilters.test.tsx` — sets search, category, and in-stock simultaneously; after clearing, all 15 products return and `results-count` shows `"Showing 15 products"`.

10. `FilterPanel` search input is wired: the `<input id="search">` `onChange` handler calls `onChange({ ...filters, search: e.target.value })` so typing updates `FilterState.search`.
    - Verified by: `tests/filtering.test.tsx` "filters products by search term" — `userEvent.type` on the element found by `getByLabelText(/search/i)` causes `results-count` to reflect the filtered count.

11. `FilterPanel` category select is wired: the `<select id="category">` `onChange` handler calls `onChange({ ...filters, category: e.target.value })`.
    - Verified by: `tests/filtering.test.tsx` "filters products by category" — `userEvent.selectOptions` on the element found by `getByLabelText(/category/i)` causes re-filtering.

12. `FilterPanel` in-stock checkbox is wired: the `<input id="inStockOnly" type="checkbox">` `onChange` handler calls `onChange({ ...filters, inStockOnly: e.target.checked })`.
    - Verified by: `tests/filtering.test.tsx` "filters products by in-stock only" — `userEvent.click` on the element found by `getByLabelText(/in-stock only/i)` causes re-filtering.

13. `FilterPanel` "Clear filters" button is wired: the `<button>Clear filters</button>` `onClick` handler calls `onChange` with `{ search: '', category: 'All', inStockOnly: false, sortBy: 'default' }`.
    - Verified by: `tests/clearFilters.test.tsx` — after user interactions, `userEvent.click` on `getByRole('button', { name: /clear filters/i })` resets the search input value to `""`, category select to `"All"`, checkbox to unchecked, sort select to `"default"`, and `results-count` to `"Showing 15 products"`.

14. `SortSelect` dropdown is wired: the `<select id="sortBy">` `onChange` handler calls `onChange(e.target.value as FilterState['sortBy'])`.
    - Verified by: `tests/sorting.test.tsx` — `userEvent.selectOptions` on `getByLabelText(/sort by/i)` triggers re-sorting and the `<h3>` heading order changes accordingly.

15. Empty state message: when `filterProducts` returns an empty array, the text `"No products found."` is displayed in the UI.
    - Verified by: `ProductList.tsx:9` already renders `<p role="status">No products found.</p>` when `products.length === 0`. Once filter logic is correct, any search term with no match (e.g., typing a string present in no product name) renders this element. Manually testable in browser; confirmed by inspecting `ProductList` source.

16. TypeScript build succeeds: `pnpm --filter benchmark-frontend build` exits with code 0 and emits no type errors.
    - Verified by: Running the build command in CI or locally; a non-zero exit code is a failure.

---

## Edge cases

- Whitespace-only search (`"   "`): treated as empty; all products pass the name filter — covered by requirement 1.
- Search with leading/trailing whitespace (`"  lamp  "`): trimmed to `"lamp"` before matching — covered by requirement 1.
- Category `"All"`: special sentinel meaning no category filter applied — covered by requirement 2.
- Mixed-case search (`"MOUSE"` or `"Mouse"`): must still match `"Wireless Mouse"` — covered by requirement 1.
- `inStockOnly` combined with search: only in-stock products matching the name filter appear — covered by requirement 9.
- `sortBy` combined with filters: sorting runs on the already-filtered slice, not the full product list — covered by requirement 9.
- Sort on filtered result does not restore out-of-stock products — covered by requirements 3 and 9.
- `filterProducts` called with an empty `products` array: returns an empty array without error — covered by requirement 15 (empty state).
- Identical prices or ratings in sort: no stability guarantee is required by the spec, but original relative order is preserved for ties when the underlying `Array.prototype.sort` is stable (V8/Node.js/browser environments guarantee this) — covered by requirements 4–6.
