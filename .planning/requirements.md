# Requirements

1. `SortSelect` in `ProductListPage` must read its `value` from `FilterContext.sortBy` and call `FilterContext.setSortBy` on change — not from any local state variable.
   - Verified by: Source inspection of `ProductListPage.tsx` — the `<SortSelect>` JSX must pass `sortBy` (destructured from `useFilterContext()`) as `value` and `setSortBy` as `onChange`; no reference to `localSortBy` or `setLocalSortBy` may remain.

2. The local sort state variable (`localSortBy` / `setLocalSortBy`) must be removed from `ProductListPage`.
   - Verified by: Source inspection of `ProductListPage.tsx` — the string `localSortBy` must not appear anywhere in the file.

3. Selecting `price-asc` from the SortSelect immediately re-orders the visible product list so that the cheapest product (Jump Rope) appears first.
   - Verified by: `tests/sorting.test.tsx` "sorts by price ascending" and `tests/contextMigration.test.tsx` "selecting a sort option re-orders the product list" both pass.

4. Selecting `price-desc` from the SortSelect immediately re-orders the visible product list so that Noise-Cancelling Headphones appears first and Jump Rope appears last.
   - Verified by: `tests/sorting.test.tsx` "sorts by price descending" and `tests/contextMigration.test.tsx` "selecting price-desc puts the most expensive product first" both pass.

5. Selecting `rating-desc` from the SortSelect immediately re-orders the visible product list so that Yoga Mat appears first.
   - Verified by: `tests/sorting.test.tsx` "sorts by rating descending" passes.

6. Clicking a "Filter by [category]" button on a `ProductCard` updates `FilterContext.category` to that product's category, causing the list to re-filter immediately.
   - Verified by: `tests/contextMigration.test.tsx` "clicking a product category button filters the list to that category" passes (clicks "Filter by Electronics"; expects `results-count` text to read "Showing 5 products").

7. After clicking a category button, only products in that category remain visible; products from other categories are removed from the DOM.
   - Verified by: `tests/contextMigration.test.tsx` "clicking a category button hides products from other categories" passes (clicks "Filter by Fitness"; Wireless Mouse is absent, Yoga Mat is present).

8. `ProductCard` must call `useFilterContext().setCategory(product.category)` directly on the category button click — not via an `onCategoryClick` prop.
   - Verified by: Source inspection of `ProductCard.tsx` — it must import `useFilterContext` and call `setCategory(product.category)` inside the category button's `onClick`; the `onCategoryClick` identifier must not appear in the file.

9. The `onCategoryClick` prop must be removed from `ProductCard`'s `Props` type and from `ProductList`'s `Props` type.
   - Verified by: Source inspection of `ProductCard.tsx` and `ProductList.tsx` — neither file may contain the identifier `onCategoryClick`.

10. The no-op `onCategoryClick={() => {}}` must be removed from the `<ProductList>` usage in `ProductListPage.tsx`.
    - Verified by: Source inspection of `ProductListPage.tsx` — the string `onCategoryClick` must not appear in the file.

11. The "Filter by [category]" button must remain rendered inside `ProductCard` and must remain accessible via `aria-label="Filter by [category]"`.
    - Verified by: `tests/contextMigration.test.tsx` locates the button via `getByRole('button', { name: /filter by electronics/i })` — the test must pass, which requires the button to be present and accessible.

12. The category button click must call `e.stopPropagation()` so that the card's own `onClick` (which opens the detail panel) is not triggered simultaneously.
    - Verified by: Source inspection of `ProductCard.tsx` — the category button `onClick` handler must include `e.stopPropagation()`.

13. `ProductList` must continue to accept and forward the `onSelect` prop to `ProductCard` unchanged.
    - Verified by: Source inspection of `ProductList.tsx` — `onSelect` remains in the Props type and is passed to each `<ProductCard>`.

14. No `useState` holding a copy of `sortBy` or `category` may be introduced in `ProductCard`, `ProductList`, or `ProductListPage` as part of this change.
    - Verified by: Source inspection of all three files — no new `useState<SortOption>` or `useState` for category-holding strings may be present after the fix.

15. All visible tests pass and the TypeScript build succeeds.
    - Verified by: `pnpm --filter benchmark-frontend test run` exits with code 0 and `pnpm --filter benchmark-frontend build` exits with code 0.

---

## Edge cases

- Category button `e.stopPropagation()`: covered by requirement 12 — the handler already contained this in the original code and must retain it.
- `SortSelect` component itself is unchanged: its `value`/`onChange` API stays identical; only the values passed from `ProductListPage` change — covered by requirements 1 and 3–5.
- `FilterContext` must not be modified: covered implicitly; requirements 1, 6, and 8 are satisfied by changes to `ProductListPage`, `ProductList`, and `ProductCard` only.
- Existing features (search, in-stock toggle, clear filters, pagination) must not regress: covered by requirement 15 (`filtering.test.tsx`, `clearFilters.test.tsx`, `pagination.test.tsx` are part of the full test run).
- `ProductList` receiving zero products still renders the "No products found." status message — this code path is untouched by the prop-drilling removal and is covered by requirement 15.
