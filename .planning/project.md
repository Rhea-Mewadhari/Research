# Project

Task: task4
Target: frontend

## Idea

Refactor the frontend product filtering implementation to improve separation of concerns, reusability, and readability without changing any behavior. The main structural problems are: (1) `App.tsx` duplicates filtering and sorting logic that already exists in `productFilters.ts` — the `visibleProducts` useMemo re-implements the same filter/sort inline instead of calling `filterProducts`; (2) `productFilters.ts` exports `normalizeSearch` which is unused dead code; (3) `filterProducts` has an awkward early-return pattern for sorted results that makes the sort logic harder to read. The fix should remove the inline logic in `App.tsx` by calling `filterProducts` from `productFilters.ts`, remove the dead `normalizeSearch` export, and clean up any other dead code — all without breaking existing tests.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK4.MD`: Full task definition — objectives, requirements (separation of concerns, reusability, readability, dead code removal), constraints (no behavior change, no broken tests, no new deps), expected refactoring areas, and success criteria.

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/App.tsx`: Contains inline filter/sort logic in `visibleProducts` useMemo that duplicates `filterProducts`; imports `filterProducts` but never calls it — this is the primary fix site.
- `src/benchmark-frontend/src/utils/productFilters.ts`: Exports unused `normalizeSearch` function (dead code with comment admitting it); `filterProducts` has awkward early-return sort pattern that could be simplified.
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: Receives `onChange` as raw `FilterState` setter wrapper — currently clean, but should be verified against separation-of-concerns requirements.
- `src/benchmark-frontend/src/components/SortSelect.tsx`: Currently delegates sort change back to parent via callback — clean, no changes likely needed.
- `src/benchmark-frontend/src/hooks/useProductFilters.ts`: Provides filter state and product data to App — likely no changes needed.
