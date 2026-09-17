# Project

Task: task1
Target: backend

## Idea

The frontend and backend were developed by separate teams and have diverged. The frontend sends sort values in hyphenated format (`price-asc`, `price-desc`, `rating-desc`) but the backend only recognises camelCase (`priceAsc`, etc.) and silently drops any unrecognised sort value. Additionally, the backend response envelope uses field names `count` and `pages`, but the frontend expects `total` and `totalPages`. The task is to fix both mismatches in the backend without touching auth logic, the Product data shape, or any test files, and without breaking existing filters.

## Spec pointers

- `src/benchmark-backend/instructions/TASK1.md`: full task description covering both mismatches (sort param format, response envelope field names), constraints, affected files, and success criteria

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/utils/queryParser.ts`: must accept hyphenated sort format (`price-asc`, `price-desc`, `rating-desc`) in addition to (or instead of) existing camelCase values
- `src/benchmark-backend/src/services/productService.ts`: must return `total` and `totalPages` instead of `count` and `pages` in the response envelope; must handle `rating-desc` sort correctly
- `src/benchmark-backend/src/controllers/productController.ts`: likely relevant as it calls queryParser and productService, may need review
- `src/benchmark-backend/src/types/product.ts`: may define sort/response types that need updating
- `src/benchmark-backend/src/tests/visible/products.test.ts`: read-only reference for understanding expected behaviour
