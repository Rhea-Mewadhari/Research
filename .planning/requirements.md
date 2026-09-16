# Requirements

1. `App.tsx` delegates all filter and sort computation to `filterProducts(products, filters)` — the `visibleProducts` `useMemo` block contains no inline `Array.prototype.filter()` or `.sort()` calls.
   - Verified by: `grep -n "\.filter(\|\.sort(" src/benchmark-frontend/src/App.tsx` returns no matches inside the `visibleProducts` memo; and `pnpm --filter benchmark-frontend test` exits with code 0.

2. `productFilters.ts` does not export `normalizeSearch` — the function body and its comment are deleted from the file.
   - Verified by: `grep "normalizeSearch" src/benchmark-frontend/src/utils/productFilters.ts` returns no output.

3. `normalizeSearch` is not referenced anywhere in source files under `src/benchmark-frontend/src/`.
   - Verified by: `grep -rn "normalizeSearch" src/benchmark-frontend/src/ --include="*.ts" --include="*.tsx"` returns no output.

4. `FilterPanel.tsx` `handleClear` does not contain a hardcoded `FilterState` object literal; instead it calls a passed `onClear` prop (a `() => void` callback supplied by `App.tsx`) that resets state to the canonical initial values defined in `useProductFilters.ts`.
   - Verified by: `grep -n "search.*''" src/benchmark-frontend/src/components/FilterPanel.tsx` returns no match; the clear-filters test (`tests/clearFilters.test.tsx`) passes, confirming all four fields (`search`, `category`, `inStockOnly`, `sortBy`) are reset correctly.

5. `App.tsx` passes `clearFilters` (returned by `useProductFilters`) to `FilterPanel` as `onClear`, replacing the raw `setFilters` call that previously duplicated the initial filter literal.
   - Verified by: reading `App.tsx` shows `clearFilters` destructured from `useProductFilters()` and forwarded to `<FilterPanel onClear={clearFilters} .../>`.

6. No unused imports or variables remain in any modified file (`App.tsx`, `productFilters.ts`, `FilterPanel.tsx`, `useProductFilters.ts`).
   - Verified by: `pnpm --filter benchmark-frontend exec tsc --noEmit` exits with code 0.

7. All existing tests pass without any modification to files under `tests/`.
   - Verified by: `pnpm --filter benchmark-frontend test` exits with code 0 and reports 0 failing tests; `git diff --name-only tests/` is empty.

8. No files outside `src/benchmark-frontend/src/` are modified (no new dependencies added, no config changes, no test file changes).
   - Verified by: `git diff --name-only` lists only paths under `src/benchmark-frontend/src/`.

---

## Edge Cases

- `filterProducts` with `sortBy === 'default'` returns the filtered array unsorted (preserving original order) — the inline logic in `App.tsx` had the same implicit behaviour; covered by requirement 1 (tests pass with identical output).
- `categories` `useMemo` in `App.tsx` derives available category labels from raw `products`; it is unrelated to filter/sort logic and must not be moved to `productFilters.ts` — covered by requirement 1 (only the `visibleProducts` memo is changed).
- `handleClear` must reset all four `FilterState` fields: `search`, `category`, `inStockOnly`, and `sortBy` — any partial reset would cause `clearFilters.test.tsx` to fail; covered by requirements 4 and 7.
- `SortSelect.tsx` is structurally clean and requires no changes; modifying it unnecessarily could introduce regressions — covered by requirement 8 (only modify files that need changing).
- No test file imports `normalizeSearch`, `filterProducts`, or any symbol from `productFilters.ts` directly — removing `normalizeSearch` does not break any test; covered by requirement 3.
