# Project

Task: task2
Target: frontend

## Idea

The product filtering feature in the frontend has three logical bugs: (1) sorting is applied before filtering instead of after, (2) the search filter is case-sensitive and does not trim whitespace so lowercase or padded queries return no results, and (3) the "Clear filters" button does not reset the `sortBy` field. The task is to fix these bugs in `productFilters.ts` and `FilterPanel.tsx` so that filters combine correctly, search is case-insensitive and trimmed, sorting happens after filtering without mutating the source array, and clearing resets all filter fields including sort.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK2.MD`: full requirements — filter combination rules, search behaviour (case-insensitive, trimmed), category/in-stock semantics, sorting order (post-filter, non-mutating), and clear-filters spec

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/utils/productFilters.ts`: contains BUG 1 (sort before filter) and BUG 2 (case-sensitive, untrimmed search); primary fix target
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: contains BUG 3 (clear filters omits `sortBy` reset); minor fix needed
- `src/benchmark-frontend/src/hooks/useProductFilters.ts`: `initialFilters` and `clearFilters` look correct; no change expected unless tests reveal otherwise
- `src/benchmark-frontend/tests/`: visible test suite — do not modify; used to verify fixes
