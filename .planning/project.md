# Project

Task: task8
Target: frontend

## Idea

Fix two bugs in the debounce wiring inside `FilterContext`. Currently, `useDebounce` is called with a delay of `0`, so typing produces immediate re-filters with no debounce. The fix requires two changes: (1) pass `300` as the delay so typing waits 300 ms after the last keystroke before filtering, and (2) make clearing the search field (`search === ''`) bypass the debounce entirely so the full product list reappears instantly. The `useDebounce` hook itself is correct (it already cleans up pending timeouts on unmount); the only defective call site is in `FilterContext`.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK8.MD`: Full requirements — the two bugs, three requirements (300 ms debounce, immediate clear, no memory leak), constraints (no new deps, no public interface change, do not modify `useFilteredProducts.ts`), and decision surfaces (where to put the `300` constant, how to detect clear vs type, unmount cleanup).

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/context/FilterContext.tsx`: Contains the buggy `useDebounce(search, 0)` call at line 51; this is the primary file to fix.
- `src/benchmark-frontend/src/hooks/useDebounce.ts`: The hook itself — generic, delay-configurable, already has correct `clearTimeout` cleanup. Only touch if the chosen approach (e.g. adding an `immediate` flag) requires it; the conditional-delay approach (`search === '' ? 0 : 300`) requires no changes here.
- `src/benchmark-frontend/tests/`: Read-only visible tests — must all pass after the fix; do not modify.
