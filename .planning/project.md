# Project

Task: task1
Target: backend

## Idea

The frontend and backend were developed independently and now have two contract mismatches on the `GET /products` endpoint. First, the frontend sends hyphenated sort values (`price-asc`, `price-desc`, `rating-desc`) but the backend only recognises camelCase variants (`priceAsc`, `priceDesc`, `ratingDesc`) and silently drops unknown values — so all frontend sort requests are ignored. Second, the backend response envelope uses the field names `count` and `pages` whereas the frontend expects `total` and `totalPages`. Both mismatches must be fixed with minimal, targeted changes to the query parser and service layer, without touching auth, the Product shape, or any test files.

## Spec pointers

- `src/benchmark-backend/instructions/TASK1.md`: full task description — mismatches to fix, technical constraints, expected files to modify, and success criteria

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/utils/queryParser.ts`: needs to accept hyphenated sort values from the frontend and map them to the internal sort representation
- `src/benchmark-backend/src/services/productService.ts`: needs to rename `count` → `total` and `pages` → `totalPages` in the response envelope, and ensure `rating-desc` sorting is implemented correctly
- `src/benchmark-backend/src/tests/visible/products.test.ts`: visible tests — read-only, used to verify success criteria
- `src/benchmark-backend/src/types/product.ts`: may define response envelope types that need updating
- `src/benchmark-backend/src/controllers/productController.ts`: passes parsed query to the service; may need review if sort normalisation happens here instead of the parser
