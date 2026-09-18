# Requirements

All requirements target `src/benchmark-backend/src/tests/visible/products.test.ts`.
All verified by: running `pnpm --filter benchmark-backend test` and confirming all tests pass.
MOCK_PRODUCTS is 15 products across categories: electronics (4), clothing (3), furniture (3), sports (3), books (2).
The valid auth token throughout is `Bearer benchmark-token-2024` (digit sum 2+0+2+4=8, even).

---

## Filtering

1. `GET /products?category=electronics` with valid auth returns HTTP 200, `res.body.total === 4`, `res.body.data` has length 4, and every item in `res.body.data` has `category === 'electronics'`.
   - Verified by: test that asserts `expect(res.body.total).toBe(4)` and `res.body.data.every((p) => p.category === 'electronics')` to be true.

2. `GET /products?category=ELECTRONICS` (uppercase) with valid auth returns HTTP 200, `res.body.total === 4` — identical result to requirement 1.
   - Verified by: test that asserts `expect(res.body.total).toBe(4)`.

3. `GET /products?inStock=true` with valid auth returns HTTP 200, `res.body.total === 11`, and every item in `res.body.data` has `inStock === true`.
   - Verified by: test that asserts `expect(res.body.total).toBe(11)` and `res.body.data.every((p) => p.inStock === true)`.

4. `GET /products?inStock=false` with valid auth returns HTTP 200, `res.body.total === 4`, and every item in `res.body.data` has `inStock === false`.
   - Verified by: test that asserts `expect(res.body.total).toBe(4)` and `res.body.data.every((p) => p.inStock === false)`.

5. `GET /products?category=unknowncategory` with valid auth returns HTTP 200, `res.body.data` is an empty array, and `res.body.total === 0`.
   - Verified by: test that asserts `expect(res.body.total).toBe(0)` and `expect(res.body.data).toEqual([])`.

---

## Search

6. `GET /products?search=LAPTOP` with valid auth returns HTTP 200, `res.body.total === 1`, and `res.body.data[0].name === 'Laptop'` (case-insensitive matching).
   - Verified by: test that asserts `expect(res.body.total).toBe(1)` and `expect(res.body.data[0].name).toBe('Laptop')`.

7. `GET /products?search=lap` with valid auth returns HTTP 200, `res.body.total === 1`, and `res.body.data[0].name === 'Laptop'` (partial name matching).
   - Verified by: test that asserts `expect(res.body.total).toBe(1)` and `expect(res.body.data[0].name).toBe('Laptop')`.

8. `GET /products?search=%20Laptop%20` (URL-encoded leading and trailing spaces) with valid auth returns HTTP 200, `res.body.total === 1`, and `res.body.data[0].name === 'Laptop'` (whitespace trimmed before matching).
   - Verified by: test that asserts `expect(res.body.total).toBe(1)` and `expect(res.body.data[0].name).toBe('Laptop')`.

---

## Sorting

9. `GET /products?sort=price_asc&limit=15` with valid auth returns HTTP 200 and `res.body.data[0].price === 19` (Jump Rope, cheapest product).
   - Verified by: test that asserts `expect(res.body.data[0].price).toBe(19)`.

10. `GET /products?sort=price_desc&limit=15` with valid auth returns HTTP 200 and `res.body.data[0].price === 999` (Laptop, most expensive product).
    - Verified by: test that asserts `expect(res.body.data[0].price).toBe(999)`.

11. `GET /products?sort=name_asc&limit=15` with valid auth returns HTTP 200 and `res.body.data[0].name === 'Bookshelf'` (alphabetically first product name).
    - Verified by: test that asserts `expect(res.body.data[0].name).toBe('Bookshelf')`.

12. `GET /products?sort=name_desc&limit=15` with valid auth returns HTTP 200 and `res.body.data[0].name === 'Yoga Mat'` (alphabetically last product name).
    - Verified by: test that asserts `expect(res.body.data[0].name).toBe('Yoga Mat')`.

---

## Pagination

13. `GET /products` (no params) with valid auth returns HTTP 200 with envelope shape: `res.body` contains exactly the keys `data` (array), `total` (number), `page` (number), `limit` (number), `totalPages` (number). Default values: `page === 1`, `limit === 10`, `total === 15`, `totalPages === 2`, `data.length === 10`.
    - Verified by: test that asserts each envelope key's presence and default value explicitly.

14. `GET /products?page=2&limit=10` with valid auth returns HTTP 200, `res.body.page === 2`, `res.body.data.length === 5` (remaining 5 of 15 products), and `res.body.data[0].id !== 1` (page 2 does not contain page 1's first product, Laptop, id=1).
    - Verified by: test that asserts `expect(res.body.page).toBe(2)`, `expect(res.body.data.length).toBe(5)`, and `expect(res.body.data[0].id).not.toBe(1)`.

15. `GET /products?limit=100` with valid auth returns HTTP 200 and `res.body.limit === 50` (limit clamped to maximum of 50).
    - Verified by: test that asserts `expect(res.body.limit).toBe(50)`.

---

## Combined Filters

16. `GET /products?category=electronics&inStock=true` with valid auth returns HTTP 200, `res.body.total === 3` (Laptop, Smartphone, Mechanical Keyboard — the three in-stock electronics), and every item in `res.body.data` has `category === 'electronics'` and `inStock === true`.
    - Verified by: test that asserts `expect(res.body.total).toBe(3)` and each data item's `category` and `inStock` fields.

17. `GET /products?category=sports&sort=price_asc` with valid auth returns HTTP 200, `res.body.total === 3`, and `res.body.data[0].name === 'Jump Rope'` (cheapest sports product at $19).
    - Verified by: test that asserts `expect(res.body.total).toBe(3)` and `expect(res.body.data[0].name).toBe('Jump Rope')`.

---

## Authentication

18. `GET /products` with no `Authorization` header returns HTTP 401 with body `{ error: 'Unauthorized' }`.
    - Verified by: test that asserts `expect(res.status).toBe(401)` and `expect(res.body.error).toBe('Unauthorized')`.

19. `GET /products` with `Authorization: Bearer benchmark-token-2025` (digit sum 2+0+2+5=9, odd — invalid token) returns HTTP 401 with body `{ error: 'Unauthorized' }`.
    - Verified by: test that asserts `expect(res.status).toBe(401)` and `expect(res.body.error).toBe('Unauthorized')`.

20. `GET /products` with `Authorization: Bearer benchmark-token-2024` (digit sum 2+0+2+4=8, even — valid token) returns HTTP 200.
    - Verified by: test that asserts `expect(res.status).toBe(200)`.

21. `GET /health` with no `Authorization` header returns HTTP 200 (health endpoint is exempt from auth middleware).
    - Verified by: test that asserts `expect(res.status).toBe(200)`.

---

## Edge Cases

- Case-insensitive category match (`ELECTRONICS` → electronics): covered by requirement 2.
- Unknown category yields empty result, not 404: covered by requirement 5.
- Search whitespace trimming (` Laptop ` → `Laptop`): covered by requirement 8.
- Limit exceeding maximum (100 → clamped to 50): covered by requirement 15.
- Page 2 has fewer items than limit when total is not a multiple of limit (5 items on page 2 of 15): covered by requirement 14.
- Token with odd digit sum treated as invalid even though it has digits: covered by requirement 19.
- Combined category + inStock filter narrows independently: covered by requirement 16.
- Combined category + sort applies both transformations: covered by requirement 17.
