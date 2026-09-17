# Project

Task: task6
Target: frontend

## Idea

Wire up filtering and sorting for a product catalog app that loads data asynchronously from a backend API. The `filterProducts` utility function has stubs for search (case-insensitive, trimmed), category (exact match, "All" = no filter), in-stock, and sorting (price-asc, price-desc, rating-desc) — all must be implemented without mutating the input array. The `FilterPanel` and `SortSelect` components have empty `onChange` handlers that must be connected to the `onChange` prop. In `App.tsx`, the direct `setFilters` prop must be replaced with a wrapped handler that also resets page to 1 on every filter change.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK6.MD`: Full task specification — objectives, requirements (filterProducts, FilterPanel, SortSelect, App.tsx wrapper), technical constraints, expected files, and success criteria

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/utils/productFilters.ts`: Core filtering/sorting logic — all four TODO stubs need implementing
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: Three input onChange handlers (search, category, inStockOnly) and Clear Filters button onClick are empty no-ops; must call `onChange` with updated FilterState; also receives `_onChange` as a renamed unused prop (rename to `onChange`)
- `src/benchmark-frontend/src/components/SortSelect.tsx`: Select onChange is a no-op; `_onChange` prop renamed/unused — must call `onChange` with the new sortBy value
- `src/benchmark-frontend/src/App.tsx`: Currently passes `setFilters` directly to `FilterPanel`; must wrap it so that any filter change also calls `setPage(1)`; SortSelect already has a partial wrapper but it does not reset the page
