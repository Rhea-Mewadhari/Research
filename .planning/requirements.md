# Requirements

1. `GET /products?sort=price-asc` returns HTTP 200 with all products sorted by price ascending (lowest first).
   - Verified by: `products.test.ts` → "sorts by price ascending (frontend format)" — asserts `prices` array equals `[...prices].sort((a, b) => a - b)`.

2. `GET /products?sort=price-desc` returns HTTP 200 with all products sorted by price descending (highest first).
   - Verified by: `products.test.ts` → "sorts by price descending (frontend format)" — asserts `prices` array equals `[...prices].sort((a, b) => b - a)`.

3. `GET /products?sort=rating-desc` returns HTTP 200 with all products sorted by rating descending (highest first).
   - Verified by: `products.test.ts` → "sorts by rating descending (frontend format)" — asserts `ratings` array equals `[...ratings].sort((a, b) => b - a)`.

4. The response envelope for any `GET /products` request must contain the field `total` (integer count of all matching products before pagination) and `totalPages` (integer count of pages at the requested limit). The fields `count` and `pages` must not appear in place of these.
   - Verified by: `products.test.ts` → "response envelope contains total and totalPages" — asserts `res.body.total === 15` and `res.body.totalPages === 3` for `?page=1&limit=5`; also "returns all products with pagination envelope" asserts `res.body.total === 15`.

5. The response envelope retains the unchanged fields `data`, `page`, and `limit` at their correct values.
   - Verified by: `products.test.ts` → "returns correct envelope shape for first page" — asserts `res.body.data.length === 5`, `res.body.page === 1`, `res.body.limit === 5`.

6. All existing filters continue to work unchanged: `category` filter returns only products matching that category; `inStock=true` returns only in-stock products; `search` returns only products whose name contains the search term (case-insensitive); unknown category or search with no matches returns an empty `data` array.
   - Verified by: `products.test.ts` → "filters by category" (4 electronics), "returns empty array for unknown category", "filters in-stock products" (11 items), "filters by search term" (laptop), "returns empty data array when search matches nothing".

7. Pagination continues to work: page 2 returns a different set of products from page 1; `limit` is clamped to a maximum of 50.
   - Verified by: `products.test.ts` → "returns a different set of products for page 2", "clamps limit to a maximum of 50".

8. Auth middleware behaviour is unchanged: requests without a valid `Authorization: Bearer <token>` header are rejected with HTTP 401 `{"error":"Unauthorized"}`; the `/health` route remains unauthenticated.
   - Verified by: `products.test.ts` → "returns 401 without auth header", "rejects a token whose digits sum to an odd number", "accepts any token whose digits sum to an even number", "rejects a request with no Bearer prefix", "does not apply auth to the /health route". (No changes to `src/middleware/auth.ts` are permitted.)

9. The `Product` data shape (fields on each item in `data`) is unchanged.
   - Verified by: `products.test.ts` — all tests that access `p.price`, `p.rating`, `p.category`, `p.inStock`, `p.name` must continue to pass without type errors; `pnpm --filter benchmark-backend tsc --noEmit` produces no errors.

10. Changes are confined to `src/utils/queryParser.ts` and `src/services/productService.ts`. No test files are modified.
    - Verified by: `git diff --name-only` after the fix lists only those two files (excluding test files under `src/tests/`).

---

## Edge cases

- Unrecognised sort value (e.g. `sort=unknown`): silently ignored; no sort applied; covered by requirement 6 (existing behaviour preserved — filter/sort orthogonality unchanged).
- camelCase sort values previously accepted (`priceAsc`, `priceDesc`, `ratingDesc`): the spec requires the fix to accept the hyphenated format; camelCase was the internal representation and the task explicitly targets the frontend's hyphenated format. Backward-compatibility means hyphenated values must work; there are no visible tests that assert camelCase values still work, so the implementation may drop camelCase acceptance as long as all visible tests pass. Covered by requirements 1–3.
- `sort=price-asc` with simultaneous filters: sort and filter are independent operations; covered by requirement 6 (filters tested independently) and requirements 1–3 (sort tested with full product set at `limit=50`).
- `totalPages` calculation when total is exactly divisible by limit (e.g. 15 products / 5 limit = 3 pages, no remainder): covered by requirement 4 (`totalPages === 3`).
- `total` reflects filtered count vs. total catalogue count: the visible tests assert `total === 15` against an unfiltered request with `limit=50`, confirming `total` is the filtered result count; covered by requirement 4.
