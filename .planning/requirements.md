# Requirements

1. The `visibleProducts` computation in `App.tsx` must delegate entirely to `filterProducts(products, filters)` — no inline `.filter()` or `.sort()` calls may remain inside that computation.
   - Verified by: `grep -n 'visibleProducts' src/benchmark-frontend/src/App.tsx` shows an assignment that calls `filterProducts`; a subsequent `grep -n '\.filter\|\.sort' src/benchmark-frontend/src/App.tsx` finds no matches inside the `visibleProducts` block (the `categories` useMemo may still use `.map`, not `.filter`/`.sort`).

2. The `filterProducts` import in `App.tsx` must be present and actually used (not a dead import).
   - Verified by: TypeScript compilation `pnpm --filter benchmark-frontend exec tsc --noEmit` exits 0 with no "declared but never read" or unused-import errors; additionally `grep 'filterProducts' src/benchmark-frontend/src/App.tsx` returns at least two matches (the import line and a call site).

3. The `normalizeSearch` function must be removed from `src/utils/productFilters.ts` (no declaration, no export).
   - Verified by: `grep -n 'normalizeSearch' src/benchmark-frontend/src/utils/productFilters.ts` returns no output (exit code 1).

4. No unused imports may remain in any of the four affected files: `App.tsx`, `productFilters.ts`, `FilterPanel.tsx`, `SortSelect.tsx`.
   - Verified by: `pnpm --filter benchmark-frontend exec tsc --noEmit` exits 0 with no diagnostics; and manual grep confirms every symbol imported in each file appears in its body.

5. All existing test suites must pass without any modification to test files.
   - Verified by: `pnpm --filter benchmark-frontend test` exits 0 and the output shows all six test files (`app.render.test.tsx`, `clearFilters.test.tsx`, `filtering.test.tsx`, `loadingError.test.tsx`, `pagination.test.tsx`, `sorting.test.tsx`) reporting no failures.

6. No new runtime or dev dependencies may be introduced.
   - Verified by: `git diff -- src/benchmark-frontend/package.json` shows no added lines under `dependencies` or `devDependencies`.

7. `FilterPanel.tsx` and `SortSelect.tsx` must contain no inline filter or sort logic (they must only manage UI state and delegate via props).
   - Verified by: `grep -n '\.filter\|\.sort\|sortBy.*=>' src/benchmark-frontend/src/components/FilterPanel.tsx src/benchmark-frontend/src/components/SortSelect.tsx` returns no matches that implement product filtering or sorting (event handler callbacks that set state via props are acceptable).

## Edge cases

- The `categories` useMemo in `App.tsx` uses `.map` and `Set` to derive category names — this is not filtering/sorting logic and must remain: covered by requirement 1 (only the `visibleProducts` computation is targeted) and requirement 5 (tests verify category list behavior).
- The `useMemo` import in `App.tsx` must be kept because `categories` still depends on it; removing it would break the build: covered by requirement 4.
- `filterProducts` already exists and is correct; it must not be modified in a way that changes its output: covered by requirement 5 (all filtering/sorting tests must pass against the same utility).
- `FilterPanel.tsx`'s `handleClear` resets to `{ search: '', category: 'All', inStockOnly: false, sortBy: 'default' }` — this is state-reset logic, not filtering logic, and must remain: covered by requirement 7 (the grep pattern targets `.filter`/`.sort`, not state-reset).
- The `SortSelect.tsx`'s `onChange` callback receives a `sortBy` value and passes it up — this is prop delegation, not inline sort logic: covered by requirement 7.
