# Project

Task: task1
Target: frontend

## Idea

Implement the filtering and sorting feature for a product catalog React application. The app already fetches products from an API and renders them, but the filter logic and filter control event handlers are stubbed out. The task requires completing `productFilters.ts` (search by name case-insensitively with trim, category filter, in-stock checkbox filter, and sort by price-asc/price-desc/rating-desc/default), wiring up onChange handlers in `FilterPanel.tsx` and `SortSelect.tsx` so user interactions propagate filter state changes, and implementing the Clear filters button reset. All filters must compose correctly (filter then sort), must not mutate the input array, and must display "No products found." when results are empty.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK1.MD`: full functional requirements — search (case-insensitive, trimmed, partial match), category (All or specific), inStockOnly, sortBy (default/price-asc/price-desc/rating-desc), clear filters reset, empty state "No products found."

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/utils/productFilters.ts`: core filter/sort logic — all TODOs need implementation; `_filters` param unused
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: `_onChange` unused, all `onChange={() => {}}` handlers are no-ops; Clear filters button does nothing
- `src/benchmark-frontend/src/components/SortSelect.tsx`: `_onChange` unused, `onChange={() => {}}` is a no-op
- `src/benchmark-frontend/src/hooks/useProductFilters.ts`: provides `clearFilters` and `setFilters`/`updateFilter` — must NOT be modified but informs how the components should call onChange
- `src/benchmark-frontend/src/App.tsx`: orchestrates state and passes props — may need to inspect to confirm wiring
- `src/benchmark-frontend/src/types/product.ts`: Product shape (id, name, category, price, inStock, rating, reviewCount, description, tags, discountPct?)
- `src/benchmark-frontend/tests/`: visible tests that must pass — should be read to understand expected behavior
