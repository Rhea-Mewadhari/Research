# Milestone

Task: task4
Target: frontend

## Requirements addressed

- App.tsx delegates filtering and sorting to `filterProducts()`: verified — `grep -c 'filterProducts(products' src/App.tsx` → 1; no `.filter(` or `.sort(` chains remain in App.tsx. Line 19 now reads `const visibleProducts = useMemo(() => filterProducts(products, filters), [products, filters]);`.
- `normalizeSearch` removed from productFilters.ts: verified — `grep -r 'normalizeSearch' src/` produced no output (exit 1). Function declaration and associated comment are gone from productFilters.ts (file is now 42 lines).
- Unreachable branch in `FilterPanel.tsx` `handleCategoryChange` removed: verified — `grep "=== 'all'" src/components/FilterPanel.tsx` produced no output (exit 1). Handler now passes `e.target.value` directly with no ternary.
- All existing tests pass without modification: verified — 6 test files, 17 tests passed, 0 failing (vitest run exit 0); `git diff -- src/benchmark-frontend/tests/` shows no changes.
- No new npm dependencies or import paths introduced: verified — package.json and pnpm-lock.yaml unchanged; `filterProducts` was already imported in App.tsx line 7 before the change.

## Files changed

- `src/benchmark-frontend/src/App.tsx`: Replaced inline `visibleProducts` useMemo body (filter + sort chains, lines 19–44) with a single `filterProducts(products, filters)` call.
- `src/benchmark-frontend/src/utils/productFilters.ts`: Removed dead-code `normalizeSearch` export (function declaration and its comment).
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: Simplified `handleCategoryChange` — removed unreachable `=== 'all'` ternary, now passes `e.target.value` directly as `category`.

## Checks

- pnpm test: 17 passed, 0 failed
- pnpm run build: pass
