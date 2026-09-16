# Requirements

1. `App.tsx` must delegate product filtering and sorting to `filterProducts` — the `visibleProducts` useMemo body must call `filterProducts(products, filters)` and must contain no inline `.filter()` or `.sort()` chains that re-implement that logic.
   - Verified by: `grep -E "\.filter\(|\.sort\(" src/benchmark-frontend/src/App.tsx` returns no matches inside the `visibleProducts` computation, AND `grep "filterProducts(products, filters)" src/benchmark-frontend/src/App.tsx` returns exactly one match.

2. `normalizeSearch` must be removed from `productFilters.ts` — neither the function declaration, the `export` keyword for it, nor the stale comment block may remain.
   - Verified by: `grep "normalizeSearch" src/benchmark-frontend/src/utils/productFilters.ts` returns no output.

3. `normalizeSearch` must not be referenced anywhere in the source tree (no orphan imports or calls left behind).
   - Verified by: `grep -r "normalizeSearch" src/benchmark-frontend/src/` returns no output.

4. All existing visible tests must pass without modification.
   - Verified by: `pnpm --filter benchmark-frontend test --run` exits with code 0 and every test suite reports all tests passed.

5. No test file may be modified.
   - Verified by: `git diff --name-only` shows no path matching `src/benchmark-frontend/tests/`.

6. No new package dependencies may be introduced.
   - Verified by: `git diff src/benchmark-frontend/package.json` shows no changes, AND `git diff pnpm-lock.yaml` shows no additions under the `benchmark-frontend` workspace.

7. TypeScript compilation must succeed with no errors after the refactor.
   - Verified by: `pnpm --filter benchmark-frontend exec tsc --noEmit` exits with code 0.

## Edge cases

- The `useMemo` wrapper around the `filterProducts` call must be kept: it is a React performance primitive, not business logic, and its removal could cause test failures in render tests — covered by requirement 4.
- The `filterProducts` import in `App.tsx` must remain after the refactor (it is now the active call site, not dead code) — covered by requirement 7 (removing it while still calling it would be a compile error).
- `FilterPanel.tsx` and `SortSelect.tsx` contain no duplicated business logic and require no changes — covered by requirement 4 (their tests would regress if they were incorrectly modified).
- Whitespace-only variants of the search string (e.g. `"  "`) must still be treated as an empty search by `filterProducts`, consistent with the existing `filters.search.trim() !== ''` guard — covered by requirement 4 (filtering tests exercise this path).
