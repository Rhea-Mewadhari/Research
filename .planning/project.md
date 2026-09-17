# Project

Task: task6
Target: frontend

## Idea

Wire up the filtering and sorting feature for a product catalog that fetches data asynchronously from a backend API. The core work is: (1) implement the `filterProducts` utility function which currently has only TODO stubs, (2) connect the event handlers in `FilterPanel` and `SortSelect` (all onChange handlers currently no-op), and (3) update `App.tsx` so that any filter change also resets the page back to 1. Dynamic category options are already derived from loaded product data and passed as a prop — they just need the onChange wiring to work.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK6.MD`: Full task spec — filtering/sorting requirements, event-handler wiring, pagination reset on filter change, dynamic categories, constraints (no modifying API/hook files), and list of expected files to modify.

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/utils/productFilters.ts`: Core logic stub — needs full implementation of search (case-insensitive, trimmed), category (exact match, "All" = no filter), inStockOnly, and sort (price-asc, price-desc, rating-desc); must not mutate input array.
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: All four onChange handlers are currently `() => {}` no-ops; need to call `onChange` with updated FilterState; Clear Filters button must reset to defaults.
- `src/benchmark-frontend/src/components/SortSelect.tsx`: The select's onChange is a no-op; needs to call `onChange` with the new sortBy value cast to the correct union type.
- `src/benchmark-frontend/src/App.tsx`: Currently passes `setFilters` directly to `FilterPanel` and an inline lambda to `SortSelect`; must wrap both so that any filter update also calls `setPage(1)`.
- `src/benchmark-frontend/src/types/product.ts`: Read-only reference for the `Product` interface shape (needed to implement filters correctly).
- `src/benchmark-frontend/src/hooks/useProductFilters.ts`: Read-only reference — must not be modified; defines what `filters`, `setFilters`, `page`, `setPage` look like.
- `src/benchmark-frontend/tests/`: Visible tests — must all pass; must not be modified.
