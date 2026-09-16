# Project

Task: task4
Target: frontend

## Idea

Refactor the product filtering implementation in the frontend (React/Vite) to improve separation of concerns, eliminate duplicated logic, and remove dead code — without changing any observable behaviour or breaking existing tests. The main problem is that `App.tsx` reimplements filter and sort logic inline (in its `visibleProducts` memo) when a perfectly good `filterProducts()` utility already exists in `productFilters.ts`. Additionally, `productFilters.ts` exports an unused `normalizeSearch` function that was never cleaned up, and `FilterPanel.tsx` contains a dead branch in `handleCategoryChange` that maps `'all'` → `'All'` even though the rendered `<option>` values are always `'All'` (title-case), so the branch can never fire.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK4.MD`: Full task description — requirements, constraints, and expected refactoring areas.

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/App.tsx`: Contains a `visibleProducts` memo (lines 19–44) that duplicates the filter + sort logic already implemented in `filterProducts()`. Replace the inline logic with a call to `filterProducts(products, filters)`.
- `src/benchmark-frontend/src/utils/productFilters.ts`: Exports `normalizeSearch` (lines 11–13) which is dead code — never imported or called anywhere outside its own file. Remove it.
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: `handleCategoryChange` (line 15) has a dead condition `e.target.value === 'all'` (rendered options use `'All'`, not `'all'`). Can be simplified to a direct pass-through. Otherwise the component is well-structured — receives state and callbacks as props, no business logic.
- `src/benchmark-frontend/src/components/SortSelect.tsx`: Already clean — receives `value` and `onChange` as props, no logic to extract.
- `src/benchmark-frontend/src/hooks/useProductFilters.ts`: Already clean — owns filter state and data fetching, exposes `setFilters`, `updateFilter`, `clearFilters`. No changes expected.
- `src/benchmark-frontend/tests/`: Read-only — must not be modified; all existing tests must continue to pass.
