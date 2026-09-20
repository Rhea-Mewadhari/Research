# Project

Task: task8
Target: frontend

## Idea

Fix two bugs in `FilterContext`'s debounce wiring: (1) the delay passed to `useDebounce` is `0` instead of `300`, meaning every keystroke immediately re-filters; (2) clearing the search field (`search === ''`) should bypass the debounce entirely and apply immediately, but currently it goes through the same broken delay path. The fix lives in `FilterContext.tsx` — change the `useDebounce` call to use `search === '' ? 0 : 300` as the delay (or an equivalent approach), so typing is debounced by 300 ms while clearing is instant, and no pending timeout fires after a clear.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK8.MD`: full requirements — 300 ms debounce on typing, instant clear, no memory leaks on unmount, constraints (no new deps, don't change public interface, don't modify `useFilteredProducts.ts`, keep `useDebounce` generic)

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/context/FilterContext.tsx`: contains the buggy `useDebounce(search, 0)` call on line 51 — this is the primary fix target
- `src/benchmark-frontend/src/hooks/useDebounce.ts`: generic debounce hook — may need minor modification depending on chosen approach, but the spec says it is optional
- `src/benchmark-frontend/src/hooks/useFilteredProducts.ts`: reads `debouncedSearch` from context — must not be modified, but behaviour depends on the fix being correct
- `src/benchmark-frontend/tests/`: visible test files (deleted in git status, but the test runner will restore/run them) — must not be modified
