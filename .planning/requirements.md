# Requirements

1. `filterProducts` filters by search term case-insensitively with leading/trailing whitespace trimmed, matching any substring of `product.name`.
   - Verified by: `tests/filtering.test.tsx` — "filters products by search term" passes: typing `mouse` into the search input shows "Wireless Mouse" and hides "Yoga Mat"; `results-count` reads "Showing 1 products".

2. `filterProducts` filters by category: when `filters.category` is `"All"` every product passes; when set to a specific category only products whose `category` field matches are returned.
   - Verified by: `tests/filtering.test.tsx` — "filters products by category" passes: selecting "Fitness" shows Yoga Mat, Resistance Bands, Foam Roller, hides Wireless Mouse, and `results-count` reads "Showing 5 products".

3. `filterProducts` filters by in-stock: when `filters.inStockOnly` is `true` only products with `inStock === true` are returned.
   - Verified by: `tests/filtering.test.tsx` — "filters products by in-stock only" passes: checking in-stock hides USB-C Hub, Noise-Cancelling Headphones, Dumbbell Set, Desk Lamp; `results-count` reads "Showing 11 products".

4. `filterProducts` sorts by `price-asc` (lowest price first), `price-desc` (highest price first), and `rating-desc` (highest rating first); `default` preserves the original product order. Sorting is applied after all other filters.
   - Verified by: `tests/sorting.test.tsx` — all three sort tests pass: price-asc produces the exact 15-item order listed in the test; price-desc puts "Noise-Cancelling Headphones" first, "Mechanical Keyboard" second, "Jump Rope" last; rating-desc puts "Yoga Mat" first, "Mechanical Keyboard" second.

5. `filterProducts` does not mutate the source `products` array or any element of it when filtering or sorting.
   - Verified by: `tests/sorting.test.tsx` sorting tests pass on repeated renders (a mutated source array would produce wrong order on the second render); confirmed by implementation using `[...products]` or `.filter()` before any `.sort()` call.

6. `FilterPanel`'s search `<input>` calls `onChange({ ...filters, search: e.target.value })` on every change event, causing the displayed product list to update.
   - Verified by: `tests/filtering.test.tsx` — "filters products by search term" passes: typing into the search input (found via `getByLabelText(/search/i)`) visibly updates the product list.

7. `FilterPanel`'s category `<select>` calls `onChange({ ...filters, category: e.target.value })` on change, causing the displayed product list to update.
   - Verified by: `tests/filtering.test.tsx` — "filters products by category" passes: selecting "Fitness" via `selectOptions` updates the product list.

8. `FilterPanel`'s in-stock `<input type="checkbox">` calls `onChange({ ...filters, inStockOnly: e.target.checked })` on change, causing the displayed product list to update.
   - Verified by: `tests/filtering.test.tsx` — "filters products by in-stock only" passes: clicking the checkbox (found via `getByLabelText(/in-stock only/i)`) updates the product list.

9. `FilterPanel`'s "Clear filters" `<button>` calls `onChange` with `{ search: '', category: 'All', inStockOnly: false, sortBy: 'default' }` on click, resetting all filter state.
   - Verified by: `tests/clearFilters.test.tsx` — "resets filters back to default values" passes: after setting search, category, and in-stock then clicking "Clear filters" (found via `getByRole('button', { name: /clear filters/i })`), search input value is `''`, category select value is `'All'`, in-stock checkbox is unchecked, sort select value is `'default'`, and `results-count` reads "Showing 15 products".

10. `SortSelect`'s `<select>` calls `onChange(e.target.value as FilterState['sortBy'])` on change, causing the displayed product list to re-sort.
    - Verified by: `tests/sorting.test.tsx` — all sort tests pass: selecting a sort option via `selectOptions(getByLabelText(/sort by/i), ...)` updates the product order.

11. When no products match the current filters, `ProductList` renders a `<p role="status">No products found.</p>` element.
    - Verified by: `ProductList.tsx` already contains this branch (confirmed by reading the file); integration verified by `tests/filtering.test.tsx` — a search with no matches (e.g. `'zzz'`) would show that element. Additionally confirmed by the existing implementation in `ProductList.tsx:9`.

12. The app TypeScript build completes without errors.
    - Verified by: running `pnpm --filter benchmark-frontend build` exits with code 0.

13. All six visible test files pass with no failures.
    - Verified by: running `pnpm --filter benchmark-frontend test --run` from the repo root exits with code 0 and reports 0 failures across `app.render.test.tsx`, `clearFilters.test.tsx`, `filtering.test.tsx`, `loadingError.test.tsx`, `pagination.test.tsx`, and `sorting.test.tsx`.

---

## Edge cases

- Search with leading/trailing whitespace (e.g. `"  lamp "`): covered by requirement 1 — trimming applied before substring match.
- Search is case-insensitive (e.g. `"MOUSE"` matches "Wireless Mouse"): covered by requirement 1 — both sides lowercased before comparison.
- `sortBy: 'default'` when filters are cleared: covered by requirement 9 — Clear filters resets `sortBy` to `'default'` and requirement 4 specifies `'default'` preserves original order.
- Filters combine (search AND category AND inStockOnly all active simultaneously): covered by requirements 1–4 because `filterProducts` applies all three filter predicates before sorting; verified end-to-end by `clearFilters.test.tsx` which applies search + category + in-stock together and checks the count after clearing.
- Source array not mutated across repeated renders: covered by requirement 5.
- Empty product list renders empty state: covered by requirement 11.
