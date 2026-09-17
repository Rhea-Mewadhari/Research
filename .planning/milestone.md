# Milestone

Task: task6
Target: frontend

## Requirements addressed

- Req 1 — filterProducts filters by name (case-insensitive, trimmed): verified — filtering.test.tsx 3 tests passed (165ms)
- Req 2 — filterProducts filters by category (exact match, "All" = no filter): verified — filtering.test.tsx 3 tests passed (165ms)
- Req 3 — filterProducts filters by in-stock status: verified — filtering.test.tsx 3 tests passed (165ms)
- Req 4 — filterProducts sorts results (price-asc, price-desc, rating-desc, default): verified — sorting.test.tsx 3 tests passed (182ms)
- Req 5 — filterProducts does not mutate the input array: verified — sorting.test.tsx 3 tests passed (182ms); multiple renders from same fixture produced no mutation-induced failures
- Req 6 — FilterPanel search input calls onChange on every keystroke; _onChange rename corrected: verified — filtering.test.tsx 3 tests passed
- Req 7 — FilterPanel category select calls onChange on selection: verified — filtering.test.tsx 3 tests passed
- Req 8 — FilterPanel in-stock checkbox calls onChange on toggle: verified — filtering.test.tsx 3 tests passed
- Req 9 — FilterPanel "Clear filters" calls onChange with full reset state: verified — clearFilters.test.tsx 1 test passed (157ms)
- Req 10 — SortSelect select calls onChange with cast sortBy value; _onChange rename corrected: verified — sorting.test.tsx 3 tests passed
- Req 11 — App.tsx FilterPanel handler wraps setFilters + setPage(1): verified — code inspection App.tsx line 33 confirms wrapper with both calls
- Req 12 — App.tsx SortSelect handler includes setPage(1): verified — code inspection App.tsx line 38 confirms setPage(1) present
- Req 13 — Project builds without TypeScript errors: verified — pnpm build exited 0; 38 modules transformed in 295ms
- Req 14 — All visible tests pass: verified — pnpm test --run exited 0; 6 test files, 17 tests, all passed

## Files changed

- `src/benchmark-frontend/src/utils/productFilters.ts`: Implemented all four filter/sort stubs — search (trim + case-insensitive), category (exact match, "All" bypass), inStockOnly, and sort (price-asc/price-desc/rating-desc/default) on a spread copy to avoid mutation
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: Renamed `_onChange` destructuring to `onChange`; wired search, category, inStockOnly, and Clear filters handlers to call `onChange` with updated FilterState
- `src/benchmark-frontend/src/components/SortSelect.tsx`: Renamed `_onChange` destructuring to `onChange`; wired select onChange to call `onChange` with cast sortBy value
- `src/benchmark-frontend/src/App.tsx`: Replaced raw `setFilters` passed to FilterPanel with wrapper calling both `setFilters(nextFilters)` and `setPage(1)`; added `setPage(1)` to the SortSelect onChange handler

## Checks

- pnpm test: 17 passed, 0 failed (6 test files: app.render, loadingError, clearFilters, pagination, filtering, sorting)
- pnpm run build: pass (tsc -b + vite build, 38 modules, 295ms)
