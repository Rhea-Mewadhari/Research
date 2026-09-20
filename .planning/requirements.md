# Requirements

1. `FilterContext` passes a delay of `search === '' ? 0 : 300` to `useDebounce`, replacing the current hard-coded `0`.
   - Verified by: `src/benchmark-frontend/src/context/FilterContext.tsx` line ~51 contains `useDebounce(search, search === '' ? 0 : 300)` (or equivalent conditional expression producing 300 for non-empty and 0 for empty). Grep: `grep -n "useDebounce" src/benchmark-frontend/src/context/FilterContext.tsx` must show a delay of `300` (not `0`) for the non-empty path.

2. Typing in the search field does not change `debouncedSearch` (and therefore does not re-filter products) until 300 ms have elapsed since the last keystroke.
   - Verified by: `tests/debounceSearch.test.tsx` — test "typing a search term eventually filters the product list" passes. It asserts `results-count` shows `Showing 1 products` for search term "wireless" only after the debounce window elapses.

3. Rapid consecutive keystrokes reset the 300 ms window so only the final value is applied (no intermediate filter updates).
   - Verified by: `tests/debounceSearch.test.tsx` — all typing tests use `userEvent.type` which fires one character at a time; passing them without intermediate wrong counts confirms the timer resets correctly on each keystroke.

4. When `search` is set to `''` (field cleared), `debouncedSearch` becomes `''` immediately — without waiting 300 ms.
   - Verified by: `tests/debounceSearch.test.tsx` — test "clearing the search field restores all products" passes. It clears the field then immediately asserts `results-count` shows `Showing 15 products` (no `waitFor` with a timer assertion, the update is synchronous within the React flush cycle).

5. Clearing the search field while a category filter is active keeps the category filter applied and does not reset it.
   - Verified by: `tests/debounceSearch.test.tsx` — test "clearing search while a category is active keeps the category filter" passes. After clearing search within Fitness category, count is `Showing 5 products`.

6. Search filtering is case-insensitive (uppercase input matches lowercase product names and vice versa).
   - Verified by: `tests/debounceSearch.test.tsx` — test "search is case-insensitive" passes. Typing "KEYBOARD" results in `Showing 1 products` with "mechanical keyboard" visible.

7. Search filter combines correctly with the category filter (intersection of both constraints).
   - Verified by: `tests/debounceSearch.test.tsx` — test "search combines correctly with category filter" passes. Selecting "Electronics" then typing "hub" results in `Showing 1 products`.

8. All other filters (category select, in-stock toggle, sort) continue to work correctly after the change.
   - Verified by: `tests/filtering.test.tsx`, `tests/sorting.test.tsx`, and `tests/clearFilters.test.tsx` all pass without modification.

9. The "Clear filters" button resets all filter state (search, category, in-stock, sort) and immediately shows all 15 products.
   - Verified by: `tests/clearFilters.test.tsx` — test "resets filters back to default values" passes. After clearing, `results-count` shows `Showing 15 products` and all inputs return to default values.

10. No state-update-on-unmounted-component warning is emitted when the component unmounts while a debounce timeout is pending. (`useDebounce` already cancels via `clearTimeout` in its `useEffect` cleanup — the fix must not break this.)
    - Verified by: `tests/app.render.test.tsx` and all test suite runs complete with zero console errors about state updates on unmounted components (vitest output contains no `Warning: Can't perform a React state update on an unmounted component`).

11. `useDebounce.ts` remains generic — it accepts `T` for any value type and `delayMs: number`. The fix must not constrain it to strings or add string-specific logic inside the hook.
    - Verified by: `src/benchmark-frontend/src/hooks/useDebounce.ts` is unchanged (or if modified, its signature remains `useDebounce<T>(value: T, delayMs: number): T` with no string-specific branching). `grep -n "string" src/benchmark-frontend/src/hooks/useDebounce.ts` must return no matches.

12. The public interface of `FilterContext` is unchanged: exported functions (`setSearch`, `setCategory`, `setInStockOnly`, `setSortBy`, `saveCurrentFilters`, `restoreFilter`, `deleteFilter`, `clearFilters`) and the context value shape (`search`, `debouncedSearch`, `category`, `inStockOnly`, `sortBy`, `savedFilters`) remain identical.
    - Verified by: TypeScript build (`pnpm --filter benchmark-frontend build` or `tsc --noEmit`) succeeds with zero type errors. No changes to the `FilterContextValue` interface in `FilterContext.tsx`.

13. `useFilteredProducts.ts` is not modified.
    - Verified by: `git diff src/benchmark-frontend/src/hooks/useFilteredProducts.ts` is empty.

14. No new npm/pnpm dependencies are added.
    - Verified by: `git diff src/benchmark-frontend/package.json` shows no changes to `dependencies` or `devDependencies`.

15. The full test suite passes and the build succeeds.
    - Verified by: `pnpm --filter benchmark-frontend test --run` exits with code 0 and all test files report 0 failures.

## Edge cases

- Empty string on initial render (search starts as `''`): covered by requirement 1 — delay is 0 for empty string, so initial `debouncedSearch` is `''` synchronously (no 300 ms delay before first render).
- Search cleared mid-debounce (pending 300 ms timer): covered by requirement 4 — setting delay to 0 causes `useEffect` to re-run, which calls `clearTimeout` on the pending timer (cleanup) before scheduling a new 0 ms timeout.
- Rapid typing followed by clear: covered by requirements 3 and 4 — the clear collapses any pending non-empty debounce immediately.
- Category + search combined, then search cleared: covered by requirement 5.
- All-uppercase search query: covered by requirement 6.
- TypeScript type safety of the conditional delay expression: covered by requirement 12 (build must pass with no type errors).
