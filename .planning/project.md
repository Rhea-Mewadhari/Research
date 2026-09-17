# Project

Task: task6
Target: frontend

## Idea

Implement filtering and sorting for a product catalog that already loads data asynchronously from a backend API (`http://localhost:3000/products`). The task requires: (1) implementing the `filterProducts` utility function in `productFilters.ts` to handle name search, category, in-stock, and sort-by fields; (2) wiring up event handlers in `FilterPanel.tsx` and `SortSelect.tsx` so user interactions update filter state; (3) ensuring the category dropdown is populated dynamically from loaded product data rather than hardcoded; and (4) wrapping the `setFilters` call in `App.tsx` to also reset pagination to page 1 whenever any filter changes.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK6.MD`: Full task spec — covers filterProducts implementation, handler wiring, dynamic categories, and pagination reset requirement

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/utils/productFilters.ts`: Must implement `filterProducts` function (currently a stub)
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: Must wire up onChange handlers for search input, category dropdown, in-stock checkbox, and Clear Filters button
- `src/benchmark-frontend/src/components/SortSelect.tsx`: Must wire up onChange handler for sort dropdown
- `src/benchmark-frontend/src/App.tsx`: Must wrap `setFilters` with a handler that also calls `setPage(1)`, and pass the wrapper to FilterPanel and SortSelect
- `src/benchmark-frontend/src/types/`: Likely defines `Product`, `FilterState`, and `PaginatedResponse` types
- `src/benchmark-frontend/src/hooks/useProductFilters.ts`: Read-only — understand hook shape but do not modify
- `src/benchmark-frontend/src/api/productsApi.ts`: Read-only — understand API shape but do not modify
