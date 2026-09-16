# Milestone

Task: task4
Target: frontend

## Requirements addressed

- Req 1 — App.tsx delegates all filter/sort to filterProducts(): verified — grep for `.filter(|.sort(` in App.tsx returned no matches; visibleProducts useMemo contains only `return filterProducts(products, filters)`.
- Req 2 — productFilters.ts does not export normalizeSearch: verified — grep returned no output; file contains only FilterState type and filterProducts function.
- Req 3 — normalizeSearch not referenced anywhere in src/benchmark-frontend/src/: verified — grep across all .ts/.tsx files returned no output.
- Req 4 — FilterPanel handleClear calls onClear prop instead of hardcoded literal: verified — grep for `search.*''` returned no match; handleClear body is `onClear()`; clearFilters.test.tsx passed.
- Req 5 — App.tsx passes clearFilters to FilterPanel as onClear: verified — clearFilters destructured at line 11 and forwarded as `onClear={clearFilters}` at line 29.
- Req 6 — No unused imports or variables in any modified file: verified — `tsc --noEmit` exited 0.
- Req 7 — All 17 existing tests pass, no test files modified: verified — 6 test files, 17 tests passed, 0 failed; `git diff --name-only tests/` empty.
- Req 8 — No files outside src/benchmark-frontend/src/ modified: verified — working tree clean, no paths outside that directory changed.

## Files changed

- `src/benchmark-frontend/src/App.tsx`: replaced inline filter/sort useMemo body with `filterProducts(products, filters)`; destructured `clearFilters` from `useProductFilters()`; added `onClear={clearFilters}` to FilterPanel JSX.
- `src/benchmark-frontend/src/utils/productFilters.ts`: removed dead `normalizeSearch` export, its JSDoc comment, and the "never cleaned up" note.
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: added `onClear: () => void` to Props type; replaced hardcoded FilterState literal in `handleClear` with a single `onClear()` call.

## Checks

- pnpm test: 17 passed, 0 failed (6 test files: app.render, loadingError, pagination, clearFilters, filtering, sorting)
- pnpm run build (tsc --noEmit): pass
