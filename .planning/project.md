# Project

Task: task5
Target: frontend

## Idea

Write comprehensive integration tests for the frontend product catalog app. The app fetches 15 products from a backend API, then filters and sorts them client-side. Six empty test stub files must be filled in from scratch, covering: initial render and result count, search/category/in-stock/combined filtering, price and rating sorting, clear-filters behaviour, pagination button states, and loading spinner + fetch error states. The global fetch mock is already configured in `tests/setup.ts` to return all 15 products; tests must wait for the async load before interacting or asserting.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK5.MD`: full task description — which test files to fill, async pattern requirement, product fixture quick-reference, constraints (no src/ modifications, import App from `'../src/App'`, use @testing-library/react and user-event)

## Affected areas (initial read, not final)

- `src/benchmark-frontend/tests/app.render.test.tsx`: stub to fill — initial render, result count (shows "15 products")
- `src/benchmark-frontend/tests/filtering.test.tsx`: stub to fill — search by name, filter by category, in-stock checkbox, combined filters
- `src/benchmark-frontend/tests/sorting.test.tsx`: stub to fill — price-asc (Jump Rope first), price-desc (Noise-Cancelling Headphones first), rating-desc (Yoga Mat first), default order
- `src/benchmark-frontend/tests/clearFilters.test.tsx`: stub to fill — clear button resets active filters back to default state
- `src/benchmark-frontend/tests/pagination.test.tsx`: stub to fill — Prev disabled on page 1, Next disabled when totalPages=1
- `src/benchmark-frontend/tests/loadingError.test.tsx`: stub to fill — spinner shown while loading, error message shown on fetch failure
- `src/benchmark-frontend/tests/setup.ts`: read-only — stubs global fetch to return all 15 products with shape `{ data, total, page, limit, totalPages }`
- `src/benchmark-frontend/src/App.tsx`: root component — renders FilterPanel, SortSelect, results-count p[data-testid], ProductList, Prev/Next pagination buttons, Spinner, and error alert
- `src/benchmark-frontend/src/utils/productFilters.ts`: filterProducts() — search trim/lowercase, category filter, inStockOnly filter, sort by price-asc/price-desc/rating-desc
- `src/benchmark-frontend/src/hooks/useProductFilters.ts`: useProductFilters — manages filters state, fetches products on mount/page change, exposes clearFilters
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: renders search input (id="search"), category select (id="category"), in-stock checkbox (id="inStockOnly"), Clear filters button
- `src/benchmark-frontend/src/data/products.ts`: 15 products — Electronics(5), Fitness(5), Accessories(5); 4 out of stock (USB-C Hub, Noise-Cancelling Headphones, Dumbbell Set, Desk Lamp); highest rated: Yoga Mat (4.8); cheapest: Jump Rope ($15); most expensive: Noise-Cancelling Headphones ($149)
