# Project

Task: task1
Target: frontend

## Idea

The product catalog application already renders products fetched from a backend API and manages filter state via a custom hook (`useProductFilters`). The task is to wire up the currently-incomplete filtering and sorting logic so that: (1) a text search filters products by name (case-insensitive, trimmed, partial match); (2) a category dropdown shows `All` plus every distinct category from the loaded data; (3) an in-stock checkbox hides out-of-stock products; (4) a sort dropdown orders results by price ascending/descending or rating descending; and (5) a `Clear filters` button resets all state to defaults. The solution requires implementing the missing logic inside `productFilters.ts`, completing the `FilterPanel` component UI, and completing `SortSelect`, without modifying tests, the data layer, or the API/hook files.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK1.MD`: full functional requirements, technical constraints, expected files to modify, and success criteria

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/utils/productFilters.ts`: filtering and sorting logic to implement (search, category, inStock, sortBy)
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: UI controls for search input, category dropdown, in-stock checkbox, and clear-filters button
- `src/benchmark-frontend/src/components/SortSelect.tsx`: sort dropdown UI control
- `src/benchmark-frontend/src/hooks/useProductFilters.ts`: read-only; provides state and dispatch for filters (must not be modified)
- `src/benchmark-frontend/src/App.tsx`: read-only; derives categories list and passes it plus filter state to FilterPanel
- `src/benchmark-frontend/src/types/product.ts`: read-only; defines the Product interface and FilterState/SortBy types
