# Project

Task: task5
Target: frontend

## Idea

Write comprehensive integration tests for the product catalog app. The app fetches 15 products from a backend API (mocked in tests via `tests/setup.ts`), then filters and sorts them client-side. Six empty test stub files must be filled in, each covering a distinct area: initial render, filtering (search/category/in-stock/combined), sorting (price-asc/price-desc/rating-desc/default), clear-filters reset, pagination button states, and loading/error UI states. Tests use `@testing-library/react` and `@testing-library/user-event`, and must always wait for `data-testid="results-count"` before interacting with the app.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK5.MD`: full task spec — objective, mock setup, async pattern, product fixture data, test file table, constraints, success criteria

## Affected areas (initial read, not final)

- `tests/app.render.test.tsx`: empty stub — needs tests for initial render (heading, result count showing 15 products)
- `tests/filtering.test.tsx`: empty stub — needs tests for search input, category select, in-stock checkbox, combined filters
- `tests/sorting.test.tsx`: empty stub — needs tests for price-asc, price-desc, rating-desc, and default sort order
- `tests/clearFilters.test.tsx`: empty stub — needs tests verifying "Clear filters" button resets all filter state
- `tests/pagination.test.tsx`: empty stub — needs tests for Prev/Next button disabled/enabled states
- `tests/loadingError.test.tsx`: empty stub — needs tests for loading spinner (aria-label="loading") and fetch error (role="alert")
- `tests/setup.ts`: already stubs global.fetch to return all 15 products — read-only
- `src/App.tsx`: root component; exposes `data-testid="results-count"`, "Prev"/"Next" buttons, role="alert" error, renders FilterPanel + SortSelect + ProductList + Spinner
- `src/utils/productFilters.ts`: filterProducts() — filtering and sorting logic; FilterState type definition
- `src/hooks/useProductFilters.ts`: useProductFilters hook — fetch on mount/page change, filter state, clearFilters
- `src/components/FilterPanel.tsx`: renders #search input, #category select, #inStockOnly checkbox, "Clear filters" button
- `src/components/SortSelect.tsx`: renders #sortBy select with options default/price-asc/price-desc/rating-desc
- `src/components/ProductList.tsx`: renders `<section aria-label="Product results">` or `<p role="status">No products found.</p>`
- `src/components/ProductCard.tsx`: renders `data-testid="product-{id}"` with product name as h3
- `src/components/Spinner.tsx`: renders `<div aria-label="loading">` during fetch
- `src/data/products.ts`: 15 products — 5 Electronics/5 Fitness/5 Accessories; 4 out-of-stock (USB-C Hub, Noise-Cancelling Headphones, Dumbbell Set, Desk Lamp); cheapest Jump Rope $15, most expensive Noise-Cancelling Headphones $149; highest rated Yoga Mat 4.8 then Mechanical Keyboard 4.7
