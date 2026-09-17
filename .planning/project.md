# Project

Task: task6
Target: frontend

## Idea

Implement filtering, sorting, and filter-state wiring for a product catalog that already loads data asynchronously from a backend API. The core work is: (1) implementing the `filterProducts` utility function in `productFilters.ts` to filter by name/category/in-stock and sort by price/rating without mutating the input; (2) wiring up all event handlers in `FilterPanel.tsx` and `SortSelect.tsx` so user interactions update the shared filter state; (3) ensuring the category dropdown is populated dynamically from the fetched product data rather than a hardcoded list; and (4) wrapping `setFilters` in `App.tsx` so that any filter change also resets the current page back to 1.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK6.MD`: Full task specification — filtering/sorting logic, filter control wiring, dynamic categories, pagination reset requirement, constraints, and expected files to modify.

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/utils/productFilters.ts`: Contains `filterProducts` stub that needs full implementation (name/category/inStock filtering + price/rating sorting, no input mutation)
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: Filter controls (search input, category dropdown, in-stock checkbox, Clear Filters button) need onChange/onClick handlers wired to filter state
- `src/benchmark-frontend/src/components/SortSelect.tsx`: Sort dropdown needs onChange handler wired to filter state
- `src/benchmark-frontend/src/App.tsx`: Must wrap `setFilters` in a handler that also calls `setPage(1)`, pass wrapper to `FilterPanel` and `SortSelect`
- `src/benchmark-frontend/src/types/product.ts`: Product type definition — read-only, needed to understand the data shape
- `src/benchmark-frontend/src/hooks/useProductFilters.ts`: FilterState type and hook — read-only per constraints, but must understand its shape to wire handlers correctly
- `src/benchmark-frontend/src/api/productsApi.ts`: Data-fetching logic — read-only per constraints
