# Requirements

1. The `useDebounce` call in `FilterContext.tsx` passes a delay of `300` when `search` is non-empty and a delay of `0` when `search` is `''` — e.g. `useDebounce(search, search === '' ? 0 : 300)` or equivalent.
   - Verified by: read `src/benchmark-frontend/src/context/FilterContext.tsx` and confirm the `useDebounce` call site uses a delay expression that resolves to `300` for non-empty values and `0` for `''`.

2. Typing into the search field does not trigger a filter update until 300 ms after the last keystroke; the displayed product count does not change until the debounce window elapses.
   - Verified by: `tests/debounceSearch.test.tsx` — tests "typing a search term eventually filters the product list", "search is case-insensitive", and "search combines correctly with category filter" all pass (each uses `waitFor` to assert the count only reaches the filtered value after typing settles).

3. When the search field is cleared (`search` becomes `''`), `debouncedSearch` resets to `''` immediately with no timer delay, and the full (or category-filtered) product list reappears at once.
   - Verified by: `tests/debounceSearch.test.tsx` — tests "clearing the search field restores all products" (expects `Showing 15 products` immediately after `user.clear`) and "clearing search while a category is active keeps the category filter" (expects `Showing 5 products` immediately after `user.clear`) both pass.

4. Any pending debounce timeout for a non-empty search value is cancelled when the field is cleared, so the stale filtered value never fires after the clear.
   - Verified by: same two clear tests in `tests/debounceSearch.test.tsx` — if the stale timeout fired, the count would briefly show a filtered value before jumping to the full count, causing the `findByText(/yoga mat/i)` or count assertions to fail or flake.

5. Unmounting `FilterProvider` while a debounce timeout is pending does not produce a React state-update-on-unmounted-component warning; `useDebounce`'s `clearTimeout` cleanup in its `useEffect` return must remain intact after the fix.
   - Verified by: `src/benchmark-frontend/src/hooks/useDebounce.ts` is either unmodified (`git diff -- src/benchmark-frontend/src/hooks/useDebounce.ts` shows no changes) or, if modified, still contains `return () => clearTimeout(timer)` inside the `useEffect`.

6. The public interface of `FilterContext` — the `FilterContextValue` type shape and all exported symbols (`FilterProvider`, `useFilterContext`) — is unchanged.
   - Verified by: TypeScript compilation succeeds (`npx tsc --noEmit` exits 0 with no type errors); the `FilterContextValue` interface in `FilterContext.tsx` contains the same fields as before the fix.

7. `src/benchmark-frontend/src/hooks/useFilteredProducts.ts` is not modified.
   - Verified by: `git diff -- src/benchmark-frontend/src/hooks/useFilteredProducts.ts` produces no output.

8. No new npm dependencies are added to `package.json`.
   - Verified by: `git diff -- src/benchmark-frontend/package.json` shows no new entries under `dependencies` or `devDependencies`.

9. Category filter, in-stock toggle, and sort filters continue to work correctly and independently of the search debounce fix.
   - Verified by: `tests/filtering.test.tsx`, `tests/sorting.test.tsx`, and `tests/clearFilters.test.tsx` all pass.

10. The full test suite passes and the project builds without errors.
    - Verified by: `npm test` (run from `src/benchmark-frontend/`) exits with code 0; `npm run build` exits with code 0.

## Edge cases

- Rapid typing (multiple keystrokes within 300 ms): only the value at the end of the final 300 ms window is applied; intermediate values are discarded. Covered by requirement 2 (the `waitFor` assertions only resolve once the final debounced value is applied).
- Clearing after rapid typing (clear arrives before any debounce timeout fires): the pending timeout for the partial typed value must be cancelled. Covered by requirements 3 and 4.
- Empty initial render (search already `''` on mount): `debouncedSearch` must initialise to `''` without waiting — the conditional delay of `0` for `''` ensures this. Covered by requirement 1.
- Category filter active while clearing search: the category remains applied; only search resets. Covered by requirement 3 (the "clearing search while a category is active" test checks `Showing 5 products`, not 15).
- `useDebounce` generic contract (`T` type parameter) must not be broken by any changes to the hook. Covered by requirement 6 (TypeScript compilation check).
