# Requirements

1. The `useDebounce` call in `FilterContext.tsx` must pass a delay of `300` when `search` is non-empty, so that typing in the search field does not update `debouncedSearch` (and therefore does not re-filter products) until 300 ms after the last keystroke.
   - Verified by: `tests/debounceSearch.test.tsx` — "typing a search term eventually filters the product list" waits for `results-count` to read "Showing 1 products" after typing "wireless"; if the delay were 0 the intermediate keystrokes could settle on an unintended count.

2. When `search` is set to `''` (field cleared), `debouncedSearch` must become `''` immediately — with zero delay — so all products reappear without waiting 300 ms.
   - Verified by: `tests/debounceSearch.test.tsx` — "clearing the search field restores all products" calls `user.clear(...)` then immediately asserts `results-count` shows "Showing 15 products" with no explicit timer advance; and "clearing search while a category is active keeps the category filter" asserts the count drops to 5 instantly after clear.

3. Any pending 300 ms timeout must be cancelled when `search` changes to `''`, so a stale non-empty `debouncedSearch` value can never be applied after a clear.
   - Verified by: `tests/debounceSearch.test.tsx` — "clearing the search field restores all products" types "wireless" (queues a timeout), then immediately clears; the test asserts the full product list appears, meaning no stale "wireless" value fires afterwards.

4. If the component unmounts while a debounce timeout is pending, the timeout must be cancelled and no state update must occur after unmount (no React "update on unmounted component" warning).
   - Verified by: The `useDebounce` hook uses `clearTimeout` in its `useEffect` cleanup — the fix must not remove or bypass this cleanup. Confirmed by `pnpm --filter benchmark-frontend test` running with zero console errors/warnings related to unmounted component state updates.

5. The public interface of `FilterContext` must remain unchanged: `FilterContextValue` shape (including `debouncedSearch: string`) and all exported functions (`setSearch`, `setCategory`, `setInStockOnly`, `setSortBy`, `saveCurrentFilters`, `restoreFilter`, `deleteFilter`, `clearFilters`) must have identical signatures and behaviour.
   - Verified by: TypeScript build succeeds (`pnpm --filter benchmark-frontend build` exits 0) and `tests/app.render.test.tsx`, `tests/clearFilters.test.tsx`, `tests/filtering.test.tsx` all pass without modification.

6. `useFilteredProducts.ts` must not be modified; the fix must be limited to `FilterContext.tsx` and optionally `useDebounce.ts`.
   - Verified by: `git diff src/benchmark-frontend/src/hooks/useFilteredProducts.ts` shows no changes.

7. `useDebounce` must remain generic — it must continue to accept any value type `T` and any numeric delay — not hardcode 300 or special-case strings internally.
   - Verified by: The TypeScript signature `useDebounce<T>(value: T, delayMs: number): T` remains unchanged (confirmed by TypeScript build passing), and the hook body contains no string-specific or 300-specific logic.

8. All other filters (category, in-stock toggle, sort order) must continue to work correctly and be unaffected by the debounce fix.
   - Verified by: `tests/filtering.test.tsx`, `tests/sorting.test.tsx`, `tests/debounceSearch.test.tsx` ("search combines correctly with category filter" and "clearing search while a category is active keeps the category filter") all pass.

9. No new npm/pnpm dependencies may be introduced.
   - Verified by: `git diff src/benchmark-frontend/package.json` shows no changes to `dependencies` or `devDependencies`.

10. The full visible test suite passes and the Vite build succeeds.
    - Verified by: `pnpm --filter benchmark-frontend test` exits 0 with all tests passing, and `pnpm --filter benchmark-frontend build` exits 0 with no type errors.

## Edge cases

- Rapid successive keystrokes (e.g. typing "wireless" character by character): each keystroke resets the 300 ms window; only the final value ("wireless") is applied — covered by requirement 1 and the debounce test's `waitFor` assertion.
- Clearing while a category filter is active: `debouncedSearch` becomes `''` immediately but `category` state is preserved, so the product list shows all products matching the active category — covered by requirement 2 and test "clearing search while a category is active keeps the category filter".
- Clearing immediately after starting to type (before the 300 ms fires): the pending timeout for the non-empty value must be cancelled and `debouncedSearch` must become `''` immediately — covered by requirement 3.
- Unmounting the `FilterProvider` while a 300 ms timeout is in flight: the `useEffect` cleanup in `useDebounce` calls `clearTimeout`, preventing a state update on an unmounted component — covered by requirement 4.
- Empty-string initial render: `search` starts as `''`; `useDebounce('', 0)` would have been correct for the initial state; after the fix, `useDebounce('', 0)` still applies (delay of `search === '' ? 0 : 300` evaluates to 0) — covered by requirement 5 (interface unchanged) and the render test.
