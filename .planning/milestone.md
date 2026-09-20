# Milestone

Task: task8
Target: frontend

## Requirements addressed
- Req 1 — Conditional delay in `useDebounce` call: verified — `FilterContext.tsx` line 51 reads `useDebounce(search, search === '' ? 0 : 300)`, resolving to `0` when search is empty and `300` otherwise.
- Req 2 — 300 ms debounce for typing: verified — `debounceSearch.test.tsx` all 5 tests passed (including "typing a search term eventually filters the product list", "search is case-insensitive", "search combines correctly with category filter").
- Req 3 — Immediate clear on empty string: verified — "clearing the search field restores all products" and "clearing search while a category is active keeps the category filter" both passed without timeout.
- Req 4 — No unmount warning: verified — full test run produced no `state update on an unmounted component` or `Can't perform a React state update` warnings.
- Req 5 — `FilterContext` public interface unchanged: verified — `pnpm build` exited 0; all 14 properties of `FilterContextValue` and `useFilterContext` export unchanged.
- Req 6 — `useDebounce` signature unchanged: verified — `pnpm build` exited 0; `useDebounce.ts` line 3 still `function useDebounce<T>(value: T, delayMs: number): T`.
- Req 7 — Other filters unaffected: verified — `filtering.test.tsx` (3 ✓), `sorting.test.tsx` (3 ✓), `clearFilters.test.tsx` (1 ✓), `pagination.test.tsx` (5 ✓), `app.render.test.tsx` (1 ✓) all passed.
- Req 8 — `useFilteredProducts.ts` not modified: verified — `git diff src/benchmark-frontend/src/hooks/useFilteredProducts.ts` produced no output.

## Files changed
- `src/benchmark-frontend/src/context/FilterContext.tsx`: Changed `useDebounce(search, 0)` to `useDebounce(search, search === '' ? 0 : 300)` at line 51, fixing both debounce bugs (no delay and no instant-clear behaviour).

## Checks
- pnpm test: 22 passed, 0 failed
- pnpm run build: pass
