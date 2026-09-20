# Requirements

1. Selecting the "price-asc" option in the Sort By dropdown re-orders the displayed product list so that the cheapest product ("Jump Rope") appears first in the product grid, and the most expensive ("Noise-Cancelling Headphones") appears last.
   - Verified by: `tests/contextMigration.test.tsx` — "selecting a sort option re-orders the product list" and `tests/sorting.test.tsx` — "sorts by price ascending" both pass.

2. Selecting the "price-desc" option in the Sort By dropdown places "Noise-Cancelling Headphones" first and "Jump Rope" last in the product grid.
   - Verified by: `tests/contextMigration.test.tsx` — "selecting price-desc puts the most expensive product first" and `tests/sorting.test.tsx` — "sorts by price descending" both pass.

3. Clicking the "Filter by [category]" button on any `ProductCard` updates `FilterContext.category` to that product's category and immediately re-filters the product list, changing the `[data-testid="results-count"]` text to reflect only the products in that category.
   - Verified by: `tests/contextMigration.test.tsx` — "clicking a product category button filters the list to that category" passes (clicking "Filter by Electronics" shows "Showing 5 products").

4. Clicking a category button on a card hides products from other categories and keeps products from the clicked category visible in the DOM.
   - Verified by: `tests/contextMigration.test.tsx` — "clicking a category button hides products from other categories" passes (clicking "Filter by Fitness" removes "Wireless Mouse" from DOM and keeps "Yoga Mat" in DOM).

5. `ProductListPage.tsx` contains no `useState` call that holds a copy of `sortBy` or a `SortOption` value (the `localSortBy` state variable is removed). `SortSelect` must receive `value={sortBy}` and `onChange={setSortBy}` sourced from `useFilterContext()`.
   - Verified by: TypeScript build succeeds (`pnpm --filter benchmark-frontend build` exits 0) and grepping `src/pages/ProductListPage.tsx` for `localSortBy` returns no matches.

6. `ProductCard.tsx` accepts no `onCategoryClick` prop. Its `Props` type has no `onCategoryClick` field. The category button's `onClick` handler calls `setCategory(product.category)` obtained directly from `useFilterContext()`.
   - Verified by: TypeScript build succeeds and grepping `src/components/ProductCard.tsx` for `onCategoryClick` returns no matches.

7. `ProductList.tsx` accepts no `onCategoryClick` prop. Its `Props` type has no `onCategoryClick` field and it does not pass any such prop to `ProductCard`.
   - Verified by: TypeScript build succeeds and grepping `src/components/ProductList.tsx` for `onCategoryClick` returns no matches.

8. `ProductListPage.tsx` does not pass an `onCategoryClick` prop to `ProductList`.
   - Verified by: TypeScript build succeeds and grepping `src/pages/ProductListPage.tsx` for `onCategoryClick` returns no matches.

9. The files `src/context/FilterContext.tsx`, `src/hooks/useFilteredProducts.ts`, and `src/hooks/useDebounce.ts` are not modified.
   - Verified by: `git diff -- src/benchmark-frontend/src/context/FilterContext.tsx src/benchmark-frontend/src/hooks/useFilteredProducts.ts src/benchmark-frontend/src/hooks/useDebounce.ts` produces no output.

10. No new packages are added to `package.json` or `pnpm-lock.yaml`.
    - Verified by: `git diff -- src/benchmark-frontend/package.json` produces no output.

11. All previously passing visible tests continue to pass: search filtering, in-stock toggle, clear filters, pagination, loading/error states, and app render.
    - Verified by: `pnpm --filter benchmark-frontend test` exits 0 with all test suites in `tests/` passing (filtering, clearFilters, pagination, loadingError, app.render, sorting, contextMigration).

12. The TypeScript build produces no type errors.
    - Verified by: `pnpm --filter benchmark-frontend build` exits 0 with no diagnostic output.

## Edge cases

- Clicking the category button on a card that is already matching the active category filter: covered by requirement 3 (the handler always calls `setCategory(product.category)` unconditionally; `FilterContext` handles idempotent updates).
- The Sort By dropdown reverts to "Default" when `clearFilters` is called (because `FilterContext.sortBy` resets): covered by requirement 11 — `clearFilters.test.tsx` must still pass, meaning the sort control reflects context state and not a stale local copy.
- Category button click must not propagate to the card's `onClick` handler (which opens the detail panel): covered by requirement 4 — the category button already calls `e.stopPropagation()` in the current code; this must be preserved in the refactored version.
- `SortSelect` retains its existing controlled-component interface (receives `value` and `onChange` as props from its caller); only the caller changes from `localSortBy`/`setLocalSortBy` to `sortBy`/`setSortBy`: covered by requirements 1, 2, and 12 (no changes required to `SortSelect.tsx` itself; build and tests confirm the wiring is correct).
