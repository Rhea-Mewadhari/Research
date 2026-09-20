# Project

Task: task8
Target: frontend

## Idea

Fix two bugs in the debounce wiring within `FilterContext`: (1) the delay argument passed to `useDebounce` is currently `0`, so there is no real debounce — it must be changed to `300` ms so that search filtering only fires after the user pauses typing; (2) when the user clears the search field (`search === ''`), `debouncedSearch` must reset immediately rather than waiting the 300 ms delay, so the full product list reappears instantly. The `useDebounce` hook itself is structurally sound; the fix primarily lives in how `FilterContext` calls it.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK8.MD`: Full task specification — objective, context, requirements (300 ms debounce on typing, immediate clear, no memory leaks on unmount), constraints (no new deps, no public API changes, do not modify `useFilteredProducts.ts`, keep `useDebounce` generic), decision surfaces, expected files to modify, and success criteria.

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/context/FilterContext.tsx`: Primary fix location — where `useDebounce` is called with the broken `0` delay argument; must pass `300` and handle the instant-clear case.
- `src/benchmark-frontend/src/hooks/useDebounce.ts`: Optionally modified if the chosen approach (e.g. a conditional delay expression) requires hook changes; must preserve `clearTimeout` cleanup on unmount.
- `src/benchmark-frontend/src/hooks/useFilteredProducts.ts`: Must NOT be modified — reads `debouncedSearch` from context; its behaviour is the expected downstream consumer.
- `src/benchmark-frontend/tests/`: Visible tests that must continue to pass — read-only per framework constraints.
