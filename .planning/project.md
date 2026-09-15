# Project

Task: task2
Target: frontend

## Idea

The product filtering feature in the frontend app is already implemented but contains three distinct logical bugs: (1) sorting is applied before filtering instead of after, (2) search matching is case-sensitive and does not trim leading/trailing whitespace, and (3) the "Clear filters" button does not reset the `sortBy` field back to `'default'`. The task is to fix these bugs with minimal, targeted changes so that combined filters work correctly, search is case-insensitive and trimmed, sorting runs after filtering, and clearing filters fully resets all state including sort order.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK2.MD`: Full bug list, requirements (filter composition, search behaviour, category filter, in-stock filter, sorting after filtering, clear filters reset), constraints (no rewrites, no new libraries, minimal changes), and expected files to modify.

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/utils/productFilters.ts`: Contains BUG 1 (sort applied before filtering) and BUG 2 (search is case-sensitive and does not trim). Primary file to fix.
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: Contains BUG 3 — "Clear filters" onClick spreads existing filters and omits `sortBy` reset, so sort order is not cleared.
- `src/benchmark-frontend/src/hooks/useProductFilters.ts`: `clearFilters` sets `initialFilters` (which includes `sortBy: 'default'`), but the bug is upstream in `FilterPanel.tsx` which bypasses the hook's `clearFilters` and calls `onChange` directly with a partial reset.
- `src/benchmark-frontend/tests/`: Test files (read-only, must not be modified) — `filtering.test.tsx`, `sorting.test.tsx`, `clearFilters.test.tsx` are the most relevant to this task.
