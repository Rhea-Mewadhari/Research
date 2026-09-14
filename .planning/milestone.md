# Milestone

Task: task1
Target: frontend

## Requirements addressed

- Req 1 — filterProducts name filter (case-insensitive, trimmed, partial match): verified — tests/filtering.test.tsx 'filters products by search term' PASSED (3/3 tests, 141ms)
- Req 2 — filterProducts category filter (exact match, 'All' sentinel): verified — tests/filtering.test.tsx 'filters products by category' PASSED (3/3 tests, 141ms)
- Req 3 — filterProducts inStockOnly filter: verified — tests/filtering.test.tsx 'filters products by in-stock only' PASSED (3/3 tests, 141ms)
- Req 4 — filterProducts price-asc sort (exact order): verified — tests/sorting.test.tsx 'sorts by price ascending' PASSED (3/3 tests, 148ms)
- Req 5 — filterProducts price-desc sort: verified — tests/sorting.test.tsx 'sorts by price descending' PASSED (3/3 tests, 148ms)
- Req 6 — filterProducts rating-desc sort: verified — tests/sorting.test.tsx 'sorts by rating descending' PASSED (3/3 tests, 148ms)
- Req 7 — filterProducts preserves original order for 'default': verified — tests/app.render.test.tsx initial render PASSED (1/1 tests, 63ms)
- Req 8 — filterProducts does not mutate input (spread before sort): verified — spread pattern confirmed in productFilters.ts; all sorting tests passed with no test-to-test bleed
- Req 9 — Filters combine with AND logic, sort applies after filtering: verified — tests/clearFilters.test.tsx PASSED (1/1 tests, 129ms)
- Req 10 — FilterPanel search input wired (onChange updates search): verified — tests/filtering.test.tsx 'filters products by search term' PASSED
- Req 11 — FilterPanel category select wired (onChange updates category): verified — tests/filtering.test.tsx 'filters products by category' PASSED
- Req 12 — FilterPanel inStockOnly checkbox wired (onChange updates inStockOnly): verified — tests/filtering.test.tsx 'filters products by in-stock only' PASSED
- Req 13 — FilterPanel 'Clear filters' button resets all state: verified — tests/clearFilters.test.tsx PASSED; results-count reset to 'Showing 15 products'
- Req 14 — SortSelect dropdown wired (onChange propagates sortBy): verified — tests/sorting.test.tsx PASSED; h3 order changed after selectOptions
- Req 15 — Empty state 'No products found.' displays when no matches: verified — ProductList.tsx renders <p role="status">No products found.</p> when products.length === 0; build succeeded
- Req 16 — TypeScript build succeeds with no type errors: verified — pnpm run build exited 0; 'built in 266ms'; dist/assets/index-1YSGrxg0.js emitted

## Files changed

- src/benchmark-frontend/src/utils/productFilters.ts: implemented filterProducts() with name/category/inStock filters and price-asc/price-desc/rating-desc/default sort; uses spread to avoid mutation
- src/benchmark-frontend/src/components/FilterPanel.tsx: wired onChange handlers for search input, category select, inStockOnly checkbox, and Clear filters button
- src/benchmark-frontend/src/components/SortSelect.tsx: wired onChange handler to propagate selected sortBy value via the onChange prop

## Checks

- pnpm test: 8 passed, 0 failed (filtering: 3, sorting: 3, app.render: 1, clearFilters: 1)
- pnpm run build: pass (exit 0, built in 266ms, no TypeScript errors)
