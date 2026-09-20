# Project

Task: task8
Target: frontend

## Idea

Fix two debounce bugs in `FilterContext`: (1) the delay passed to `useDebounce` is `0` instead of `300`, so search filtering fires on every keystroke with no delay; (2) when the user clears the search field (`search === ''`), the debounced value should update immediately rather than waiting for the timer. The fix lives entirely in `FilterContext.tsx` — pass a conditional delay (`search === '' ? 0 : 300`) to `useDebounce` so clears bypass the debounce while typing is properly delayed. The `useDebounce` hook itself may also need a small adjustment to fire immediately when `delayMs` is `0`, though the current implementation already handles this correctly (a `setTimeout` with `0` ms fires as a microtask on the next tick, which is effectively immediate for this purpose).

## Spec pointers

- `src/benchmark-frontend/instructions/TASK8.MD`: Full task description — two bugs (delay=0, no instant clear), requirements, constraints, and decision surfaces

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/context/FilterContext.tsx`: Line 51 — `useDebounce(search, 0)` must become `useDebounce(search, search === '' ? 0 : 300)`
- `src/benchmark-frontend/src/hooks/useDebounce.ts`: Generic hook — currently correct; may not need changes depending on chosen approach
- `src/benchmark-frontend/src/hooks/useFilteredProducts.ts`: Consumes `debouncedSearch` from context — must not be modified
