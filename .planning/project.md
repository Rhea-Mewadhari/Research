# Project

Task: task5
Target: frontend

## Idea

Write comprehensive integration tests for the product filtering, sorting, and UI behaviour of the React frontend. The app fetches 15 products from a mocked backend API, then filters and sorts them client-side. All six test files in `tests/` are empty stubs that must be filled in from scratch — without modifying any file under `src/`. Tests must use `@testing-library/react` and `@testing-library/user-event`, always wait for the async initial load via `await screen.findByTestId('results-count')`, and assert on specific rendered output (product names, counts, order) rather than just absence of crashes.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK5.MD`: Full task spec — objectives, mock setup, async pattern, product fixture quick-reference, list of test files to fill in, constraints, success criteria

## Affected areas (initial read, not final)

- `src/benchmark-frontend/tests/app.render.test.tsx`: Stub to fill — initial render and result count assertions
- `src/benchmark-frontend/tests/filtering.test.tsx`: Stub to fill — search, category, in-stock, and combined filter tests
- `src/benchmark-frontend/tests/sorting.test.tsx`: Stub to fill — price-asc, price-desc, rating-desc, and default sort tests
- `src/benchmark-frontend/tests/clearFilters.test.tsx`: Stub to fill — clear button resets all filters
- `src/benchmark-frontend/tests/pagination.test.tsx`: Stub to fill — Prev/Next button disabled/enabled states
- `src/benchmark-frontend/tests/loadingError.test.tsx`: Stub to fill — loading spinner visible, fetch error message displayed
- `src/benchmark-frontend/tests/setup.ts`: Read-only mock setup — stubs `global.fetch` to return all 15 products before each test
- `src/benchmark-frontend/src/App.tsx`: Root component — renders FilterPanel, SortSelect, results-count `<p>`, ProductList, Prev/Next pagination buttons, Spinner, and error alert
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: Contains search input (id="search"), category select (id="category"), in-stock checkbox (id="inStockOnly"), and "Clear filters" button
- `src/benchmark-frontend/src/components/SortSelect.tsx`: Sort select (id="sortBy") with options: default, price-asc, price-desc, rating-desc
- `src/benchmark-frontend/src/utils/productFilters.ts`: Pure filter+sort logic — used to reason about expected test outcomes
- `src/benchmark-frontend/src/data/products.ts`: 15 product fixtures — source of truth for expected names, counts, and order in assertions
- `src/benchmark-frontend/src/hooks/useProductFilters.ts`: Hook that drives async fetch, filter state, and pagination state
