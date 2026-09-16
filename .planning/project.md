# Project

Task: task5
Target: frontend

## Idea

Write comprehensive integration tests for the product filtering, sorting, clear-filters, pagination, and loading/error UI behaviour. All six test files under `tests/` are empty stubs that must be filled in from scratch. Tests render `<App />`, wait for the mocked fetch to resolve (keyed on `data-testid="results-count"`), then interact with labelled controls and assert on specific rendered output (product names, counts, order). The global `fetch` mock is already configured in `tests/setup.ts` and returns all 15 products; tests must not add their own fetch mocks or modify any `src/` files.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK5.MD`: full task description — objectives, async pattern, product fixture values, per-file areas, constraints, success criteria

## Affected areas (initial read, not final)

- `src/benchmark-frontend/tests/app.render.test.tsx`: stub to fill — initial render and results-count assertion
- `src/benchmark-frontend/tests/filtering.test.tsx`: stub to fill — search, category, in-stock, combined filter scenarios
- `src/benchmark-frontend/tests/sorting.test.tsx`: stub to fill — price-asc, price-desc, rating-desc, default sort order
- `src/benchmark-frontend/tests/clearFilters.test.tsx`: stub to fill — clear button resets all active filters
- `src/benchmark-frontend/tests/pagination.test.tsx`: stub to fill — Prev/Next button disabled states
- `src/benchmark-frontend/tests/loadingError.test.tsx`: stub to fill — loading spinner visible during fetch, error message on fetch failure
- `src/benchmark-frontend/tests/setup.ts`: read-only — global fetch stub returning 15 products in `{ data, total, page, limit, totalPages }` shape
- `src/benchmark-frontend/src/App.tsx`: read-only — root component; exposes `data-testid="results-count"`, Prev/Next buttons, Spinner, role="alert" error paragraph
- `src/benchmark-frontend/src/utils/productFilters.ts`: read-only — `filterProducts` with search/category/inStockOnly/sortBy logic
- `src/benchmark-frontend/src/hooks/useProductFilters.ts`: read-only — async fetch on mount/page change, `clearFilters` resets to initialFilters
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: read-only — labelled inputs: `#search`, `#category` (select), `#inStockOnly` (checkbox), "Clear filters" button
- `src/benchmark-frontend/src/components/SortSelect.tsx`: read-only — `#sortBy` select with options default/price-asc/price-desc/rating-desc
- `src/benchmark-frontend/src/components/Spinner.tsx`: read-only — renders `aria-label="loading"` div
- `src/benchmark-frontend/src/data/products.ts`: read-only — 15 products: 5 Electronics, 5 Fitness, 5 Accessories; 4 out of stock; Yoga Mat highest rated (4.8); Jump Rope cheapest ($15); Noise-Cancelling Headphones most expensive ($149)
