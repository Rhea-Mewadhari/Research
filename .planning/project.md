# Project

Task: task8
Target: frontend

## Idea

Two bugs were deliberately introduced into the `FilterContext` debounce wiring. First, the delay passed to `useDebounce` is `0` instead of `300`, so the debounce fires immediately on every keystroke. Second, clearing the search field (setting `search` to `''`) should bypass the debounce and reset `debouncedSearch` instantly, but currently it goes through the same (broken) zero-delay path. The fix is to change the single `useDebounce` call in `FilterContext` so it uses a 300 ms delay for non-empty strings and a 0 ms delay (immediate) when the search is cleared — using a conditional delay expression: `search === '' ? 0 : 300`. No new dependencies, no public interface changes, no changes to `useFilteredProducts.ts`.

## Spec pointers

- `benchmark-frontend/instructions/TASK8.MD`: Full requirements — 300 ms debounce on typing, immediate clear on empty string, no memory leaks on unmount, affected files, success criteria, and approach decision surfaces.

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/context/FilterContext.tsx`: Contains the buggy `useDebounce(search, 0)` call — the delay `0` must become `search === '' ? 0 : 300`.
- `src/benchmark-frontend/src/hooks/useDebounce.ts`: The hook itself is correct (generic, cleans up via `clearTimeout`). May need modification only if the chosen approach requires it; the conditional-delay approach does not require changes here.
- `src/benchmark-frontend/tests/`: Visible tests that must all pass after the fix — cannot be modified.
