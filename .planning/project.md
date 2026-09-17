# Project

Task: task6
Target: frontend

## Idea

Task 6 asks us to wire up filtering and sorting for a product catalog app that loads data asynchronously. The stub `filterProducts` function in `productFilters.ts` needs to be implemented to support case-insensitive name search, exact category match ("All" = no filter), in-stock toggle, and price/rating sort — all without mutating the input. The `FilterPanel` and `SortSelect` components have empty `onChange` handlers that must be connected to their respective filter-state fields. `App.tsx` currently passes `setFilters` directly to children; it must instead pass a wrapper that also resets the page to 1 on every filter change, so users don't land on an empty page when the filtered result set is shorter than the current page offset.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK6.MD`: Full requirements — filtering/sorting logic, event-handler wiring, dynamic categories, pagination reset, constraints, and expected files to modify.

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/utils/productFilters.ts`: Stub `filterProducts` must be implemented (search, category, inStockOnly, sortBy).
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: `onChange` prop is renamed `_onChange` (unused); all `onChange={() => {}}` handlers must call it with the updated `FilterState`.
- `src/benchmark-frontend/src/components/SortSelect.tsx`: `onChange` prop is renamed `_onChange` (unused); the select's `onChange` must call it with the new `sortBy` value.
- `src/benchmark-frontend/src/App.tsx`: `setFilters` is passed directly to `FilterPanel` and (via inline arrow) to `SortSelect`; both must be replaced with a wrapper that calls `setFilters` and `setPage(1)` together.
- `src/benchmark-frontend/src/hooks/useProductFilters.ts`: Read-only — provides `filters`, `setFilters`, `products`, `page`, `setPage`, `totalPages`, `isLoading`, `error`.
- `src/benchmark-frontend/src/types/product.ts`: Read-only — defines `Product` shape referenced by filter utility.
