# Project

Task: task4
Target: frontend

## Idea

Refactor the product filtering and sorting implementation in the frontend without changing any behavior. The main problem is that `App.tsx` contains inline filtering and sorting logic that duplicates what already exists in `productFilters.ts`. The goal is to move all filter/sort logic into `productFilters.ts`, have `App.tsx` call `filterProducts()` instead of re-implementing it, remove the dead `normalizeSearch` export from `productFilters.ts`, and ensure no unused imports or variables remain anywhere.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK4.MD`: Full task spec — separation of concerns, reusability, readability, dead code removal, constraints (no behavior change, no broken tests, no new dependencies)

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/App.tsx`: Contains inline filtering+sorting logic in a `useMemo` block that duplicates `filterProducts()` from `productFilters.ts`; this logic should be replaced with a call to `filterProducts(products, filters)`
- `src/benchmark-frontend/src/utils/productFilters.ts`: Already has correct `filterProducts()` implementation; has a dead `normalizeSearch` export (comment says "never cleaned up") that should be removed
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: Looks structurally clean; its `handleClear` hardcodes an initial filter literal — could reference an exported constant from the hook or utils
- `src/benchmark-frontend/src/components/SortSelect.tsx`: Looks clean; no obvious issues
- `src/benchmark-frontend/src/hooks/useProductFilters.ts`: Exports `updateFilter` and `clearFilters` but `App.tsx` does not use them — `App.tsx` uses raw `setFilters`; investigate whether these are used or dead
- `src/benchmark-frontend/tests/`: Read-only; must not be modified
