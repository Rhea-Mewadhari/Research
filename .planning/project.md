# Project

Task: task1
Target: frontend

## Idea

The task asks us to complete a product catalog filtering and sorting feature in a React frontend. The application already renders products fetched from a backend API, but the filtering/sorting logic and the UI controls are incomplete. We need to implement: case-insensitive name search (with whitespace trimming), category dropdown filter, in-stock-only checkbox, sort by price (asc/desc) and rating (desc), a "Clear filters" button that resets all state to defaults, and an empty-state message ("No products found.") when no products match. The solution must not mutate the input array, must keep controls accessible via labels, and must pass all existing visible tests.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK1.MD`: Full functional requirements, technical constraints, expected files to modify, and success criteria for the filtering/sorting feature

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/utils/productFilters.ts`: Core filtering and sorting logic — needs implementation of filter-by-name, filter-by-category, filter-by-inStock, and sort functions
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: UI controls for search input, category dropdown, in-stock checkbox, and clear-filters button — likely incomplete or missing handlers/bindings
- `src/benchmark-frontend/src/components/SortSelect.tsx`: Sort dropdown control — likely incomplete or missing the sort options/handler
- `src/benchmark-frontend/src/App.tsx`: Wires up state, derived categories list, and passes props to FilterPanel and ProductList — may need review to confirm integration points
- `src/benchmark-frontend/src/hooks/useProductFilters.ts`: Hook that holds filter state — read-only per constraints, but must be understood for interface
- `src/benchmark-frontend/src/types/`: Type definitions (e.g., Product, FilterState) — must be understood before implementing filter logic
- `src/benchmark-frontend/tests/`: Visible test files — must pass but must not be modified
