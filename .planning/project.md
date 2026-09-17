# Project

Task: task1
Target: backend

## Idea

The frontend and backend were developed by separate teams and have accumulated two contract mismatches on the `GET /products` endpoint. First, the frontend now sends hyphenated sort values (`price-asc`, `price-desc`, `rating-desc`) but the backend only recognises camelCase ones (`priceAsc`, `priceDesc`, `ratingDesc`), so all sort requests from the frontend are silently dropped. Second, the backend response envelope uses the field names `count` and `pages`, but the frontend expects `total` and `totalPages`. The task is to fix both mismatches in two files without touching auth, data shape, or existing filters.

## Spec pointers

- `src/benchmark-backend/instructions/TASK1.md`: full task definition — objective, context, the two mismatches to fix, technical constraints, expected files to modify, and success criteria

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/utils/queryParser.ts`: currently rejects hyphenated sort values; needs a mapping from `price-asc` → `priceAsc`, `price-desc` → `priceDesc`, `rating-desc` → `ratingDesc` before the validity check
- `src/benchmark-backend/src/services/productService.ts`: response envelope returns `{ data, count, page, limit, pages }` — must become `{ data, total, page, limit, totalPages }`; also the `ratingDesc` sort branch must be verified to work correctly (it already exists in the code, but needs to be reachable after the parser fix)
- `src/benchmark-backend/src/tests/visible/products.test.ts`: visible tests — must all pass after changes (read-only, do not modify)
