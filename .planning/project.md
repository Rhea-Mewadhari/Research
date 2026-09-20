# Project

Task: task7
Target: frontend

## Idea

Complete a partial migration of filter state from prop drilling to the existing `FilterContext` architecture. Two bugs exist: (1) `SortSelect` is wired to a local `localSortBy` state variable in `ProductListPage` instead of `FilterContext.sortBy`/`setSortBy`, so sort changes never reach `useFilteredProducts`; (2) `ProductCard` receives an `onCategoryClick` prop drilled through `ProductList` that is wired to a no-op in `ProductListPage`, so clicking a product's category button does nothing. The fix removes the local sort state, removes the drilled `onCategoryClick` prop, and has `SortSelect` and `ProductCard` consume `FilterContext` directly.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK7.MD`: Full task spec — describes both bugs, lists requirements (fix sort, fix category click, remove prop drilling, no duplicate state), constraints (do not modify `FilterContext.tsx`, `useFilteredProducts.ts`, `useDebounce.ts`), and lists expected files to modify.

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/pages/ProductListPage.tsx`: Contains `localSortBy`/`setLocalSortBy` (duplicate of context state), wires `SortSelect` to local state, passes no-op `onCategoryClick={() => {}}` to `ProductList` — needs both bugs fixed.
- `src/benchmark-frontend/src/components/ProductList.tsx`: Accepts and drills `onCategoryClick` prop to `ProductCard` — prop must be removed from the type and the component.
- `src/benchmark-frontend/src/components/ProductCard.tsx`: Accepts `onCategoryClick` prop and calls it on category button click — must be changed to call `useFilterContext().setCategory` directly.
- `src/benchmark-frontend/src/components/SortSelect.tsx`: Currently receives `value`/`onChange` from `ProductListPage`; will now receive them from context (no change to `SortSelect` itself unless its API needs adjustment — likely stays as-is, just the caller changes).
- `src/benchmark-frontend/src/context/FilterContext.tsx`: Read-only reference — must not be modified; already exposes `sortBy`, `setSortBy`, `category`, `setCategory`.
