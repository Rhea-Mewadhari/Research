# Project

Task: task7
Target: frontend

## Idea

The filter state migration from prop drilling to React Context was partially completed. Two interactions are broken: (1) the sort dropdown (`SortSelect`) is wired to a local `localSortBy` state variable in `ProductListPage` instead of `FilterContext.setSortBy`, so changing sort order has no visible effect on the product list; and (2) clicking a product category button in `ProductCard` calls an `onCategoryClick` prop that is passed down as a no-op from `ProductListPage`, so category-click filtering does nothing. The task is to complete the migration by removing the duplicate local sort state, wiring `SortSelect` directly to context, having `ProductCard` call `FilterContext.setCategory` directly, and removing the now-unnecessary `onCategoryClick` prop from `ProductCard` and `ProductList`.

## Spec pointers

- `benchmark-frontend/instructions/TASK7.MD`: Full requirements — fix sort order, fix category click, remove prop drilling, eliminate duplicate state; lists exact files to modify and success criteria

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/pages/ProductListPage.tsx`: Contains the duplicate `localSortBy` useState (line 31) and wires SortSelect to it (line 80); passes no-op `onCategoryClick` to ProductList (line 97); must remove localSortBy and wire SortSelect to context's `sortBy`/`setSortBy`
- `src/benchmark-frontend/src/components/ProductList.tsx`: Accepts and drills `onCategoryClick` prop to ProductCard; prop must be removed
- `src/benchmark-frontend/src/components/ProductCard.tsx`: Accepts `onCategoryClick` prop and calls it on category button click (line 48-49); must instead consume `useFilterContext().setCategory` directly
- `src/benchmark-frontend/src/components/SortSelect.tsx`: Receives `value` and `onChange` props — no change needed; will be correctly wired from the page
- `src/benchmark-frontend/src/context/FilterContext.tsx`: Source of truth — already exposes `sortBy`, `setSortBy`, `setCategory`; must NOT be modified
