# Project

Task: task3
Target: frontend

## Idea

The frontend codebase has several intentionally injected syntax and runtime bugs that prevent the app from compiling and running correctly. The task is to locate and fix all of them — covering invalid JSX, incorrect TypeScript types, wrong property names, and broken imports — without changing any functionality or rewriting components unnecessarily.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK3.MD`: Describes the objective (fix syntax/runtime errors so app builds, UI renders, and all tests pass). Enumerates four error categories: JSX issues, TypeScript issues, event handling, imports/exports.

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/App.tsx`: Two bugs — (1) wrong CSS import path (`./styles.css` should be `./styles/style.css`); (2) unclosed `<ProductList>` JSX tag (missing `/>` before the pagination `<div>`).
- `src/benchmark-frontend/src/components/ProductCard.tsx`: Wrong property name — `product.discountPercent` used throughout (lines 9, 25, 37) but the `Product` type defines `discountPct`.
- `src/benchmark-frontend/src/components/SortSelect.tsx`: TypeScript type mismatch — `e.target.value` (type `string`) passed directly to `onChange` which expects `FilterState['sortBy']` (a narrow union type); needs a type cast.
- `src/benchmark-frontend/src/types/product.ts`: Reference type file (no bugs found; defines `discountPct?: number`).
- `src/benchmark-frontend/src/utils/productFilters.ts`: Clean — no bugs found.
- `src/benchmark-frontend/src/utils/formatters.ts`: Clean — no bugs found.
- `src/benchmark-frontend/src/hooks/useProductFilters.ts`: Clean — no bugs found.
- `src/benchmark-frontend/src/api/productsApi.ts`: Clean — no bugs found.
