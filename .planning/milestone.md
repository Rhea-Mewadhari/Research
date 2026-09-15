# Milestone

Task: task2
Target: frontend

## Requirements addressed

- Req 1 — Sort after filter: verified — test 'sorts by price ascending' PASSED (✓ 82ms); `productFilters.ts` applies search/category/inStock filters first (lines 13–23), sort runs after (lines 25–31).
- Req 2 — Case-insensitive search: verified — test 'filters products by search term' PASSED (✓ 83ms); line 14 applies `.toLowerCase()` to both sides of the `.includes()` comparison.
- Req 3 — Trim whitespace from search input: verified — test 'filters products by search term' PASSED (✓ 83ms); line 14 calls `filters.search.trim().toLowerCase()` before comparison.
- Req 4 — Search matches only `product.name`: verified — test 'filters products by search term' shows exactly 1 result for 'mouse'; only `product.name` is referenced in the filter expression.
- Req 5 — Category filter (All passthrough + strict match): verified — test 'filters products by category' PASSED (✓ 29ms); strict equality `product.category === filters.category` guarded by `!== 'All'`.
- Req 6 — In-stock filter excludes `inStock === false`: verified — test 'filters products by in-stock only' PASSED (✓ 26ms); `productFilters.ts` lines 21–23 filter on `product.inStock`.
- Req 7 — Filters combine additively: verified — all three filter tests PASSED independently; each filter narrows the same `result` array sequentially.
- Req 8 — Sort does not mutate original dataset: verified — all three sorting tests PASSED (✓ 82ms / 34ms / 30ms); `[...products]` spread on line 11 copies before any `.sort()` call.
- Req 9 — Clear filters resets all fields including `sortBy`: verified — test 'resets filters back to default values' PASSED (✓ 127ms); search='', category='All', inStockOnly=unchecked, sortBy='default', results='Showing 15 products'.
- Req 10 — No regressions: verified — `pnpm test` output: 6 test files passed, 17 tests passed, 0 failures; `vite build` succeeded in 277ms with 0 errors.

## Files changed

- `src/benchmark-frontend/src/utils/productFilters.ts`: Fixed BUG 1 (moved sort block to after all filter steps) and BUG 2 (changed search comparison to `product.name.toLowerCase().includes(filters.search.trim().toLowerCase())`).
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: Fixed BUG 3 (added `sortBy: 'default'` to the inline "Clear filters" onClick handler so all four filter fields are reset).

## Checks

- pnpm test: 17 passed, 0 failed (6 test files: app.render, loadingError, pagination, filtering, sorting, clearFilters)
- pnpm run build: pass (vite build succeeded in 277ms, 0 errors)
