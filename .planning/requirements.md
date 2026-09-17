# Requirements

1. `filterProducts` filters by name: when `filters.search` is non-empty after trimming, the function returns only products whose `name` contains the trimmed search string (case-insensitive). When `filters.search` is empty or whitespace-only, no name filtering is applied.
   - Verified by: `filtering.test.tsx` — "filters products by search term": typing `'mouse'` into the search input renders exactly `'Wireless Mouse'` and the results count reads `'Showing 1 products'`.

2. `filterProducts` filters by category: when `filters.category` is not `'All'`, the function returns only products whose `category` exactly matches `filters.category`. When `filters.category` is `'All'`, no category filtering is applied.
   - Verified by: `filtering.test.tsx` — "filters products by category": selecting `'Fitness'` renders exactly 5 products (Yoga Mat, Resistance Bands, Foam Roller visible; Wireless Mouse absent) and count reads `'Showing 5 products'`.

3. `filterProducts` filters by in-stock status: when `filters.inStockOnly` is `true`, the function returns only products where `inStock === true`. When `filters.inStockOnly` is `false`, no stock filtering is applied.
   - Verified by: `filtering.test.tsx` — "filters products by in-stock only": checking the in-stock checkbox hides the 4 out-of-stock products (USB-C Hub, Noise-Cancelling Headphones, Dumbbell Set, Desk Lamp) and count reads `'Showing 11 products'`.

4. `filterProducts` sorts by price ascending: when `filters.sortBy` is `'price-asc'`, the returned array is ordered by `price` from lowest to highest, applied after filtering.
   - Verified by: `sorting.test.tsx` — "sorts by price ascending": the full sequence of h3 headings matches exactly `['Jump Rope', 'Cable Organiser', 'Foam Roller', 'Wireless Mouse', 'Ergonomic Wrist Rest', 'Resistance Bands', 'Monitor Riser', 'Yoga Mat', 'Desk Lamp', 'Laptop Stand', 'USB-C Hub', 'Webcam HD', 'Dumbbell Set', 'Mechanical Keyboard', 'Noise-Cancelling Headphones']`.

5. `filterProducts` sorts by price descending: when `filters.sortBy` is `'price-desc'`, the returned array is ordered by `price` from highest to lowest.
   - Verified by: `sorting.test.tsx` — "sorts by price descending": first product is `'Noise-Cancelling Headphones'`, second is `'Mechanical Keyboard'`, last is `'Jump Rope'`.

6. `filterProducts` sorts by rating descending: when `filters.sortBy` is `'rating-desc'`, the returned array is ordered by `rating` from highest to lowest.
   - Verified by: `sorting.test.tsx` — "sorts by rating descending": first product is `'Yoga Mat'`, second is `'Mechanical Keyboard'`.

7. `filterProducts` does not mutate the input array: calling `filterProducts(arr, anyFilters)` leaves `arr` in its original order and with its original contents intact. The function always operates on a copy.
   - Verified by: `sorting.test.tsx` implicitly — each sort test renders a fresh `App` and gets predictable default ordering; a mutated input would corrupt subsequent tests run in the same process.

8. `filterProducts` with `sortBy: 'default'` returns the filtered products in their original (arrival) order without reordering.
   - Verified by: `app.render.test.tsx` — initial render with default filters shows all 15 products (`'Showing 15 products'`), and `filtering.test.tsx` / `clearFilters.test.tsx` show correct counts after filter changes with no sort applied.

9. FilterPanel search input is wired: typing into the input element with label `'Search'` triggers `onChange` with a new `FilterState` where `search` equals the current input value. The `onChange` rename alias `_onChange` is replaced with the active `onChange` parameter.
   - Verified by: `filtering.test.tsx` — "filters products by search term" passes only if the search input's `onChange` handler updates state and causes re-filtering.

10. FilterPanel category dropdown is wired: selecting an option from the `<select>` with label `'Category'` triggers `onChange` with a new `FilterState` where `category` equals the selected option value.
    - Verified by: `filtering.test.tsx` — "filters products by category" passes only if the category select's `onChange` handler updates state.

11. FilterPanel in-stock checkbox is wired: clicking the checkbox with label `/in-stock only/i` triggers `onChange` with a new `FilterState` where `inStockOnly` reflects the new checked state.
    - Verified by: `filtering.test.tsx` — "filters products by in-stock only" passes only if the checkbox `onChange` handler updates state.

12. FilterPanel Clear Filters button is wired: clicking the button with text `/clear filters/i` triggers `onChange` with exactly `{ search: '', category: 'All', inStockOnly: false, sortBy: 'default' }`.
    - Verified by: `clearFilters.test.tsx` — after applying search, category, and in-stock filters then clicking Clear Filters: search input value is `''`, category select value is `'All'`, in-stock checkbox is unchecked, sort select value is `'default'`, and count reads `'Showing 15 products'`.

13. SortSelect sort dropdown is wired: selecting an option from the `<select>` with label `'Sort by'` triggers `onChange` with the corresponding `FilterState['sortBy']` string value (`'price-asc'`, `'price-desc'`, `'rating-desc'`, or `'default'`). The `onChange` rename alias `_onChange` is replaced with the active `onChange` parameter.
    - Verified by: `sorting.test.tsx` — all three sorting tests pass only if the sort select's `onChange` handler updates state.

14. Category dropdown options are derived dynamically from loaded product data: the `<select>` labelled `'Category'` renders options built from the `categories` prop (which `App.tsx` derives via `useMemo` over fetched products), not from any hardcoded list in `FilterPanel.tsx`.
    - Verified by: `filtering.test.tsx` — "filters products by category": `userEvent.selectOptions(getByLabelText(/category/i), 'Fitness')` succeeds, meaning a `'Fitness'` option exists — it can only exist if categories come from the API data, since `FilterPanel.tsx` contains no hardcoded option list.

15. Changing any filter resets the page to 1: `App.tsx` passes a wrapper handler to both `FilterPanel` (`onChange` prop) and `SortSelect` (`onChange` prop) that calls `setFilters(next)` and `setPage(1)` together. `setFilters` is not passed directly.
    - Verified by: code inspection of `App.tsx` — the `onChange` prop of `FilterPanel` and the `onChange` prop of `SortSelect` must each reference a function that invokes both `setFilters` and `setPage(1)`, not the raw `setFilters` setter.

16. The app builds without TypeScript errors: running `pnpm build` in `src/benchmark-frontend/` exits with code 0 and emits no type errors.
    - Verified by: `pnpm --dir src/benchmark-frontend build` exit code 0.

17. All visible tests pass: every test in `src/benchmark-frontend/tests/` exits green.
    - Verified by: `pnpm --dir src/benchmark-frontend test --run` exit code 0, zero failing test cases.

---

## Edge cases

- Search whitespace trimming (e.g. `'  mouse  '` matches `'Wireless Mouse'`): covered by requirement 1.
- `filters.category === 'All'` disables category filter: covered by requirement 2.
- `filters.sortBy === 'default'` preserves arrival order: covered by requirement 8.
- Filters compose — search + category + inStockOnly all active simultaneously: the implementation must apply each predicate in sequence; requirements 1–3 each test a single dimension; composition is an implicit constraint of the implementation.
- Clear Filters also resets `sortBy` to `'default'` (not just the FilterPanel fields): covered by requirement 12 (the `FilterState` passed to `onChange` includes `sortBy: 'default'`), verified by `clearFilters.test.tsx` asserting the sort select value is `'default'`.
- The input array to `filterProducts` must remain unmodified across sort calls (e.g. `[...products].sort(...)` not `products.sort(...)`): covered by requirement 7.
