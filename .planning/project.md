# Project

Task: task7
Target: frontend

## Idea

The codebase has a `FilterContext` that is the authoritative source of truth for all filter state (`search`, `category`, `inStockOnly`, `sortBy`, `debouncedSearch`). A migration to this context was started but left incomplete in two places: (1) `SortSelect` is driven by a duplicate local `useState` in `ProductListPage` that is never written back to `FilterContext`, so sorting has no effect on the rendered list; and (2) `ProductCard` receives an `onCategoryClick` prop drilled through `ProductList` from `ProductListPage`, where the callback is a no-op, so clicking a category button does nothing. The task is to complete the migration by wiring both `SortSelect` and `ProductCard` directly to `FilterContext`, removing the duplicate local state and the drilled prop.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK7.MD`: Full requirements — fix sort order, fix category click, remove prop drilling, no duplicate state; lists exact constraints and files to modify.

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/pages/ProductListPage.tsx`: Holds a local `useState` for sort that shadows `FilterContext.sortBy`; passes a no-op `onCategoryClick` down; needs the local state removed and `SortSelect` wired to context.
- `src/benchmark-frontend/src/components/ProductList.tsx`: Passes the drilled `onCategoryClick` prop down to `ProductCard`; needs that prop removed.
- `src/benchmark-frontend/src/components/ProductCard.tsx`: Receives `onCategoryClick` as a prop; needs to call `FilterContext.setCategory` directly instead.
- `src/benchmark-frontend/src/components/SortSelect.tsx`: Currently controlled by external prop; may need to read/write context directly or continue to accept props (depending on implementation).
- `src/benchmark-frontend/src/context/FilterContext.tsx`: Read-only reference — defines the context shape including `setCategory` and `setSortBy`; must not be modified.
- `src/benchmark-frontend/src/hooks/useFilteredProducts.ts`: Read-only reference — consumes `FilterContext` for filtering/sorting; must not be modified.
- `src/benchmark-frontend/tests/`: Visible tests that must pass after the change; must not be modified.
