# Milestone

Task: task2
Target: frontend

## Requirements addressed

- Req 1 — Search filter is case-insensitive: verified — tests/filtering.test.tsx > "filters products by search term" PASSED; productFilters.ts:15 uses `.toLowerCase()` on both sides.
- Req 2 — Search filter trims whitespace: verified — guard `if (filters.search.trim())` and match expression `filters.search.trim().toLowerCase()` confirmed; build passed.
- Req 3 — Search matches product.name only: verified — filter expression references only `product.name.toLowerCase()`; "filters products by search term" PASSED asserting 1 result.
- Req 4 — AND semantics across all filters: verified — each filter step sequentially re-assigns `result`; all 3 filtering tests PASSED.
- Req 5 — Category 'All' disables category filter: verified — `if (filters.category !== "All")` guard; initial-render assertions confirm all products shown.
- Req 6 — Specific category strictly matches product.category: verified — strict equality `product.category === filters.category`; "filters products by category" PASSED.
- Req 7 — inStockOnly excludes out-of-stock products: verified — "filters products by in-stock only" PASSED; count reads "Showing 11 products".
- Req 8 — Sorting applied after all filter steps: verified — sort block at lines 27-33, after search (13-17), category (19-21), inStockOnly (23-25) blocks; all code-position checks confirmed.
- Req 9 — Sort does not mutate source array: verified — `let result = [...products]` at line 11; all `.sort()` calls act on `result`; all 3 sorting tests PASSED.
- Req 10 — price-asc sorts lowest to highest: verified — "sorts by price ascending" PASSED with exact 15-product sequence.
- Req 11 — price-desc sorts highest to lowest: verified — "sorts by price descending" PASSED; first=Noise-Cancelling Headphones, last=Jump Rope.
- Req 12 — rating-desc sorts highest to lowest: verified — "sorts by rating descending" PASSED; first=Yoga Mat, second=Mechanical Keyboard.
- Req 13 — sortBy 'default' preserves original order: verified — no branch for 'default' in sort block; initial-render test PASSED.
- Req 14 — Clear filters resets all four fields including sortBy: verified — "resets filters back to default values" PASSED; FilterPanel.tsx clear handler calls `onChange({ search: '', category: 'All', inStockOnly: false, sortBy: 'default' })`.

## Files changed

- `src/benchmark-frontend/src/utils/productFilters.ts`: fixed search filter (case-insensitive + trim) and moved sort block to after all filter steps
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: added `sortBy: 'default'` to the Clear filters button handler

## Checks

- pnpm test: 17 passed, 0 failed
- pnpm run build: pass (tsc -b && vite build completed in 290ms with no errors)
