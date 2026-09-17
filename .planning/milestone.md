# Milestone

Task: task6
Target: frontend

## Requirements addressed

- Req 1 — filterProducts name search (case-insensitive, trimmed): verified — tests/filtering.test.tsx passed all 3 tests (136ms); 'filters products by search term' confirmed 1 result for 'mouse'.
- Req 2 — filterProducts category filter (exact match, 'All' = no filter): verified — tests/filtering.test.tsx passed; 'filters products by category' confirmed 5 results for 'Fitness'.
- Req 3 — filterProducts inStockOnly toggle: verified — tests/filtering.test.tsx passed; 'filters products by in-stock only' confirmed count reads "Showing 11 products".
- Req 4 — filterProducts sort (price-asc/price-desc/rating-desc/default) without mutation: verified — tests/sorting.test.tsx passed all 3 tests (151ms).
- Req 5 — FilterPanel search input onChange wired, _onChange removed: verified — filtering.test.tsx 'filters products by search term' passes.
- Req 6 — FilterPanel category select onChange wired: verified — filtering.test.tsx 'filters products by category' passes.
- Req 7 — FilterPanel in-stock checkbox onChange wired: verified — filtering.test.tsx 'filters products by in-stock only' passes.
- Req 8 — FilterPanel Clear filters button resets to default FilterState: verified — tests/clearFilters.test.tsx passed 1 test (127ms).
- Req 9 — SortSelect sort select onChange wired, _onChange removed: verified — sorting.test.tsx all 3 tests pass.
- Req 10 — App.tsx wrappers call setFilters + setPage(1) for both FilterPanel and SortSelect: verified — tests/pagination.test.tsx passed all 5 tests (123ms).
- Req 11 — category dropdown populated from dynamic categories prop: verified — filtering.test.tsx + app.render.test.tsx both pass.
- Req 12 — TypeScript compilation with no errors: verified — pnpm build (tsc -b && vite build) exited code 0, 38 modules transformed.
- Req 13 — All test suites pass: verified — pnpm test --run exited code 0; 6 test files, 17 tests, all passed.

## Files changed

- src/benchmark-frontend/src/utils/productFilters.ts: Implemented filterProducts — name search, category filter, inStockOnly toggle, and price/rating sort without mutating input.
- src/benchmark-frontend/src/components/FilterPanel.tsx: Renamed _onChange to onChange; wired search input, category select, in-stock checkbox, and Clear button onChange handlers.
- src/benchmark-frontend/src/components/SortSelect.tsx: Renamed _onChange to onChange; wired sort select onChange to call onChange with typed sortBy value.
- src/benchmark-frontend/src/App.tsx: Replaced direct setFilters pass-throughs with wrappers that call both setFilters and setPage(1) for FilterPanel and SortSelect.

## Checks

- pnpm test: 17 passed, 0 failed (6 test files: app.render, pagination, clearFilters, filtering, sorting, loadingError)
- pnpm run build: pass (tsc -b && vite build, 38 modules, exit 0)
