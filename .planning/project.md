# Project

Task: task2
Target: frontend

## Idea

The product filtering feature in the React frontend has three injected logical bugs: (1) sorting is applied before filtering instead of after, causing incorrect sorted results; (2) the search filter is case-sensitive and does not trim leading/trailing whitespace, causing searches like "wireless" or " Wireless " to return no results; and (3) the "Clear filters" button in FilterPanel spreads the current filter state and only resets `search`, `category`, and `inStockOnly`, leaving `sortBy` unreset. The fix requires correcting the order of operations and the search comparison in `productFilters.ts`, and fixing the clear-filters handler in `FilterPanel.tsx`.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK2.MD`: Full task description — lists all five observable bugs, all six fix requirements (filter combination, case-insensitive/trimmed search, category filter, in-stock filter, sort-after-filter, clear-all-fields), constraints, expected files to modify, and success criteria.

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/utils/productFilters.ts`: Contains BUG 1 (sort before filter) and BUG 2 (case-sensitive, untrimmed search). Primary fix target per task spec.
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: Contains BUG 3 — the inline "Clear filters" onClick handler spreads `...filters` and omits `sortBy` from the reset, so `sortBy` is never cleared.
- `src/benchmark-frontend/src/hooks/useProductFilters.ts`: `clearFilters` correctly resets to `initialFilters` (which includes `sortBy: 'default'`), but this function is not wired to the "Clear filters" button — the button uses its own inline handler in FilterPanel.
- `src/benchmark-frontend/src/App.tsx`: Wires `setFilters` directly to FilterPanel's `onChange`, so the clear button's partial reset propagates uncorrected.
