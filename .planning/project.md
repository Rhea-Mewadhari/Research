# Project

Task: task2
Target: frontend

## Idea

The product filtering feature in the React frontend has three injected logical bugs: (1) sorting is applied before filtering instead of after, (2) the search filter is case-sensitive and does not trim leading/trailing whitespace, and (3) the "Clear filters" button in `FilterPanel.tsx` spreads the current filter state and overwrites only some fields, leaving `sortBy` unreset. The task is to fix all three bugs so that filters combine correctly, search is case-insensitive and trimmed, sort is always applied after filtering, and "Clear filters" fully resets all filter fields including `sortBy`.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK2.MD`: defines all requirements — combined filters, case-insensitive+trimmed search, category/in-stock logic, sort-after-filter, no mutation, full clear reset

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/utils/productFilters.ts`: contains Bug 1 (sort before filter) and Bug 2 (case-sensitive, untrimmed search) — primary fix target
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: contains Bug 3 (clear filters does not reset `sortBy`) — secondary fix target
- `src/benchmark-frontend/tests/filtering.test.tsx`: visible tests covering filter combination and search behavior
- `src/benchmark-frontend/tests/sorting.test.tsx`: visible tests covering sort-after-filter correctness
- `src/benchmark-frontend/tests/clearFilters.test.tsx`: visible tests covering full filter reset
