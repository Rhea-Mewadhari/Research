# Requirements

Derived from `TASK3.md`, the product fixture (`src/data/products.ts` — 15 products),
and the implementation (`productService.ts`, `queryParser.ts`, `auth.ts`, `app.ts`).

The **only file to modify** is `src/benchmark-backend/src/tests/visible/products.test.ts`.
No application source files may be changed.

All tests use `Authorization: 'Bearer benchmark-token-2024'` as the valid auth token
(digits 2+0+2+4 = 8, even). The mock `fetchAllProducts` is set up in `beforeAll` to
return all 15 products from the fixture.

Verification method for every requirement: `pnpm --filter benchmark-backend vitest run`
exits 0, meaning all tests in the file pass.

---

## 1. Authentication — missing Authorization header returns 401

A `GET /products` request with **no** `Authorization` header returns HTTP 401 with a
JSON body of `{ "error": "Unauthorized" }`.

- Verified by: a test inside `describe('Auth middleware')` that calls
  `request(app).get('/products')` with no headers, then asserts
  `res.status === 401` and `res.body.error === 'Unauthorized'`.

## 2. Authentication — invalid token (odd digit sum) returns 401

A `GET /products` request with `Authorization: Bearer benchmark-token-2025`
(digits 2+0+2+5 = 9, odd) returns HTTP 401 with body `{ "error": "Unauthorized" }`.

- Verified by: a test inside `describe('Auth middleware')` that sends that specific
  header, then asserts `res.status === 401` and `res.body.error === 'Unauthorized'`.

## 3. Authentication — valid token (even digit sum) returns 200

A `GET /products` request with `Authorization: Bearer benchmark-token-2024`
(digits 2+0+2+4 = 8, even) returns HTTP 200.

- Verified by: a test inside `describe('Auth middleware')` that sends that header and
  asserts `res.status === 200`.

## 4. Authentication — GET /health is exempt from auth

A `GET /health` request with **no** `Authorization` header returns HTTP 200.

- Verified by: a test inside `describe('Auth middleware')` that calls
  `request(app).get('/health')` with no headers and asserts `res.status === 200`.

## 5. Filtering — category exact match (case-insensitive, lowercase input)

`GET /products?category=electronics` (with valid auth) returns `total: 4` and a
`data` array whose every element has `category === 'electronics'`. The 4 products
are Laptop, Smartphone, Wireless Headphones, and Mechanical Keyboard.

- Verified by: a test inside `describe('GET /products')` that asserts
  `res.body.total === 4` and `res.body.data.every(p => p.category === 'electronics')`.

## 6. Filtering — category match is case-insensitive (uppercase input)

`GET /products?category=ELECTRONICS` returns the same 4 electronics products as
requirement 5 (`total: 4`, all with `category === 'electronics'`).

- Verified by: a test inside `describe('GET /products')` that asserts
  `res.body.total === 4` and all items have `category === 'electronics'`.

## 7. Filtering — unknown category returns empty data array

`GET /products?category=nonexistent` returns HTTP 200 with `data: []` and `total: 0`.

- Verified by: a test inside `describe('GET /products')` that asserts
  `res.body.data.length === 0` and `res.body.total === 0`.

## 8. Filtering — inStock=true returns only in-stock products

`GET /products?inStock=true` returns `total: 11` and a `data` array where every
element has `inStock === true`. (The 11 in-stock products from the fixture are:
Laptop, Smartphone, Mechanical Keyboard, Linen Shirt, Running Shoes, Ergonomic Chair,
Bookshelf, Yoga Mat, Resistance Bands, Clean Code, The Pragmatic Programmer.)

- Verified by: a test inside `describe('GET /products')` that asserts
  `res.body.total === 11` and `res.body.data.every(p => p.inStock === true)`.

## 9. Filtering — inStock=false returns only out-of-stock products

`GET /products?inStock=false` returns `total: 4` and a `data` array where every
element has `inStock === false`. (The 4 out-of-stock products are: Wireless
Headphones, Winter Jacket, Standing Desk, Jump Rope.)

- Verified by: a test inside `describe('GET /products')` that asserts
  `res.body.total === 4` and `res.body.data.every(p => p.inStock === false)`.

## 10. Search — case-insensitive name matching

`GET /products?search=LAPTOP` returns `total: 1` and `data[0].name === 'Laptop'`.

- Verified by: a test inside `describe('GET /products')` that asserts
  `res.body.total === 1` and `res.body.data[0].name === 'Laptop'`.

## 11. Search — partial name matching

`GET /products?search=phone` returns `total: 1` and `data[0].name === 'Smartphone'`
(the word "phone" appears inside "Smartphone").

- Verified by: a test inside `describe('GET /products')` that asserts
  `res.body.total === 1` and `res.body.data[0].name === 'Smartphone'`.

## 12. Search — leading and trailing whitespace is trimmed

`GET /products?search=%20laptop%20` (URL-encoded spaces around "laptop") returns
`total: 1` and `data[0].name === 'Laptop'` — the same result as a trimmed search.

