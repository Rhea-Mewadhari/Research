# Requirements

The mock data fixture (`MOCK_PRODUCTS`) contains 15 products across five categories:
electronics (4), clothing (3), furniture (3), sports (3), books (2).
In-stock count: 11 true, 4 false.
Valid auth token for all requests: `Bearer benchmark-token-2024` (digits 2+0+2+4=8, even).

---

## Filtering

1. `GET /products?category=electronics` with valid auth returns HTTP 200, `body.total === 4`, and every item in `body.data` has `category === 'electronics'`.
   - Verified by: test asserting `res.status === 200`, `res.body.total === 4`, and `res.body.data.every(p => p.category === 'electronics')`

2. `GET /products?category=ELECTRONICS` with valid auth returns HTTP 200, `body.total === 4` (case-insensitive match).
   - Verified by: test asserting `res.status === 200` and `res.body.total === 4`

3. `GET /products?inStock=true` with valid auth returns HTTP 200, `body.total === 11`, and every item in `body.data` has `inStock === true`.
   - Verified by: test asserting `res.status === 200`, `res.body.total === 11`, and `res.body.data.every(p => p.inStock === true)`

4. `GET /products?inStock=false` with valid auth returns HTTP 200, `body.total === 4`, and every item in `body.data` has `inStock === false`.
   - Verified by: test asserting `res.status === 200`, `res.body.total === 4`, and `res.body.data.every(p => p.inStock === false)`

5. `GET /products?category=nonexistent` with valid auth returns HTTP 200, `body.data` is `[]`, and `body.total === 0`.
   - Verified by: test asserting `res.status === 200`, `res.body.data` deep-equals `[]`, and `res.body.total === 0`

---

## Search

6. `GET /products?search=LAPTOP` with valid auth returns HTTP 200, `body.data` has exactly 1 item, and `body.data[0].name === 'Laptop'` (case-insensitive).
   - Verified by: test asserting `res.body.data.length === 1` and `res.body.data[0].name === 'Laptop'`

7. `GET /products?search=phone` with valid auth returns HTTP 200, `body.data` has exactly 1 item, and `body.data[0].name === 'Smartphone'` (partial match).
   - Verified by: test asserting `res.body.data.length === 1` and `res.body.data[0].name === 'Smartphone'`

8. `GET /products?search=%20shirt%20` (URL-encoded leading+trailing space) with valid auth returns HTTP 200, `body.data` has exactly 1 item, and `body.data[0].name === 'Linen Shirt'` (whitespace trimmed before matching).
   - Verified by: test asserting `res.body.data.length === 1` and `res.body.data[0].name === 'Linen Shirt'`

---

## Sorting

9. `GET /products?sort=price_asc&limit=50` with valid auth returns HTTP 200, `body.data[0].name === 'Jump Rope'` (price 19, cheapest), and `body.data[14].name === 'Laptop'` (price 999, most expensive).
   - Verified by: test asserting `res.body.data[0].name === 'Jump Rope'` and `res.body.data[14].name === 'Laptop'`

10. `GET /products?sort=price_desc&limit=50` with valid auth returns HTTP 200, `body.data[0].name === 'Laptop'` (price 999, most expensive), and `body.data[14].name === 'Jump Rope'` (price 19, cheapest).
    - Verified by: test asserting `res.body.data[0].name === 'Laptop'` and `res.body.data[14].name === 'Jump Rope'`

11. `GET /products?sort=name_asc&limit=50` with valid auth returns HTTP 200, `body.data[0].name === 'Bookshelf'` (first alphabetically) and `body.data[14].name === 'Yoga Mat'` (last alphabetically).
    - Verified by: test asserting `res.body.data[0].name === 'Bookshelf'` and `res.body.data[14].name === 'Yoga Mat'`

12. `GET /products?sort=name_desc&limit=50` with valid auth returns HTTP 200, `body.data[0].name === 'Yoga Mat'` (last alphabetically, first in reverse) and `body.data[14].name === 'Bookshelf'` (first alphabetically, last in reverse).
    - Verified by: test asserting `res.body.data[0].name === 'Yoga Mat'` and `res.body.data[14].name === 'Bookshelf'`

---

## Pagination

13. `GET /products` with valid auth (defaults: page=1, limit=10) returns HTTP 200 with a response body containing exactly the keys `data`, `total`, `page`, `limit`, `totalPages` with values: `total === 15`, `page === 1`, `limit === 10`, `totalPages === 2`, and `data.length === 10`.
    - Verified by: test asserting each of those six field values on `res.body`

14. `GET /products?page=2` with valid auth returns HTTP 200, `body.page === 2`, `body.data.length === 5`, and none of the returned product `id` values appear in the page=1 response.
    - Verified by: test that fetches both pages and asserts no overlap by comparing `id` sets

15. `GET /products?limit=100` with valid auth returns HTTP 200, `body.limit === 50` (clamped), `body.data.length === 15` (all products), and `body.totalPages === 1`.
    - Verified by: test asserting `res.body.limit === 50`, `res.body.data.length === 15`, and `res.body.totalPages === 1`

---

## Combined Filters

16. `GET /products?category=electronics&inStock=true` with valid auth returns HTTP 200, `body.total === 3`, and every item in `body.data` has `category === 'electronics'` and `inStock === true` (Laptop, Smartphone, Mechanical Keyboard).
    - Verified by: test asserting `res.body.total === 3` and both field predicates on every item in `res.body.data`

17. `GET /products?category=clothing&sort=price_asc` with valid auth returns HTTP 200, `body.total === 3`, and `body.data` is ordered Linen Shirt (49), Running Shoes (119), Winter Jacket (189).
    - Verified by: test asserting `res.body.data.map(p => p.name)` deep-equals `['Linen Shirt', 'Running Shoes', 'Winter Jacket']`

---

## Authentication

18. `GET /products` with no `Authorization` header returns HTTP 401 with body `{ error: 'Unauthorized' }`.
    - Verified by: test asserting `res.status === 401` and `res.body.error === 'Unauthorized'`

19. `GET /products` with `Authorization: Bearer bad-token-1` (digit sum = 1, odd) returns HTTP 401 with body `{ error: 'Unauthorized' }`.
    - Verified by: test asserting `res.status === 401` and `res.body.error === 'Unauthorized'`

20. `GET /products` with `Authorization: Bearer benchmark-token-2024` (digit sum = 8, even) returns HTTP 200.
    - Verified by: test asserting `res.status === 200`

21. `GET /health` with no `Authorization` header returns HTTP 200 with body `{ status: 'ok' }`.
    - Verified by: test asserting `res.status === 200` and `res.body.status === 'ok'`

---

## Edge Cases

- Category filter is case-insensitive: covered by requirements 1 and 2
- Unknown/nonexistent category returns empty result: covered by requirement 5
- Search is case-insensitive: covered by requirement 6
- Search matches partial substrings: covered by requirement 7
- Search trims leading and trailing whitespace: covered by requirement 8
- Pagination `limit` above the maximum of 50 is clamped to 50: covered by requirement 15
- Page 2 with 15 total and limit 10 returns exactly 5 items: covered by requirement 14
- Multiple query params compose correctly: covered by requirements 16 and 17
- Bearer token with odd digit sum is rejected identically to missing header: covered by requirements 18 and 19
- `/health` is exempt from auth middleware: covered by requirement 21
