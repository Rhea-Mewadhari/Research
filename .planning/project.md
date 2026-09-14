# Project

Task: task1
Target: frontend

## Idea

The product catalog application has a filtering and sorting UI already scaffolded but non-functional. The `filterProducts` utility function is a stub (returns all products unchanged), the `FilterPanel` component has empty `onChange` handlers, and `SortSelect` has a no-op `onChange`. The task is to wire up the three pieces: implement the `filterProducts` utility (search by name case-insensitively with trimming, filter by category, filter by in-stock, sort by price-asc/price-desc/rating-desc without mutating the source array), connect `FilterPanel`'s inputs to call the real `onChange` prop (including the Clear filters button), and connect `SortSelect`'s select to call its `onChange` prop. An empty-state message ("No products found.") must also be shown when no products match.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK1.MD`: full functional requirements, technical constraints, expected files to modify, and success criteria

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/utils/productFilters.ts`: stub `filterProducts` function needs full implementation (search, category, in-stock, sort)
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: all `onChange={() => {}}` handlers need to call the `onChange` prop; Clear filters button needs to reset state via `onChange`
- `src/benchmark-frontend/src/components/SortSelect.tsx`: `onChange={() => {}}` handler needs to call the `onChange` prop
- `src/benchmark-frontend/src/components/ProductList.tsx`: may need to show "No products found." empty state
- `src/benchmark-frontend/src/App.tsx`: read-only reference — wires `filterProducts`, `FilterPanel`, and `SortSelect` together; `clearFilters` resets to `initialFilters`
- `src/benchmark-frontend/src/hooks/useProductFilters.ts`: do not modify — provides `setFilters` and `clearFilters`
- `src/benchmark-frontend/src/types/product.ts`: read-only reference for the `Product` interface shape
