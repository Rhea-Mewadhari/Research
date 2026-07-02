# Task 7: Frontend Refactoring — Context Migration

## Objective

Complete the migration of filter state from prop drilling to the existing React Context architecture.

---

## Context

The codebase was partially migrated to use Context for filter state. `FilterContext` exists, is correctly initialised, and is the source of truth for `search`, `category`, `inStockOnly`, `sortBy`, and `debouncedSearch`.

However, two components were not fully migrated:

- **`SortSelect`** is receiving its `value` from a local state variable in `ProductListPage` that is never written back to `FilterContext`. As a result, changing the sort order via the dropdown has no effect on the displayed products — `useFilteredProducts` reads `sortBy` from `FilterContext`, which remains at `'default'`.

- **`ProductCard`** receives an `onCategoryClick` prop drilled down through `ProductList`. The callback wired up in `ProductListPage` is an empty no-op, so clicking a product's category button does nothing.

Your job is to complete the migration so that both interactions work correctly and no filter state is duplicated outside `FilterContext`.

---

## Requirements

### 1. Fix sort order

`SortSelect` must reflect and update `FilterContext.sortBy`. After the fix, selecting a sort option must immediately re-order the visible product list.

### 2. Fix category click

Each `ProductCard` renders a button labelled **Filter by [category]**. Clicking it must update `FilterContext.category` to that product's category and re-filter the visible list accordingly.

### 3. Remove prop drilling

The following drilled props must be removed:

- The local sort state variable in `ProductListPage`
- The `onCategoryClick` prop from `ProductCard` and `ProductList`
- The broken callback passed from `ProductListPage`

### 4. No duplicate state

There must be no `useState` holding a copy of any value that already lives in `FilterContext`. Components that read filter values must consume them from the context, not from props.

---

## Constraints

- Do not change functionality that is already working (search, in-stock toggle, clear filters, pagination)
- Do not remove the category button from `ProductCard`
- Do not modify `FilterContext.tsx`, `useFilteredProducts.ts`, or `useDebounce.ts`
- Do not add new dependencies

---

## Decision surfaces

Not every component needs to change. Some already read from `FilterContext` correctly. Audit each component before modifying it:

- `FilterPanel` — already reads from context via props passed from `ProductListPage`; no change required
- `SortSelect` — needs to be wired to context
- `ProductCard` — needs to call `FilterContext.setCategory` directly
- `ProductList` — only needs to drop the drilled prop
- `ProductListPage` — remove local state; wire `SortSelect` to context values

---

## Expected Files to Modify

- `src/pages/ProductListPage.tsx`
- `src/components/ProductList.tsx`
- `src/components/ProductCard.tsx`

---

## Success Criteria

1. Selecting a sort option re-orders the product list immediately
2. Clicking a product's category button filters the list to that category
3. The category filter `<select>` control reflects the updated value after the click
4. No `useState` in any component holds a copy of `sortBy` or `category`
5. All visible tests pass and the build succeeds
