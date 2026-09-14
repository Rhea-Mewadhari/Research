# Milestone

Task: task2
Target: frontend

## Requirements addressed
- Search is case-insensitive: verified — tests/filtering.test.tsx > "filters products by search term" PASSED; productFilters.ts line 14 uses `product.name.toLowerCase().includes(filters.search.trim().toLowerCase())`
- Search trims leading/trailing whitespace: verified — productFilters.ts line 14 uses `filters.search.trim().toLowerCase()`; all 17 tests passed
- Filters combine without overriding each other: verified — all three filter tests in filtering.test.tsx PASSED with exact product counts
- Category filter works correctly: verified — "filters products by category" PASSED; productFilters.ts lines 17-19 filter by `product.category === filters.category`
- In-stock filter works correctly: verified — "filters products by in-stock only" PASSED; productFilters.ts lines 21-23 filter by `product.inStock`
- Sorting is applied after all filters: verified — sort block is at lines 25-31, after filter blocks at lines 13-23; all 3 sorting tests PASSED
- Sorting does not mutate the input array: verified — productFilters.ts line 11 uses spread copy `[...products]`; all sorting tests PASSED
- Default sort preserves input order: verified — no sort branch fires when `sortBy === 'default'`; app.render.test.tsx PASSED
- "Clear filters" resets all fields: verified — clearFilters.test.tsx > "resets filters back to default values" PASSED (search empty, category "All", in-stock unchecked, sort "default", 15 products shown)

## Files changed
- `src/benchmark-frontend/src/utils/productFilters.ts`: Fixed case-sensitive search (added `.toLowerCase()` and `.trim()`); moved sort block to after all filter steps
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: "Clear filters" button onClick includes `sortBy: 'default'` reset

## Checks
- pnpm test: 17 passed, 0 failed (6 test files: app.render, clearFilters, filtering, loadingError, pagination, sorting)
- pnpm run build: pass
