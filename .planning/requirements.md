# Requirements

1. `SortSelect` must be wired to `FilterContext.sortBy` / `FilterContext.setSortBy`. After selecting any sort option, the visible product list re-orders immediately to reflect the chosen sort.
   - Verified by: `contextMigration.test.tsx` — "selecting a sort option re-orders the product list" and "selecting price-desc puts the most expensive product first" pass; `sorting.test.tsx` — all three sort-order tests pass.

2. The local sort state variable (`localSortBy`) must be removed from `ProductListPage`. No `useState` in `ProductListPage` (or any other component) holds a copy of the sort value that already lives in `FilterContext`.
   - Verified by: `src/benchmark-frontend/src/pages/ProductListPage.tsx` contains no `useState` call whose initial value is a `SortOption` literal (e.g. `'default'`) and no identifier named `localSortBy`; TypeScript build exits with code 0.

3. Clicking a product's category button (aria-label `Filter by [category]`) must call `FilterContext.setCategory` with that product's category string, causing `useFilteredProducts` to re-filter the list immediately.
   - Verified by: `contextMigration.test.tsx` — "clicking a product category button filters the list to that category" (results-count reads "Showing 5 products" after clicking "Filter by Electronics") and "clicking a category button hides products from other categories" both pass.

4. The category `<select>` control in `FilterPanel` must reflect the updated `category` value after a card category button is clicked (it reads from `FilterContext.category` which `setCategory` updates).
   - Verified by: the `contextMigration.test.tsx` category-click tests pass, confirming context state propagated; `filtering.test.tsx` category-filter tests continue to pass (no regression on the `<select>` path).

5. The `onCategoryClick` prop must be removed from `ProductCard`. `ProductCard` must call `useFilterContext().setCategory` directly; it must not accept or reference `onCategoryClick` in its `Props` type or JSX.
   - Verified by: `src/benchmark-frontend/src/components/ProductCard.tsx` contains no `onCategoryClick` identifier; TypeScript build exits with code 0.

6. The `onCategoryClick` prop must be removed from `ProductList`. `ProductList` must not accept, drill, or reference `onCategoryClick` in its `Props` type or JSX.
   - Verified by: `src/benchmark-frontend/src/components/ProductList.tsx` contains no `onCategoryClick` identifier; TypeScript build exits with code 0.

7. The no-op `onCategoryClick` callback and its prop pass must be removed from `ProductListPage`. `ProductList` is rendered without an `onCategoryClick` prop.
   - Verified by: `src/benchmark-frontend/src/pages/ProductListPage.tsx` contains no `onCategoryClick` identifier; TypeScript build exits with code 0.

8. All previously-working features remain unbroken: search, in-stock toggle, clear filters, and pagination.
   - Verified by: `filtering.test.tsx`, `clearFilters.test.tsx`, `pagination.test.tsx`, `loadingError.test.tsx`, and `app.render.test.tsx` all pass without modification.

9. The TypeScript build must succeed with no type errors.
   - Verified by: `pnpm --filter benchmark-frontend build` exits with code 0 and produces no TypeScript diagnostic output.

---

## Edge cases

- Sort value `'default'` (initial context state): covered by requirement 1 — removing the duplicate local state means context always drives `SortSelect`, including the initial `'default'` value.
- Category `'All'` (reset to show all products): covered by requirement 3 — `clearFilters` resets `FilterContext.category` to `'All'`; covered by requirement 8 via `clearFilters.test.tsx`.
- Multiple products sharing the same category: covered by requirement 3 — only the first "Filter by Electronics" button is clicked in the test; all products of that category remain visible.
- `ProductCard` rendered without a surrounding `FilterProvider`: not a supported scenario (the app always wraps in `FilterProvider`); no special handling required per the constraint that `FilterContext.tsx` must not be modified.
- TypeScript type-checking of removed props: covered by requirements 5, 6, and 7 — the build must pass, confirming no stale prop references remain anywhere in the type graph.
