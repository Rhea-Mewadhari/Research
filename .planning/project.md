# Project

Task: task3
Target: frontend

## Idea

The frontend codebase has several injected syntax, type, and JSX errors that prevent the app from compiling and running. The task is to locate and fix all such errors—covering invalid JSX, wrong TypeScript property names, broken imports, and type mismatches—without changing any functionality or rewriting components beyond what is strictly needed to make the app build and all tests pass.

## Spec pointers

- `benchmark-frontend/instructions/TASK3.MD`: Defines the bug-fix objective; lists categories of errors (invalid JSX, TypeScript issues, event handling, imports/exports); constrains changes to error fixes only; expects app build success, test pass, and no runtime crashes.

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/App.tsx`: Two bugs — (1) CSS import path `'./styles.css'` does not exist; correct path is `'./styles/style.css'`. (2) `<ProductList products={visibleProducts}` is not closed with `/>` before the next sibling `<div>`; this is invalid JSX that breaks the build.
- `src/benchmark-frontend/src/components/ProductCard.tsx`: Three references to `product.discountPercent` which does not exist on the `Product` type; the correct field name is `discountPct` (lines 9, 25, 37).
- `src/benchmark-frontend/src/components/SortSelect.tsx`: `onChange(e.target.value)` passes a plain `string` where the prop type expects `FilterState['sortBy']` (`'default' | 'price-asc' | 'price-desc' | 'rating-desc'`). Requires a cast to the union type.
