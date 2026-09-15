# Milestone

Task: task2
Target: frontend

## Requirements addressed

- Requirement 1 (case-insensitive, trimmed search): verified — `tests/filtering.test.tsx > Filtering behavior > filters products by search term` PASSED (93ms). All 3 filtering tests passed. `filterProducts` now computes `const searchTerm = filters.search.trim().toLowerCase()` and compares against `product.name.toLowerCase()`.
- Requirement 2 (sort applied after all filters): verified — `tests/sorting.test.tsx` — all three sort cases PASSED: `sorts by price ascending` (90ms), `sorts by price descending` (32ms), `sorts by rating descending` (31ms). Sort block moved to execute after search, category, and inStockOnly filter steps.
- Requirement 3 (default sort preserves dataset order): verified — `tests/filtering.test.tsx` — all three filter tests passed without spurious reordering. No comparator runs when `sortBy === 'default'`.
- Requirement 4 (sort does not mutate input array): verified — `tests/sorting.test.tsx` — sequential sort tests each rendered a fresh `<App />` with consistent results. `let result = [...products]` spread copy remains the first operation.
- Requirement 5 (Clear filters resets all fields including sortBy): verified — `tests/clearFilters.test.tsx > Clear filters > resets filters back to default values` PASSED (136ms). All 17 tests passed.
- Requirement 6 (filters combine additively with AND logic): verified — `tests/filtering.test.tsx > Filtering behavior > filters products by in-stock only` PASSED (25ms), asserting exactly 11 products remain out of 15.

## Files changed

- `src/benchmark-frontend/src/utils/productFilters.ts`: Fixed BUG 1 (sort block moved to after all filter steps) and BUG 2 (search normalized with `.trim().toLowerCase()` before guard and comparison).

## Checks

- pnpm test: 17 passed, 0 failed
- pnpm run build: pass
