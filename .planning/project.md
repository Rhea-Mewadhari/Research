# Project

Task: task7
Target: frontend

## Idea

Complete the migration of filter state from prop-drilling to the existing `FilterContext` architecture. Two components were left behind in a partial migration: `SortSelect` is reading from and writing to a local `localSortBy` state in `ProductListPage` instead of `FilterContext.sortBy`/`setSortBy`, so sort changes have no effect on the rendered list; and `ProductCard` receives an `onCategoryClick` prop that is passed as an empty no-op from `ProductListPage`, so clicking a product's category button does nothing. The fix removes the duplicated local state and the drilled prop, then wires both components directly to `FilterContext`.

## Spec pointers

- `benchmark-frontend/instructions/TASK7.MD`: Full requirements — fix sort wiring, fix category click, remove prop drilling, no duplicate state, constraints on what must not change

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/pages/ProductListPage.tsx`: Has `localSortBy` useState that duplicates FilterContext.sortBy; passes it to SortSelect; passes empty `onCategoryClick={() => {}}` to ProductList — both bugs live here
- `src/benchmark-frontend/src/components/ProductList.tsx`: Threads the `onCategoryClick` prop through to ProductCard — needs the prop removed
- `src/benchmark-frontend/src/components/ProductCard.tsx`: Declares `onCategoryClick` prop and calls it on button click — needs to call `useFilterContext().setCategory` directly instead
- `src/benchmark-frontend/src/context/FilterContext.tsx`: Source of truth for filter state (must NOT be modified)
- `src/benchmark-frontend/src/hooks/useFilteredProducts.ts`: Reads `sortBy` from FilterContext (must NOT be modified)
- `src/benchmark-frontend/src/components/SortSelect.tsx`: Will receive `sortBy`/`setSortBy` from FilterContext via ProductListPage (read to confirm its props interface)
