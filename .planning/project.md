# Project

Task: task4
Target: frontend

## Idea

Refactor the frontend product filtering implementation to improve separation of concerns, reusability, and readability — without changing any behavior or breaking tests. Specifically: move all filter/sort logic out of `App.tsx` into `productFilters.ts`, remove dead code (`normalizeSearch` is exported but never actually used via that export), and ensure components only handle rendering and user interaction rather than re-implementing business logic inline.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK4.MD`: Full task requirements — separation of concerns, reusability, readability, dead code removal, constraints (no new deps, no behavior change, no test modification)

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/App.tsx`: Contains inline `visibleProducts` computation that duplicates filter/sort logic already present in `productFilters.ts`; should call `filterProducts()` instead
- `src/benchmark-frontend/src/utils/productFilters.ts`: Has dead export `normalizeSearch` (comment says "never cleaned up"); also the main home for filter/sort logic that should be called by App
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: Currently clean — receives props and calls `onChange`; no business logic to extract
- `src/benchmark-frontend/src/components/SortSelect.tsx`: Currently clean — thin wrapper around a select; no business logic to extract
