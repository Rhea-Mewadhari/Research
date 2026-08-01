# Task 6: Frontend Integration Task

## Objective

Fix a pagination bug in the product catalog: changing a filter or sort while on a page other than 1 leaves the user on that page number even though the filtered result set is now shorter.

---

## Context

The application fetches paginated product data asynchronously via `ProductContext` (`page`, `totalPages`, `setPage`). Filtering and sorting state lives in `FilterContext` (`search`, `category`, `inStockOnly`, `sortBy`, `debouncedSearch`), and `useFilteredProducts` applies `filterProducts` client-side against the currently loaded page of products.

`ProductListPage` wires these together:

- `handleFiltersChange` receives updates from `FilterPanel` and calls `setSearch` / `setCategory` / `setInStockOnly`
- `SortSelect` is wired directly to `FilterContext.sortBy` / `setSortBy`
- `FilterPanel`'s "Clear filters" button calls `FilterContext.clearFilters` directly via the `onClear` prop

None of these three paths ever call `setPage`. So if the user is on page 3, then changes the search term (or category, in-stock toggle, sort order, or hits Clear filters), they stay on page 3 — which may now be out of range or simply show the wrong slice of the newly-filtered results.

---

## Requirements

### Pagination reset on filter change

Whenever search, category, in-stock, sort, or "Clear filters" changes, reset the page back to 1 as well.

- `handleFiltersChange` in `ProductListPage.tsx` must call `setPage(1)` in addition to updating the filter context
- The handler passed to `SortSelect`'s `onChange` must call `setPage(1)` in addition to `setSortBy`
- The handler passed to `FilterPanel`'s `onClear` must call `setPage(1)` in addition to `clearFilters`

---

## Technical Constraints

- Do not modify `FilterContext.tsx`, `ProductContext.tsx`, `useFilteredProducts.ts`, or `useDebounce.ts`
- Do not modify `FilterPanel.tsx` or `SortSelect.tsx` — they already forward whatever handlers they're given
- Do not change filtering/sorting behavior itself — `productFilters.ts` is already correct
- Do not add new dependencies
- The app must build and all visible tests must pass

---

## Expected Files to Modify

- `src/pages/ProductListPage.tsx` — wrap the search/category/inStock, sort, and clear-filters handlers so each also resets the page to 1

---

## Success Criteria

1. All visible tests pass
2. Changing the search term while on page 2+ returns to page 1
3. Changing category, in-stock, or sort while on page 2+ returns to page 1
4. Clicking "Clear filters" while on page 2+ returns to page 1
5. No other filtering, sorting, or pagination behavior regresses
