# Requirements

1. `filterProducts` filters by name case-insensitively after trimming whitespace: only products whose `name` contains `filters.search.trim()` (case-insensitive) are returned; when `filters.search` is empty or whitespace-only, all products pass.
   - Verified by: `tests/filtering.test.tsx` — "filters products by search term": typing `'mouse'` in the search input yields exactly 1 product ("Wireless Mouse") and `results-count` reads "Showing 1 products".

2. `filterProducts` filters by category with exact match: products whose `category` equals `filters.category` are included; when `filters.category` is `"All"`, no category filter is applied.
   - Verified by: `tests/filtering.test.tsx` — "filters products by category": selecting `'Fitness'` yields exactly 5 products (Yoga Mat, Resistance Bands, Foam Roller visible; Wireless Mouse absent) and count reads "Showing 5 products".

3. `filterProducts` filters by stock status: when `filters.inStockOnly` is `true`, only products with `inStock: true` are returned; when `false`, all products pass regardless of stock.
   - Verified by: `tests/filtering.test.tsx` — "filters products by in-stock only": clicking the checkbox hides USB-C Hub, Noise-Cancelling Headphones, Dumbbell Set, and Desk Lamp; count reads "Showing 11 products".

4. `filterProducts` sorts the filtered result set without mutating the input array: `'price-asc'` sorts ascending by `price`, `'price-desc'` sorts descending by `price`, `'rating-desc'` sorts descending by `rating`, and `'default'` preserves original order. Sort is always applied after all filters.
   - Verified by: `tests/sorting.test.tsx` — "sorts by price ascending" asserts exact product order across all 15 items; "sorts by price descending" asserts first=Noise-Cancelling Headphones, second=Mechanical Keyboard, last=Jump Rope; "sorts by rating descending" asserts first=Yoga Mat, second=Mechanical Keyboard.

5. The search `<input>` in `FilterPanel` calls the `onChange` prop with `{ ...filters, search: e.target.value }` on every `change` event. The `onChange` prop is no longer aliased as `_onChange` (unused); it is destructured as `onChange` and used.
   - Verified by: `tests/filtering.test.tsx` — "filters products by search term" passes (typing triggers re-filter).

6. The category `<select>` in `FilterPanel` calls the `onChange` prop with `{ ...filters, category: e.target.value }` on `change`.
   - Verified by: `tests/filtering.test.tsx` — "filters products by category" passes (selecting triggers re-filter).

7. The in-stock `<input type="checkbox">` in `FilterPanel` calls the `onChange` prop with `{ ...filters, inStockOnly: e.target.checked }` on `change`.
   - Verified by: `tests/filtering.test.tsx` — "filters products by in-stock only" passes (clicking checkbox triggers re-filter).

8. The "Clear filters" button in `FilterPanel` calls the `onChange` prop with the default `FilterState`: `{ search: '', category: 'All', inStockOnly: false, sortBy: 'default' }`.
   - Verified by: `tests/clearFilters.test.tsx` — "resets filters back to default values": after setting search/category/inStockOnly and clicking Clear, search input has value `''`, category select has value `'All'`, in-stock checkbox is unchecked, sort select has value `'default'`, and count reads "Showing 15 products".

9. The sort `<select>` in `SortSelect` calls the `onChange` prop with the selected `sortBy` value (typed as `FilterState['sortBy']`) on `change`. The `onChange` prop is no longer aliased as `_onChange`; it is destructured as `onChange` and used.
   - Verified by: `tests/sorting.test.tsx` — all three sort tests pass (selecting a sort option triggers re-sort).

10. `App.tsx` passes a wrapper function to `FilterPanel`'s `onChange` prop that calls both `setFilters(nextFilters)` and `setPage(1)` — not `setFilters` directly. Similarly, `SortSelect`'s `onChange` prop receives a wrapper that calls `setFilters(prev => ({ ...prev, sortBy }))` and `setPage(1)`.
    - Verified by: `tests/pagination.test.tsx` — all existing pagination tests continue to pass; and `results-count` always shows `page 1 of …` immediately after any filter change (no empty-page condition).

11. The category dropdown in `FilterPanel` is populated from the `categories` prop (derived dynamically from loaded products via `useMemo` in `App.tsx`, not a hardcoded list). The first option is `"All"`, followed by the distinct categories present in the fetched data.
    - Verified by: `tests/filtering.test.tsx` — "filters products by category" successfully selects `'Fitness'` (a dynamically derived value, not hardcoded); `tests/app.render.test.tsx` — app renders and shows 15 products successfully, confirming data loads and categories are available.

12. The project TypeScript compilation succeeds with no type errors (`tsc --noEmit` or `vite build`).
    - Verified by: running `pnpm build` (or `pnpm tsc --noEmit`) inside `src/benchmark-frontend` exits with code 0.

13. All visible test suites pass: `filtering.test.tsx`, `sorting.test.tsx`, `clearFilters.test.tsx`, `app.render.test.tsx`, `pagination.test.tsx`.
    - Verified by: running `pnpm test --run` inside `src/benchmark-frontend` exits with code 0 and all test descriptions show as passed.

## Edge cases

- Empty search string (or whitespace-only): covered by requirement 1 — all products pass through the name filter.
- `filters.search` with leading/trailing whitespace (e.g. `" mouse "`): covered by requirement 1 — `.trim()` is applied before matching.
- `filters.category === 'All'`: covered by requirement 2 — bypasses the category filter entirely.
- `filters.inStockOnly === false`: covered by requirement 3 — all products pass regardless of `inStock` field.
- `filters.sortBy === 'default'`: covered by requirement 4 — products remain in the order returned after filtering.
- Input array must not be mutated by `filterProducts`: covered by requirement 4 — the function must spread/copy before sorting.
- Sort applied after all filters: covered by requirement 4 — filtering runs first, then sort on the filtered subset.
- Clear filters also resets `sortBy` to `'default'`: covered by requirement 8 — the default state object includes `sortBy: 'default'`.
- Pagination page number must reset to 1 on every filter/sort change: covered by requirement 10 — wrapper calls `setPage(1)` alongside `setFilters`.
