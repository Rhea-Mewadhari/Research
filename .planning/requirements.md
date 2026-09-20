# Requirements

1. Selecting a sort option in the `SortSelect` dropdown must immediately update `FilterContext.sortBy` and re-order the visible product list to reflect the new sort order.
   - Verified by: `tests/contextMigration.test.tsx` — "selecting a sort option re-orders the product list" (price-asc puts Jump Rope first) and "selecting price-desc puts the most expensive product first"; `tests/sorting.test.tsx` — all three sort tests (price-asc full order, price-desc, rating-desc)

2. Clicking a "Filter by [category]" button on any `ProductCard` must call `FilterContext.setCategory` with that product's category, causing the displayed list to immediately show only products in that category.
   - Verified by: `tests/contextMigration.test.tsx` — "clicking a product category button filters the list to that category" (Electronics click yields "Showing 5 products") and "clicking a category button hides products from other categories" (Fitness click: Wireless Mouse absent, Yoga Mat present)

3. After clicking a category button on a `ProductCard`, the category `<select>` control in `FilterPanel` must display the clicked category as its selected value (i.e., `FilterContext.category` drives the FilterPanel's select, not a local copy).
   - Verified by: `tests/contextMigration.test.tsx` category tests implicitly confirm this — if the select did not reflect the new value, `useFilteredProducts` would not receive the updated category and the product count assertions would fail

4. `ProductListPage` must not contain any `useState` that holds a copy of `sortBy` (i.e., `localSortBy` must be removed). `SortSelect` must be passed `FilterContext.sortBy` as `value` and `FilterContext.setSortBy` as `onChange`.
   - Verified by: Code inspection of `src/pages/ProductListPage.tsx` — no `useState<SortOption>` or `localSortBy` variable is present; `pnpm --filter benchmark-frontend build` exits with code 0

5. `ProductCard` must not declare an `onCategoryClick` prop. Instead it must call `useFilterContext().setCategory` directly in the category button's `onClick` handler. The "Filter by [category]" button must remain in the DOM.
   - Verified by: Code inspection of `src/components/ProductCard.tsx` — `Props` type has no `onCategoryClick` field; button element is still rendered; `pnpm --filter benchmark-frontend build` exits with code 0

6. `ProductList` must not declare or pass an `onCategoryClick` prop. The prop must be removed from its `Props` type and from the `ProductCard` element it renders.
   - Verified by: Code inspection of `src/components/ProductList.tsx` — `Props` type has no `onCategoryClick` field; `pnpm --filter benchmark-frontend build` exits with code 0

7. `ProductListPage` must not pass `onCategoryClick` to `ProductList`.
   - Verified by: Code inspection of `src/pages/ProductListPage.tsx` — no `onCategoryClick` attribute on the `<ProductList>` element; `pnpm --filter benchmark-frontend build` exits with code 0

8. `FilterContext.tsx`, `useFilteredProducts.ts`, and `useDebounce.ts` must not be modified.
   - Verified by: `git diff --name-only` confirms none of those files appear in the diff

9. All pre-existing functionality (search filtering, in-stock toggle, clear filters, pagination) must continue to work correctly.
   - Verified by: `tests/filtering.test.tsx`, `tests/clearFilters.test.tsx`, `tests/pagination.test.tsx`, `tests/app.render.test.tsx`, `tests/loadingError.test.tsx` all pass under `pnpm --filter benchmark-frontend test --run`

10. All visible tests pass and the TypeScript build succeeds.
    - Verified by: `pnpm --filter benchmark-frontend test --run` exits with code 0; `pnpm --filter benchmark-frontend build` exits with code 0

## Edge cases

- Category button clicked when that category is already the active filter: covered by requirement 2 — `setCategory` is still called; the list remains correctly filtered (idempotent)
- `SortSelect` value persists across unrelated re-renders (e.g., search input change): covered by requirement 4 — `SortSelect` is controlled by `FilterContext.sortBy`, which is stable independent of search state
- "Filter by [category]" button must not disappear after removing the `onCategoryClick` prop: covered by requirement 5 — button element must remain in the DOM
- TypeScript strict mode: removing `onCategoryClick` from props must leave no dangling references that cause type errors: covered by requirements 4, 5, 6, 7 — the build check confirms no type errors
