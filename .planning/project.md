# Project

Task: task3
Target: frontend

## Idea

The frontend codebase has several intentionally injected syntax and runtime errors across multiple files. The task is to find and fix every error so that the application compiles without errors, the UI renders correctly in the browser, and all Vitest tests pass. No functionality should change — only bugs should be removed.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK3.MD`: Describes objective (fix syntax/runtime errors), lists error categories (JSX, TypeScript, event handlers, imports/exports), and constraints (do not change functionality, do not rewrite unnecessarily).

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/App.tsx`: Two bugs found — (1) CSS import path `'./styles.css'` does not exist (should be `'./App.css'`); (2) `<ProductList products={visibleProducts}` is missing its closing `/>`, breaking JSX structure.
- `src/benchmark-frontend/src/components/ProductCard.tsx`: References `product.discountPercent` (lines 9, 25, 37) but the `Product` type defines the field as `discountPct`. This causes a TypeScript error and runtime `undefined` access.
- `src/benchmark-frontend/src/components/SortSelect.tsx`: `onChange` handler passes `e.target.value` (type `string`) to a callback typed as `(sortBy: FilterState['sortBy']) => void`, where `FilterState['sortBy']` is a union of string literals. Requires a type assertion or cast.
- `src/benchmark-frontend/src/utils/productFilters.ts`: No errors found — logic appears correct.
- `src/benchmark-frontend/src/hooks/useProductFilters.ts`: No errors found.
- `src/benchmark-frontend/src/utils/formatters.ts`: No errors found.
- `src/benchmark-frontend/src/api/productsApi.ts`: No errors found.
- `src/benchmark-frontend/src/types/product.ts`: No errors found — `discountPct` is correctly defined as optional.
- `src/benchmark-frontend/src/main.tsx`: No errors found.
- `src/benchmark-frontend/src/components/FilterPanel.tsx`: No errors found.
- `src/benchmark-frontend/src/components/ProductList.tsx`: No errors found.
- `src/benchmark-frontend/src/components/Spinner.tsx`: No errors found.
