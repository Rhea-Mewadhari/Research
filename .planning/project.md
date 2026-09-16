# Project

Task: task4
Target: frontend

## Idea

Refactor the frontend product filtering implementation to improve separation of concerns, reusability, and readability — without changing any observable behaviour or breaking existing tests. The core issue is that `App.tsx` contains inline filtering and sorting logic (a `visibleProducts` useMemo block) that duplicates what already exists in `src/utils/productFilters.ts`. That inline logic must be removed and replaced with a call to the `filterProducts` utility. Additionally, dead code (the unused `normalizeSearch` export in `productFilters.ts`) and any other unused imports must be removed. The refactoring is purely structural: all tests must continue to pass.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK4.MD`: Defines the four refactoring requirements (separation of concerns, reusability, readability, dead code removal) and the four affected files

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/App.tsx`: Contains inline filter/sort logic in `visibleProducts` useMemo that should be replaced with a `filterProducts(products, filters)` call; also imports `filterProducts` but doesn't use it for the visible-products computation (uses its own inline version instead)
- `src/benchmark-frontend/src/utils/productFilters.ts`: Contains `filterProducts` (correct, should be the single source of filter+sort logic) and `normalizeSearch` (exported but unused — dead code to remove)
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: Receives `FilterState` and updates via `onChange`; generally clean but should be verified for any inline logic or duplicated filtering
- `src/benchmark-frontend/src/components/SortSelect.tsx`: Handles sort selection via props; currently clean — verify no inline sort logic
- `src/benchmark-frontend/src/hooks/useProductFilters.ts`: Provides filter state, products, pagination — consumed by `App.tsx`; exports `updateFilter` and `clearFilters` helpers that `App.tsx` does not currently use (potential readability improvement)
- `src/benchmark-frontend/tests/`: All test files — must not be modified, must all continue to pass after refactoring
