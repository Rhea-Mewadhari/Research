# Project

Task: task7
Target: frontend

## Idea

The codebase has a `FilterContext` that holds all filter state (`search`, `category`, `inStockOnly`, `sortBy`, `debouncedSearch`), but two components were never fully migrated to use it. `ProductListPage` keeps a local `localSortBy` state that shadows `FilterContext.sortBy` and wires `SortSelect` to this local copy — so sort changes never reach `useFilteredProducts`. It also passes a no-op `onCategoryClick` callback down through `ProductList` to `ProductCard`, so clicking a product's category button does nothing. The fix is to: wire `SortSelect` directly to `FilterContext.sortBy`/`setSortBy`, remove the local sort state, have `ProductCard` call `useFilterContext().setCategory` directly (removing the prop-drilled `onCategoryClick`), and drop the now-unneeded prop from `ProductList`.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK7.MD`: Full task description — objective, requirements (fix sort, fix category click, remove prop drilling, no duplicate state), constraints (don't touch FilterContext/useFilteredProducts/useDebounce, don't add deps), affected files, and success criteria.

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/pages/ProductListPage.tsx`: Contains the buggy `localSortBy` state (line 31), wires `SortSelect` to it (line 80) instead of `FilterContext.sortBy`/`setSortBy`, and passes a no-op `onCategoryClick={() => {}}` to `ProductList` (line 97-98). Needs: remove `localSortBy`, import/use `setSortBy` from context, wire `SortSelect` to context, drop the no-op prop.
- `src/benchmark-frontend/src/components/SortSelect.tsx`: Currently a prop-controlled component — no changes needed; stays controlled via props (now from context values in `ProductListPage`).
- `src/benchmark-frontend/src/components/ProductList.tsx`: Receives and passes `onCategoryClick` prop to `ProductCard` (lines 7, 10, 24). Needs: remove the `onCategoryClick` prop from `Props` and from the `ProductCard` render.
- `src/benchmark-frontend/src/components/ProductCard.tsx`: Accepts `onCategoryClick` prop and calls it on button click (lines 9, 12, 47-49). Needs: remove the prop, import `useFilterContext`, call `setCategory(product.category)` directly from context.
- `src/benchmark-frontend/src/context/FilterContext.tsx`: Source of truth — must NOT be modified; provides `sortBy`, `setSortBy`, `category`, `setCategory`.
- `src/benchmark-frontend/src/hooks/useFilteredProducts.ts`: Reads `sortBy` and `category` from `FilterContext` — must NOT be modified; will work correctly once context is updated.
