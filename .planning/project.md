# Project

Task: task1
Target: frontend

## Idea

Complete the filtering and sorting feature for a React product catalog. The app already fetches and renders products from a backend API, but the filter/sort logic is stubbed out. The work involves: (1) implementing `filterProducts` in `productFilters.ts` to handle case-insensitive name search, category filtering, in-stock filtering, and sorting by price/rating; (2) wiring up `FilterPanel.tsx` so its controls call `onChange` instead of no-ops; (3) wiring up `SortSelect.tsx` so its select calls `onChange`; and (4) ensuring the "Clear filters" button resets all state to defaults. An empty-state message "No products found." must render when no products match.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK1.MD`: full functional requirements (search, category, in-stock, sort, clear, empty state), technical constraints, and success criteria

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/utils/productFilters.ts`: core filtering/sorting logic is entirely unimplemented (TODOs)
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: all onChange handlers are no-ops; Clear filters button does nothing
- `src/benchmark-frontend/src/components/SortSelect.tsx`: onChange handler is a no-op
- `src/benchmark-frontend/src/App.tsx`: may need to verify ProductList receives filtered/sorted data and renders empty state
- `src/benchmark-frontend/src/components/ProductList.tsx`: may need to render "No products found." when list is empty
