# Requirements

1. `App.tsx` `visibleProducts` useMemo must call `filterProducts(products, filters)` and must contain no inline filter or sort logic.
   - Verified by: `grep -n "filterProducts(products, filters)" src/benchmark-frontend/src/App.tsx` returns at least one match; `grep -c "\.filter(" src/benchmark-frontend/src/App.tsx` returns 0 (no inline `.filter(` calls remain in the file at all — the only filtering happens via `filterProducts`); `grep -c "\.sort(" src/benchmark-frontend/src/App.tsx` returns 0 (no inline sort).

2. The `filterProducts` import in `App.tsx` is used (no unused import).
   - Verified by: `grep -n "^import.*filterProducts" src/benchmark-frontend/src/App.tsx` returns a match AND requirement 1 confirms the function is called — the import is therefore consumed.

3. `normalizeSearch` is deleted from `productFilters.ts` and is not referenced anywhere else in the codebase.
   - Verified by: `grep -rn "normalizeSearch" src/benchmark-frontend/src/` returns no output (exit code 1 / empty).

4. `filterProducts` in `productFilters.ts` does not contain multiple early-return statements for individual sort branches; the sort-and-return pattern is consolidated into a single return.
   - Verified by: `grep -c "return sorted" src/benchmark-frontend/src/utils/productFilters.ts` returns `1` (exactly one `return sorted` line), confirming the three separate `return sorted;` branches have been collapsed.

5. TypeScript compilation of the frontend target succeeds with no errors.
   - Verified by: `pnpm --filter benchmark-frontend exec tsc --noEmit` exits with code 0 and produces no diagnostic output — confirms no unused imports (TS6133), no type errors, and no broken references introduced by the refactor.

6. All existing test suites pass without modification to any test file.
   - Verified by: `pnpm --filter benchmark-frontend run test` exits with code 0; all six suites (`app.render.test.tsx`, `clearFilters.test.tsx`, `filtering.test.tsx`, `loadingError.test.tsx`, `pagination.test.tsx`, `sorting.test.tsx`) report zero failures and zero errors.

## Edge cases

- Search trimming behaviour: `filterProducts` already trims and lowercases the search term; the inline `App.tsx` logic did the same. After the refactor, requirement 6 (test suite pass) confirms the identical outcome for trimmed/untrimmed input.
- `sortBy: 'default'` (no sort): the consolidated `filterProducts` return must still return the unsorted filtered list when `sortBy` is `'default'`; covered by requirement 6 (sorting tests include the default case).
- Empty product list: `filterProducts([])` must return `[]`; covered by requirement 6.
- `normalizeSearch` was exported — removing the export must not break any import in another file; covered by requirement 3 (no references remain) and requirement 5 (TS compilation passes).
- `FilterPanel.tsx` `handleClear` hardcodes the reset state inline; this is UI-level state reset, not a duplication of `filterProducts` logic, and is out of scope — no change required. Covered implicitly by requirement 6 (`clearFilters.test.tsx` must still pass).
