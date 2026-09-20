# Requirements

1. `FilterContext.tsx` calls `useDebounce` with a conditional delay: `search === '' ? 0 : 300`.
   The delay argument must not be the literal `0` for all cases, and must not be the literal `300` for all cases — it must vary based on whether `search` is empty.
   - Verified by: read `src/benchmark-frontend/src/context/FilterContext.tsx` after the fix and confirm the `useDebounce` call at line 51 (or its replacement) passes a conditional expression that resolves to `0` when `search === ''` and `300` otherwise.

2. Typing into the search field does not update `debouncedSearch` until 300 ms after the last keystroke; rapid keypresses reset the timer so only the final value is applied.
   - Verified by: `tests/debounceSearch.test.tsx` — tests "typing a search term eventually filters the product list", "search is case-insensitive", and "search combines correctly with category filter" all pass (`pnpm --filter benchmark-frontend test --run`).

3. Clearing the search field (setting `search` to `''`) causes `debouncedSearch` to become `''` immediately, with no 300 ms wait, and any pending debounce timeout for a prior non-empty value must not fire after the clear.
   - Verified by: `tests/debounceSearch.test.tsx` — tests "clearing the search field restores all products" and "clearing search while a category is active keeps the category filter" both pass without `waitFor` timing out.

4. No React "state update on unmounted component" warning is emitted when the component unmounts while a debounce timeout is pending (i.e., `useDebounce`'s `useEffect` cleanup continues to call `clearTimeout` correctly).
   - Verified by: full test suite run (`pnpm --filter benchmark-frontend test --run`) produces no console warnings matching `state update on an unmounted component` or `Warning: Can't perform a React state update`.

5. The public interface of `FilterContext` is unchanged: `FilterContextValue` retains all existing properties (`search`, `debouncedSearch`, `category`, `inStockOnly`, `sortBy`, `savedFilters`, `setSearch`, `setCategory`, `setInStockOnly`, `setSortBy`, `saveCurrentFilters`, `restoreFilter`, `deleteFilter`, `clearFilters`) with the same types, and the `useFilterContext` export signature is unchanged.
   - Verified by: `pnpm --filter benchmark-frontend build` exits with code 0 (TypeScript compilation would fail on any type mismatch or removed export).

6. `useDebounce` remains a generic hook accepting any value type `T` and a `number` delay — no new parameters are added and no narrowing of the value type is introduced.
   - Verified by: `pnpm --filter benchmark-frontend build` exits with code 0; the hook signature in `src/hooks/useDebounce.ts` still matches `function useDebounce<T>(value: T, delayMs: number): T`.

7. All other filters (category, in-stock toggle, sort order) and saved-filter operations continue to work correctly without modification.
   - Verified by: `tests/filtering.test.tsx`, `tests/sorting.test.tsx`, `tests/clearFilters.test.tsx`, `tests/pagination.test.tsx`, and `tests/app.render.test.tsx` all pass in the full test run.

8. `useFilteredProducts.ts` is not modified.
   - Verified by: `git diff src/benchmark-frontend/src/hooks/useFilteredProducts.ts` produces no output after the fix is applied.

## Edge cases

- Rapid typing ("abc" typed quickly): only the debounce timer for the last character fires; intermediate values are discarded — covered by requirement 2.
- Clear immediately after typing (before 300 ms elapses): the pending 300 ms timeout must be cancelled and `debouncedSearch` must become `''` at once — covered by requirement 3.
- Clearing search while a category filter is active: `debouncedSearch` becomes `''` immediately but category state is unaffected — covered by requirement 3 (test "clearing search while a category is active keeps the category filter").
- Unmount during pending debounce (e.g., navigating away mid-type): no memory leak or React warning — covered by requirement 4.
- Empty string on first render: `debouncedSearch` starts as `''` and a delay of `0` is applied, consistent with the existing `useState('')` initialisation in `useDebounce` — covered by requirement 1 (the conditional expression is `0` for `''`, which matches current behaviour).
