# Milestone

Task: task1
Target: frontend

## Requirements addressed

- Req 1 — filterProducts filters by search term (case-insensitive, trimmed, partial match): verified — tests/filtering.test.tsx 'filters products by search term' PASSED; productFilters.ts:13-16 trims and lowercases before matching.
- Req 2 — filterProducts filters by category ('All' passes through; others exact-match): verified — tests/filtering.test.tsx 'filters products by category' PASSED; productFilters.ts:18-20.
- Req 3 — filterProducts filters by in-stock status (inStockOnly: true retains inStock===true only): verified — tests/filtering.test.tsx 'filters products by in-stock only' PASSED; productFilters.ts:22-24.
- Req 4 — filterProducts sorts price-asc, price-desc, rating-desc, default (preserves order): verified — tests/sorting.test.tsx all 3 sort tests PASSED; productFilters.ts:26-32.
- Req 5 — filterProducts does not mutate input array: verified — spread copy used on line 11 and before sort; all sort tests PASSED; build exits 0.
- Req 6 — FilterPanel search input calls onChange with updated FilterState on every keystroke: verified — tests/filtering.test.tsx 'filters products by search term' PASSED; tests/clearFilters.test.tsx PASSED.
- Req 7 — FilterPanel category select calls onChange with updated FilterState: verified — tests/filtering.test.tsx 'filters products by category' PASSED; tests/clearFilters.test.tsx PASSED.
- Req 8 — FilterPanel in-stock checkbox calls onChange with updated FilterState: verified — tests/filtering.test.tsx 'filters products by in-stock only' PASSED; tests/clearFilters.test.tsx PASSED.
- Req 9 — FilterPanel 'Clear filters' button resets state to defaults: verified — tests/clearFilters.test.tsx 'resets filters back to default values' PASSED; search='', category='All', inStockOnly=false, sortBy='default', results-count 'Showing 15 products'.
- Req 10 — SortSelect select calls onChange with selected sortBy value typed as FilterState['sortBy']: verified — tests/sorting.test.tsx all 3 sort tests PASSED using getByLabelText(/sort by/i).
- Req 11 — ProductList renders 'No products found.' (p[role=status]) when empty: verified — ProductList.tsx:9-11 already contained this branch; all 17 tests PASSED.
- Req 12 — App builds without TypeScript errors: verified — pnpm run build (tsc -b && vite build) exited with code 0; 38 modules transformed, no TS errors.

## Files changed

- src/benchmark-frontend/src/utils/productFilters.ts: implemented filterProducts — search (trim + case-insensitive), category (exact/'All'), inStockOnly, and sorting (price-asc/price-desc/rating-desc/default) with no input mutation
- src/benchmark-frontend/src/components/FilterPanel.tsx: wired onChange handlers for search input, category select, inStockOnly checkbox, and Clear filters button (renamed _onChange → onChange)
- src/benchmark-frontend/src/components/SortSelect.tsx: wired onChange handler for sort select (renamed _onChange → onChange, cast value to FilterState['sortBy'])

## Checks

- pnpm test: 17 passed, 0 failed (6 test files)
- pnpm run build: pass
