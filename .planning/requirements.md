# Requirements

1. `App.tsx` delegates filtering and sorting to `filterProducts()` instead of reimplementing them inline.
   - The `visibleProducts` `useMemo` body must call `filterProducts(products, filters)` (already imported at line 7) and return its result directly, with no inline `.filter(...)` or `.sort(...)` chains remaining in `App.tsx`.
   - Verified by: `grep -c "filterProducts(products" src/benchmark-frontend/src/App.tsx` outputs `1`; `grep -c "\.filter(" src/benchmark-frontend/src/App.tsx` outputs `0`; `grep -c "\.sort(" src/benchmark-frontend/src/App.tsx` outputs `0`.

2. `normalizeSearch` is entirely removed from `productFilters.ts`.
   - The function declaration (lines 11–13) and its associated comment (line 10) must not appear anywhere in the codebase; the function was dead code — never imported or called outside its own file.
   - Verified by: `grep -r "normalizeSearch" src/benchmark-frontend/src/` produces no output (exit 1 / empty).

3. The unreachable branch in `FilterPanel.tsx` `handleCategoryChange` is removed.
   - The condition `e.target.value === 'all'` (which can never fire because all rendered `<option>` values are title-cased `'All'`) must be eliminated. `handleCategoryChange` must pass `e.target.value` directly as `category` with no ternary.
   - Verified by: `grep "=== 'all'" src/benchmark-frontend/src/components/FilterPanel.tsx` produces no output; full test suite still passes.

4. All existing tests continue to pass without any modification to test files.
   - Every test in `src/benchmark-frontend/tests/` must pass after the refactoring; no file under that directory may be changed.
   - Verified by: `pnpm --filter benchmark-frontend test --run` exits with code 0 and zero failing tests; `git diff -- src/benchmark-frontend/tests/` shows no changes.

5. No new npm dependencies or new import paths are introduced.
   - `package.json` and `pnpm-lock.yaml` must be unchanged; the only imports added to modified files must already be present in those files before the change (i.e., `filterProducts` is already imported in `App.tsx`).
   - Verified by: `git diff src/benchmark-frontend/package.json pnpm-lock.yaml` shows no changes; no `import` line added to a modified file references a module not previously imported in that file.

---

## Edge cases

- `filterProducts` import already exists in `App.tsx` (line 7) — no new import is needed, only the usage changes: covered by requirement 1.
- Removing `normalizeSearch` cannot affect any other file because it is only defined in `productFilters.ts` and is not imported anywhere else: covered by requirement 2.
- The dead-branch removal in `FilterPanel.tsx` preserves the `category: 'All'` path because the `<select>` only ever emits `'All'` (not `'all'`) from its rendered options, so `e.target.value` already equals `'All'` when the user selects "All": covered by requirement 3.
- `SortSelect.tsx` and `useProductFilters.ts` are already clean and require no changes — any modification to them is out of scope: implicitly covered by requirement 4 (tests that exercise those components must still pass).