- Verified by: a test inside `describe('GET /products')` that sends `search: ' laptop '`
  and asserts `res.body.total === 1` and `res.body.data[0].name === 'Laptop'`.

## 13. Sorting — price_asc orders products cheapest first

`GET /products?sort=price_asc` returns data where consecutive elements satisfy
`data[i].price <= data[i+1].price`. Concretely, `data[0].price === 19` (Jump Rope)
and `data[1].price === 24` (Resistance Bands).

- Verified by: a test inside `describe('GET /products')` that asserts `res.body.data[0].price === 19`
  and that all adjacent pairs in the array are non-decreasing by price.

## 14. Sorting — price_desc orders products most expensive first

`GET /products?sort=price_desc` returns `data[0].price === 999` (Laptop) and
`data[1].price === 699` (Smartphone), with each subsequent element having a
price ≤ the previous.

- Verified by: a test inside `describe('GET /products')` that asserts `res.body.data[0].price === 999`
  and that all adjacent pairs in the array are non-increasing by price.

## 15. Sorting — name_asc orders products alphabetically

`GET /products?sort=name_asc` returns `data[0].name === 'Bookshelf'` (first
alphabetically among the 15 product names).

- Verified by: a test inside `describe('GET /products')` that asserts
  `res.body.data[0].name === 'Bookshelf'` and that adjacent names satisfy
  `data[i].name.localeCompare(data[i+1].name) <= 0`.

## 16. Sorting — name_desc orders products reverse-alphabetically

`GET /products?sort=name_desc` returns `data[0].name === 'Yoga Mat'` (last
alphabetically among the 15 product names).

- Verified by: a test inside `describe('GET /products')` that asserts
  `res.body.data[0].name === 'Yoga Mat'` and that adjacent names satisfy
  `data[i].name.localeCompare(data[i+1].name) >= 0`.

## 17. Pagination — default response envelope has correct shape and values

`GET /products` (with valid auth, no extra params) returns HTTP 200 with a body
containing all five envelope fields: `data` (array of 10 items), `total: 15`,
`page: 1`, `limit: 10`, `totalPages: 2`.

- Verified by: a test inside `describe('Pagination')` that asserts
  `res.body.data.length === 10`, `res.body.total === 15`, `res.body.page === 1`,
  `res.body.limit === 10`, `res.body.totalPages === 2`.

## 18. Pagination — page 2 returns the second slice of products

`GET /products?page=2&limit=10` returns HTTP 200 with `data` of 5 items,
`page: 2`, `total: 15`, `limit: 10`, `totalPages: 2`. None of the product ids in
page 2 appear in the page 1 response.

- Verified by: a test inside `describe('Pagination')` that asserts
  `res.body.data.length === 5`, `res.body.page === 2`, and confirms that the
  `id` values from page 2 do not overlap with those from page 1 (e.g. by checking
  that `res.body.data[0].id` is not present in the page-1 `data` array).

## 19. Pagination — limit is clamped to a maximum of 50

`GET /products?limit=100` returns HTTP 200 with `limit: 50` in the response body
(clamped from 100), `data` containing all 15 products (since 15 < 50), and
`totalPages: 1`.

- Verified by: a test inside `describe('Pagination')` that asserts
  `res.body.limit === 50`, `res.body.data.length === 15`, and `res.body.totalPages === 1`.

## 20. Combined filters — category and inStock applied together

`GET /products?category=electronics&inStock=true` returns `total: 3` and a `data`
array where every element has `category === 'electronics'` and `inStock === true`.
(The 3 matching products are Laptop, Smartphone, and Mechanical Keyboard; Wireless
Headphones is electronics but out of stock.)

- Verified by: a test inside `describe('GET /products')` that asserts
  `res.body.total === 3`, all items have `category === 'electronics'`, and all items
  have `inStock === true`.

---

## Edge cases

- **Authorization header present but no "Bearer " prefix** (e.g. `Token abc`): token
  is `null` in auth middleware → same 401 behaviour as requirement 1. Covered by
  requirements 1–2 (the invalid-token branch handles null token identically).
- **`?inStock=` with unrecognised value** (e.g. `?inStock=maybe`): queryParser ignores
  it, so no inStock filter is applied and all 15 products are returned. Covered by
  the default pagination test (requirement 17) which exercises the no-filter path.
- **`?sort=` with an unrecognised value** (e.g. `?sort=random`): queryParser ignores
  it, no sort is applied, original fixture order is preserved. Covered by requirement
  17 (default request returns all 15 in fixture order).
- **Page beyond the last page** (e.g. `?page=99`): returns `data: []`, `total: 15`,
  `page: 99`, `totalPages: 2`. Covered by requirement 18 (confirms paging logic slices
  correctly; an empty-page assertion is an acceptable extension).
- **Whitespace-only search** (`?search=%20%20`): trimmed to `""`, which means the
  search condition is `term = ""` — every product name includes `""`, so all 15 are
  returned. This is implicitly covered by requirement 17 (the 15-product baseline).
