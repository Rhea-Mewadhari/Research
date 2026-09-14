# Project

Task: task2
Target: frontend

## Idea

The product filtering feature in the frontend has multiple logical bugs that need to be fixed without rewriting the app. The bugs cause: case-sensitive search (misses lowercase matches), search not trimming whitespace, sorting applied before filtering (wrong order), and "Clear filters" not resetting the sort field. All fixes are confined to `src/utils/productFilters.ts` and `src/components/FilterPanel.tsx`.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK2.MD`: Full task description — lists 6 observable bugs, 6 requirements (filter combination, case-insensitive/trimmed search, category filter, in-stock filter, sort-after-filter, clear-all-fields), constraints (minimal changes, no new libs, preserve structure), and expected files to modify.

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/utils/productFilters.ts`: Contains two confirmed bugs — (1) sort is applied before filtering instead of after, and (2) search uses `includes()` without `.toLowerCase()` or `.trim()`, making it case-sensitive and whitespace-sensitive.
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: Contains one confirmed bug — the "Clear filters" button spreads existing `filters` and only resets `search`, `category`, and `inStockOnly`, but omits `sortBy`, so sort is not cleared.
- `src/benchmark-frontend/src/hooks/useProductFilters.ts`: `clearFilters` callback resets to `initialFilters` correctly, but the component's Clear button bypasses this by calling `onChange` directly with a partial reset — no fix needed in the hook itself.
- `src/benchmark-frontend/tests/`: Read-only — must not be modified; tests drive the success criteria.
