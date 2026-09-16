# Project

Task: task5
Target: frontend

## Idea

Write comprehensive integration tests for the React product-catalog frontend. The app fetches 15 products from a backend API, then filters and sorts them client-side. Six empty test-stub files need to be filled in from scratch — covering initial render, search/category/in-stock filtering, price and rating sorting, clear-filters behaviour, pagination button states, and loading/error states. The mock `fetch` is already wired up in `tests/setup.ts`; tests must use `@testing-library/react` and `@testing-library/user-event`, import `App` from `'../src/App'`, and must not modify any file under `src/`.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK5.MD`: Full task description — objective, context, async pattern, product fixture quick-reference, table of six test files to fill, constraints, and success criteria

## Affected areas (initial read, not final)

- `src/benchmark-frontend/tests/app.render.test.tsx`: Stub — needs initial render and result-count tests
- `src/benchmark-frontend/tests/filtering.test.tsx`: Stub — needs search, category, in-stock, and combined-filter tests
- `src/benchmark-frontend/tests/sorting.test.tsx`: Stub — needs price-asc, price-desc, rating-desc, and default sort tests
- `src/benchmark-frontend/tests/clearFilters.test.tsx`: Stub — needs clear-button reset tests
- `src/benchmark-frontend/tests/pagination.test.tsx`: Stub — needs Prev/Next disabled-state tests
- `src/benchmark-frontend/tests/loadingError.test.tsx`: Stub — needs loading spinner and fetch-error tests
- `src/benchmark-frontend/tests/setup.ts`: Already complete — stubs `global.fetch` to return all 15 products; do not modify
- `src/benchmark-frontend/src/App.tsx`: Root component; renders FilterPanel, SortSelect, results-count (data-testid="results-count"), ProductList, and Prev/Next pagination buttons
- `src/benchmark-frontend/src/utils/productFilters.ts`: Pure `filterProducts` function — handles search, category, inStockOnly, and sortBy
- `src/benchmark-frontend/src/hooks/useProductFilters.ts`: State hook — fetches products on mount (and on page change), exposes filters, setFilters, clearFilters, isLoading, error, page, totalPages, setPage
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: Renders search input (id="search"), category select (id="category"), in-stock checkbox (id="inStockOnly"), and "Clear filters" button
- `src/benchmark-frontend/src/components/SortSelect.tsx`: Renders sort select (id="sortBy") with options: default, price-asc, price-desc, rating-desc
- `src/benchmark-frontend/src/data/products.ts`: 15 products — Electronics(5), Fitness(5), Accessories(5); 4 out of stock (USB-C Hub, Noise-Cancelling Headphones, Dumbbell Set, Desk Lamp); highest rated Yoga Mat (4.8); cheapest Jump Rope ($15); most expensive Noise-Cancelling Headphones ($149)
