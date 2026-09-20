# Requirements

1. `FilterContext` passes `300` (not `0`) as the `delayMs` argument to `useDebounce` when deriving `debouncedSearch` for non-empty search values, so product list re-filtering is delayed by 300 ms after the last keystroke.
   - Verified by: `tests/debounceSearch.test.tsx` — "typing a search term eventually filters the product list" and "search is case-insensitive" both use `waitFor` to assert the results-count only settles after the debounce window; both tests pass.

2. When `search` is set to `''` (field cleared), `debouncedSearch` becomes `''` immediately — with no 300 ms wait — so the full product list reappears at once.
   - Verified by: `tests/debounceSearch.test.tsx` — "clearing the search field restores all products" passes; it calls `user.clear(...)` then immediately `await screen.findByText(/yoga mat/i)` and asserts `results-count` shows 15 products with no additional `waitFor` timeout required.

3. Any pending debounce timeout for a stale non-empty value is cancelled when `search` is set to `''`, so the stale value never applies to `debouncedSearch` after a clear.
   - Verified by: `tests/debounceSearch.test.tsx` — "clearing the search field restores all products" passes cleanly; after clearing, the count is exactly 15 (not a filtered subset), confirming no stale timer fires after the clear.

4. Rapid successive keystrokes reset the 300 ms window on each keystroke — only the value present 300 ms after the final keystroke is applied to `debouncedSearch`.
   - Verified by: `tests/debounceSearch.test.tsx` — "typing a search term eventually filters the product list" types multiple characters (`'wireless'`) and waits for count to settle to 1; if intermediate values fired, count would be wrong or flapping.

5. If `FilterProvider` unmounts while a debounce timeout is pending, the timeout is cancelled and no state update occurs on an unmounted component (no React warning about state update after unmount).
   - Verified by: all tests in `tests/` pass with no console errors or warnings matching `/Can't perform a React state update on an unmounted component/`; `useDebounce`'s `clearTimeout` call in the `useEffect` cleanup must remain present in the final code.

6. The public interface of `FilterContext` is unchanged: `FilterContextValue` retains all its fields (`search`, `debouncedSearch`, `category`, `inStockOnly`, `sortBy`, `savedFilters`) and all exported functions (`setSearch`, `setCategory`, `setInStockOnly`, `setSortBy`, `saveCurrentFilters`, `restoreFilter`, `deleteFilter`, `clearFilters`) with the same signatures.
   - Verified by: `npm run build` (or `npx tsc --noEmit`) exits with code 0 and no type errors; any consumer that imports from `FilterContext` continues to type-check without changes.

7. `src/hooks/useFilteredProducts.ts` is not modified.
   - Verified by: `git diff src/benchmark-frontend/src/hooks/useFilteredProducts.ts` produces no output.

8. `useDebounce` remains generic — its signature stays `useDebounce<T>(value: T, delayMs: number): T` — and if modified, the `clearTimeout` cleanup in its `useEffect` is preserved.
   - Verified by: `npm run build` exits with code 0; the hook compiles for value types other than `string` (existing call-sites continue to type-check).

9. Combining search with other filters (category, in-stock toggle, sort) continues to produce correct results — the debounce change does not break multi-filter interactions.
   - Verified by: `tests/debounceSearch.test.tsx` — "search combines correctly with category filter" and "clearing search while a category is active keeps the category filter" both pass; `tests/filtering.test.tsx`, `tests/sorting.test.tsx`, and `tests/clearFilters.test.tsx` all pass.

10. The full test suite passes with no failures or skipped tests.
    - Verified by: `npm test` (or `npx vitest run`) exits with code 0 and reports 0 failed tests across all files in `tests/`.

11. The TypeScript build succeeds with no compilation errors.
    - Verified by: `npm run build` exits with code 0.

## Edge cases

- Clearing an already-empty search field (`search` was already `''`): `debouncedSearch` remains `''` immediately — covered by requirement 2 (the conditional applies regardless of prior state).
- `clearFilters()` action resets `search` to `''`: `debouncedSearch` must also become `''` immediately, not after 300 ms — covered by requirements 2 and 3.
- Restoring a saved filter with a non-empty search value: treated as a normal `setSearch` call, so the 300 ms debounce applies — covered by requirement 1 (no special-casing needed beyond the clear path).
- Typing, then clearing before 300 ms elapses, then typing again: the intermediate clear cancels the first timer and shows all products instantly; the new typing starts a fresh 300 ms window — covered by requirements 2, 3, and 4.
