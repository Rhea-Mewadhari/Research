# Milestone

Task: task6
Target: frontend

## Requirements addressed

- Req 1 — filterProducts filters by name (case-insensitive, trimmed search): verified — productFilters.ts:11-18 trims search and applies case-insensitive includes; "filters products by search term" test passed.
- Req 2 — filterProducts filters by category ('All' skips, others exact-match): verified — productFilters.ts:20-22 applies category filter when !== 'All'; "filters products by category" test passed.
- Req 3 — filterProducts filters by inStockOnly: verified — productFilters.ts:24-26 applies inStock filter; "filters products by in-stock only" test passed.
- Req 4 — filterProducts sorts by price-asc/price-desc/rating-desc; 'default' unchanged; no input mutation: verified — productFilters.ts:13 spreads input before sorting; sorting.test.tsx 3 tests passed.
- Req 5 — FilterPanel search input onChange wired to onChange prop: verified — FilterPanel.tsx spreads existing filters with updated search; "filters products by search term" test passed.
- Req 6 — FilterPanel category select onChange wired to onChange prop: verified — FilterPanel.tsx:32 onChange sets category from e.target.value; "filters products by category" test passed.
- Req 7 — FilterPanel in-stock checkbox onChange wired to onChange prop: verified — FilterPanel.tsx onChange sets inStockOnly from e.target.checked; "filters products by in-stock only" test passed.
- Req 8 — FilterPanel Clear Filters button onClick calls onChange with default state: verified — FilterPanel.tsx:55 onClick passes { search: '', category: 'All', inStockOnly: false, sortBy: 'default' }; clearFilters.test.tsx passed.
- Req 9 — SortSelect sort select onChange wired to onChange prop: verified — SortSelect.tsx:16 onChange calls onChange with cast sortBy value; sorting.test.tsx 3 tests passed.
- Req 10 — App.tsx wraps setFilters in handleFiltersChange calling setPage(1); passes to FilterPanel and SortSelect: verified — App.tsx:24-27 defines wrapper; App.tsx:37,40 passes it to children; pagination.test.tsx 5 tests and clearFilters.test.tsx 1 test passed.
- Req 11 — Category select populated exclusively from categories prop (dynamically derived): verified — FilterPanel.tsx:34-37 renders categories.map() from prop only; App.tsx:15-18 derives categories via useMemo; "filters products by category" selects 'Fitness' and passes.
- Req 12 — TypeScript build succeeds with no type errors: verified — pnpm run build exited 0; tsc -b produced no errors; vite built 38 modules in 282ms.
- Req 13 — All 6 test suites pass (17 tests total): verified — app.render.test.tsx (1), loadingError.test.tsx (4), pagination.test.tsx (5), clearFilters.test.tsx (1), filtering.test.tsx (3), sorting.test.tsx (3); 17 passed (17), exit code 0.

## Files changed

- `src/benchmark-frontend/src/utils/productFilters.ts`: Implemented filterProducts body — search/category/inStock filtering and price-asc/price-desc/rating-desc sorting without mutating input.
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: Replaced _onChange no-op with wired onChange handlers for search input, category select, in-stock checkbox, and Clear Filters button; category options rendered from categories prop.
- `src/benchmark-frontend/src/components/SortSelect.tsx`: Replaced _onChange no-op with wired onChange handler passing selected sortBy value.
- `src/benchmark-frontend/src/App.tsx`: Added handleFiltersChange wrapper calling setFilters and setPage(1); passed wrapper as onChange to FilterPanel and SortSelect.

## Checks

- pnpm test: 17 passed, 0 failed
- pnpm run build: pass
