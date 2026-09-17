# Milestone

Task: task6
Target: frontend

## Requirements addressed

- Req 1 — filterProducts filters by name (case-insensitive trim): verified — filtering.test.tsx "filters products by search term" passed (3/3 tests, 144ms)
- Req 2 — filterProducts filters by category (exact match / 'All'): verified — filtering.test.tsx "filters products by category" passed
- Req 3 — filterProducts filters by in-stock status: verified — filtering.test.tsx "filters products by in-stock only" passed
- Req 4 — filterProducts sorts by price ascending: verified — sorting.test.tsx "sorts by price ascending" passed (3/3 tests, 145ms)
- Req 5 — filterProducts sorts by price descending: verified — sorting.test.tsx "sorts by price descending" passed
- Req 6 — filterProducts sorts by rating descending: verified — sorting.test.tsx "sorts by rating descending" passed
- Req 7 — filterProducts does not mutate input array: verified — all 3 sorting tests passed with consistent ordering across independent renders
- Req 8 — filterProducts with sortBy='default' preserves arrival order: verified — app.render.test.tsx showed 'Showing 15 products' on initial render (1/1 test, 59ms)
- Req 9 — FilterPanel search input wired: verified — filtering.test.tsx "filters products by search term" required onChange to update state
- Req 10 — FilterPanel category dropdown wired: verified — filtering.test.tsx "filters products by category" required category select onChange to update state
- Req 11 — FilterPanel in-stock checkbox wired: verified — filtering.test.tsx "filters products by in-stock only" required checkbox onChange to update state
- Req 12 — FilterPanel Clear Filters button wired: verified — clearFilters.test.tsx passed (1/1 test, 131ms); confirmed reset to { search:'', category:'All', inStockOnly:false, sortBy:'default' }
- Req 13 — SortSelect sort dropdown wired: verified — all 3 sorting tests in sorting.test.tsx passed
- Req 14 — Category options derived dynamically from API data: verified — filtering.test.tsx selectOptions for 'Fitness' succeeded, proving options come from fetched product data
- Req 15 — Filter changes reset page to 1: verified — code inspection confirmed handleFilterChange useCallback at App.tsx:14-19 calls both setFilters(next) and setPage(1); neither FilterPanel nor SortSelect receives raw setFilters
- Req 16 — App builds without TypeScript errors: verified — pnpm build exited 0; 'tsc -b && vite build' completed in 289ms, 38 modules transformed
- Req 17 — All visible tests pass: verified — 6 test files passed, 17 tests passed, 0 failing (duration 1.21s)

## Files changed

- `src/benchmark-frontend/src/utils/productFilters.ts`: Implemented filterProducts — applies search/category/inStockOnly filters in sequence on a copy, then sorts by price-asc/price-desc/rating-desc or returns default order
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: Renamed _onChange to onChange; wired search input, category select, inStock checkbox, and Clear Filters button to call onChange with updated FilterState
- `src/benchmark-frontend/src/components/SortSelect.tsx`: Renamed _onChange to onChange; wired sort select to call onChange with the selected sortBy value
- `src/benchmark-frontend/src/App.tsx`: Added handleFilterChange useCallback that calls setFilters(next) and setPage(1) together; passed it to FilterPanel onChange and used it inside SortSelect onChange wrapper

## Checks

- pnpm test: 17 passed, 0 failed (6 test files)
- pnpm run build: pass (exit code 0, 289ms)
