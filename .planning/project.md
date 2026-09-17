# Project

Task: task1
Target: backend

## Idea

The frontend and backend were built by separate teams and have drifted out of sync on two points: (1) the frontend now sends hyphenated sort parameter values (`price-asc`, `price-desc`, `rating-desc`) but the backend's query parser only recognises camelCase equivalents and silently drops everything else, so sorting is broken; and (2) the backend response envelope uses the field names `count` and `pages` but the frontend expects `total` and `totalPages`. Both mismatches must be fixed without touching auth, the Product data shape, or any test files.

## Spec pointers

- `src/benchmark-backend/instructions/TASK1.md`: full task description — two mismatches to fix, technical constraints, expected files, and success criteria

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/utils/queryParser.ts`: must map incoming hyphenated sort strings (`price-asc`, `price-desc`, `rating-desc`) to the internal `InternalSort` type used throughout the service layer
- `src/benchmark-backend/src/services/productService.ts`: must rename response envelope fields `count` → `total` and `pages` → `totalPages`; already handles `ratingDesc` sort internally so no sort logic change needed here beyond the rename triggered by the parser fix
