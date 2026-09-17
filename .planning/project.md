# Project

Task: task1
Target: backend

## Idea

The frontend and backend were developed independently and now have contract mismatches on the `GET /products` endpoint. The frontend sends hyphenated sort values (`price-asc`, `price-desc`, `rating-desc`) but the backend only recognises camelCase variants (`priceAsc`, `priceDesc`, `ratingDesc`), so sort requests are silently dropped. The backend also returns `count` and `pages` in the response envelope, but the frontend expects `total` and `totalPages`. The fix involves updating the query parser to accept hyphenated sort strings and updating the product service to use the correct envelope field names and handle `rating-desc` sorting.

## Spec pointers

- `src/benchmark-backend/instructions/TASK1.md`: Full task description — two mismatches to fix: (1) sort parameter format, (2) response envelope field names `count`→`total` and `pages`→`totalPages`

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/utils/queryParser.ts`: Needs to accept hyphenated sort values (`price-asc`, `price-desc`, `rating-desc`) in addition to or instead of camelCase
- `src/benchmark-backend/src/services/productService.ts`: Needs to return `total` and `totalPages` instead of `count` and `pages`; must also ensure `rating-desc` sort is handled correctly
- `src/benchmark-backend/src/tests/visible/`: Visible test files that must pass (read-only)
