# Requirements

All tests are written inside the three existing `describe` blocks in
`src/benchmark-backend/src/tests/visible/products.test.ts`. No application source files
may be modified. Every request uses `Authorization: Bearer benchmark-token-2024` (digit
sum 8, even, valid) unless the test is specifically exercising authentication.

## Fixture reference (derived from `src/data/products.ts`, 15 products total)

| Category    | Count | inStock:true | inStock:false |
|-------------|-------|--------------|---------------|
| electronics | 4     | 3 (Laptop 999, Smartphone 699, Mechanical Keyboard 89) | 1 (Wireless Headphones 149) |
| clothing    | 3     | 2 (Linen Shirt 49, Running Shoes 119) | 1 (Winter Jacket 189) |
| furniture   | 3     | 2 (Ergonomic Chair 549, Bookshelf 149) | 1 (Standing Desk 399) |
| sports      | 3     | 2 (Yoga Mat 39, Resistance Bands 24) | 1 (Jump Rope 19) |
| books       | 2     | 2 (Clean Code 35, The Pragmatic Programmer 42) | 0 |

---

## Filtering

1. `GET /products?category=electronics` returns `total: 4` and a `data` array of exactly
   4 items all with `category: "electronics"`.
   - Verified by: test in `describe('GET /products')` asserting `res.status === 200`,
     `res.body.total === 4`, `res.body.data.length === 4`, and every element of
     `res.body.data` has `category === 'electronics'`.

2. `GET /products?category=ELECTRONICS` (upper-case) returns the same 4 electronics
   items as requirement 1 (category filter is case-insensitive).
   - Verified by: test asserting `res.body.total === 4` and
     `res.body.data.every(p => p.category === 'electronics')`.

3. `GET /products?inStock=true` returns `total: 11` and a `data` array where every
   element has `inStock: true`.
   - Verified by: test asserting `res.body.total === 11` and
     `res.body.data.every(p => p.inStock === true)`.

4. `GET /products?inStock=false` returns `total: 4` and a `data` array where every
   element has `inStock: false`.
   - Verified by: test asserting `res.body.total === 4` and
     `res.body.data.every(p => p.inStock === false)`.

5. `GET /products?category=nonexistent` returns `total: 0` and `data: []`.
   - Verified by: test asserting `res.body.total === 0` and
     `res.body.data.length === 0`.

---

## Search

6. `GET /products?search=LAPTOP` (upper-case) returns at least one result whose `name`
   is `"Laptop"` (`total: 1`, case-insensitive match).
   - Verified by: test asserting `res.body.total === 1` and
     `res.body.data[0].name === 'Laptop'`.

7. `GET /products?search=phone` (partial match) returns exactly 1 result with
   `name: "Smartphone"` (`total: 1`).
   - Verified by: test asserting `res.body.total === 1` and
     `res.body.data[0].name === 'Smartphone'`.

8. `GET /products?search=%20laptop%20` (URL-encoded leading/trailing spaces, i.e.
   `" laptop "`) returns the same single result as `search=laptop` (`total: 1`,
   `data[0].name === 'Laptop'`), confirming whitespace trimming.
   - Verified by: test asserting `res.body.total === 1` and
     `res.body.data[0].name === 'Laptop'`.

---

## Sorting

9. `GET /products?sort=price_asc` returns `data[0].price === 19` (Jump Rope, cheapest
   product) with default limit of 10.
   - Verified by: test asserting `res.body.data[0].name === 'Jump Rope'` and
     `res.body.data[0].price === 19`.

10. `GET /products?sort=price_desc` returns `data[0].price === 999` (Laptop, most
    expensive product).
    - Verified by: test asserting `res.body.data[0].name === 'Laptop'` and
      `res.body.data[0].price === 999`.

11. `GET /products?sort=name_asc` returns `data[0].name === 'Bookshelf'` (first
    alphabetically among all 15 products).
    - Verified by: test asserting `res.body.data[0].name === 'Bookshelf'`.

12. `GET /products?sort=name_desc` returns `data[0].name === 'Yoga Mat'` (last
    alphabetically among all 15 products).
    - Verified by: test asserting `res.body.data[0].name === 'Yoga Mat'`.

---

## Pagination

13. `GET /products` (no query params) returns a response body with all five envelope
    fields present and correct: `data` is an array of 10 items, `total === 15`,
    `page === 1`, `limit === 10`, `totalPages === 2`.
    - Verified by: test in `describe('Pagination')` asserting each of the five fields
      against these exact values.

14. `GET /products?page=2` returns `data` with 5 items (products 11–15), `page === 2`,
    and no product IDs shared with the page=1 response.
    - Verified by: test asserting `res.body.data.length === 5` and
      `res.body.page === 2`, and that none of the IDs in `res.body.data` appear in
      the page=1 `data`.

15. `GET /products?limit=100` returns `limit === 50` in the response envelope (clamped
    to maximum), and `data.length === 15` (all 15 products fit within 50).
    - Verified by: test asserting `res.body.limit === 50` and
      `res.body.data.length === 15`.

---

## Combined filters

16. `GET /products?category=electronics&inStock=true` returns `total: 3` (Laptop,
    Smartphone, Mechanical Keyboard) with every item having `category: "electronics"`
    and `inStock: true`.
    - Verified by: test in `describe('GET /products')` asserting `res.body.total === 3`
      and `res.body.data.every(p => p.category === 'electronics' && p.inStock === true)`.

---

## Authentication

17. `GET /products` with no `Authorization` header returns HTTP 401 and a JSON body
    `{ "error": "Unauthorized" }`.
    - Verified by: test in `describe('Auth middleware')` asserting `res.status === 401`
      and `res.body.error === 'Unauthorized'`.

18. `GET /products` with `Authorization: Bearer odd-token-1` (digit sum = 1, odd)
    returns HTTP 401 and a JSON body `{ "error": "Unauthorized" }`.
    - Verified by: test asserting `res.status === 401` and
      `res.body.error === 'Unauthorized'`.

19. `GET /products` with `Authorization: Bearer benchmark-token-2024` (digit sum
    2+0+2+4 = 8, even) returns HTTP 200.
    - Verified by: test asserting `res.status === 200`.

20. `GET /health` with no `Authorization` header returns HTTP 200 and JSON body
    `{ "status": "ok" }` (the `/health` route has no auth middleware).
    - Verified by: test asserting `res.status === 200` and
      `res.body.status === 'ok'`.

---

## Edge cases

- Unknown category string: covered by requirement 5.
- Odd-digit-sum token rejected: covered by requirement 18.
- Category match is case-insensitive: covered by requirement 2.
- Search with surrounding whitespace: covered by requirement 8.
- `limit` query param above 50 clamped: covered by requirement 15.
- Page 2 with fewer items than limit: covered by requirement 14.
- Multiple query params composed: covered by requirement 16.
- `/health` route exempt from auth: covered by requirement 20.
