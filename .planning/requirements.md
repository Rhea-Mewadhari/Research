# Requirements

1. `ProductListPage` must not contain any `useState` holding a copy of `sortBy` or any other value that already lives in `FilterContext`. Specifically, the `localSortBy` / `setLocalSortBy` state variable must be deleted.
   - Verified by: `grep -n "localSortBy" src/benchmark-frontend/src/pages/ProductListPage.tsx` returns no output; TypeScript build (`pnpm --filter benchmark-frontend build`) exits 0.

2. `SortSelect` must receive `sortBy` and `setSortBy` from `FilterContext` (via `ProductListPage`), not from a local state variable. Selecting a sort option must immediately re-order the rendered product list.
   - Verified by: `tests/contextMigration.test.tsx` — "selecting a sort option re-orders the product list" passes (cheapest product "Jump Rope" is the first heading after selecting `price-asc`); "selecting price-desc puts the most expensive product first" passes ("Noise-Cancelling Headphones" is first). All three tests in `tests/sorting.test.tsx` pass (full order for `price-asc` matches expected array; `price-desc` first/last correct; `rating-desc` correct).

3. The `onCategoryClick` prop must be removed from both `ProductCard` and `ProductList`. Neither component's `Props` type may declare `onCategoryClick`, and no caller may pass it.
   - Verified by: `grep -n "onCategoryClick" src/benchmark-frontend/src/components/ProductCard.tsx src/benchmark-frontend/src/components/ProductList.tsx src/benchmark-frontend/src/pages/ProductListPage.tsx` returns no output; TypeScript build (`pnpm --filter benchmark-frontend build`) exits 0.

4. `ProductCard` must call `useFilterContext().setCategory(product.category)` directly when its category button is clicked. Clicking the button must update `FilterContext.category` and cause `useFilteredProducts` to re-filter the visible list to only products in that category.
   - Verified by: `tests/contextMigration.test.tsx` — "clicking a product category button filters the list to that category" passes (`[data-testid="results-count"]` reads "Showing 5 products" after clicking "Filter by Electronics"); "clicking a category button hides products from other categories" passes ("Yoga Mat" is present and "Wireless Mouse" is absent after clicking "Filter by Fitness").

5. The category `<select>` control in `FilterPanel` must reflect the updated `FilterContext.category` value after a category button click (i.e., the select visually shows the chosen category, not "All").
   - Verified by: `tests/contextMigration.test.tsx` category-click tests pass — since `FilterPanel` receives `category` from `FilterContext` via `ProductListPage`, the select value updates automatically once `setCategory` is called correctly in `ProductCard`.

6. All pre-existing visible tests must continue to pass without modification to test files.
   - Verified by: `pnpm --filter benchmark-frontend test --run` exits 0 with all tests in `filtering.test.tsx`, `clearFilters.test.tsx`, `pagination.test.tsx`, `loadingError.test.tsx`, and `app.render.test.tsx` reported as passed.

7. `FilterContext.tsx`, `useFilteredProducts.ts`, and `useDebounce.ts` must not be modified.
   - Verified by: `git diff HEAD -- src/benchmark-frontend/src/context/FilterContext.tsx src/benchmark-frontend/src/hooks/useFilteredProducts.ts src/benchmark-frontend/src/hooks/useDebounce.ts` produces no output.

8. The category button (`<button className="card-category category-filter-btn">`) must remain present in `ProductCard` for every product.
   - Verified by: `grep -n "category-filter-btn" src/benchmark-frontend/src/components/ProductCard.tsx` returns a match; `tests/contextMigration.test.tsx` locates the button by `aria-label` (`/filter by electronics/i`, `/filter by fitness/i`) and clicks it without error.

## Edge cases

- Clicking a category button when the list is already filtered to that category: covered by requirement 4 — `setCategory` is called with the same value; `FilterContext` updates state (no-op in practice), no error thrown.
- Sort and category filter applied simultaneously: covered by requirements 2 and 4 — both `sortBy` and `category` live in `FilterContext`; `useFilteredProducts` reads both and composes them independently.
- Clear filters resets `sortBy` to `'default'`: covered by requirement 6 — `FilterContext.clearFilters` already resets `sortBy`; `SortSelect` wired to context will show "Default" after clear. `clearFilters.test.tsx` verifies this end-to-end.
- TypeScript type safety after prop removal: covered by requirements 3 and 6 — build must exit 0, meaning no lingering `onCategoryClick` references that would cause a type error.
