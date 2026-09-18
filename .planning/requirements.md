# Requirements

> Fixture facts used below (derived from `src/benchmark-backend/src/data/products.ts`):
> - 15 products total; 11 have `inStock: true`, 4 have `inStock: false`
> - Electronics (4): Laptop $999✓, Smartphone $699✓, Wireless Headphones $149✗, Mechanical Keyboard $89✓  
>   (✓ = inStock, ✗ = out of stock)
> - Clothing (3): Linen Shirt $49✓, Running Shoes $119✓, Winter Jacket $189✗
> - Furniture (3): Ergonomic Chair $549✓, Standing Desk $399✗, Bookshelf $149✓
> - Sports (3): Yoga Mat $39✓, Resistance Bands $24✓, Jump Rope $19✗
> - Books (2): Clean Code $35✓, The Pragmatic Programmer $42✓
> - Cheapest product: Jump Rope $19 | Most expensive: Laptop $999
> - Name-first alphabetically: Bookshelf | Name-last: Yoga Mat
> - Valid auth token: `benchmark-token-2024` (digit sum 2+0+2+4=8, even → 200)
> - Invalid auth token: `benchmark-token-2023` (digit sum 2+0+2+3=7, odd → 401)

---

## Filtering

1. `GET /products?category=electronics` with valid auth returns HTTP 200 with `total: 4`, and `data` containing exactly the four electronics products (Laptop, Smartphone, Wireless Headphones, Mechanical Keyboard).
   - Verified by: a test in `products.test.ts` that sends `GET /products?category=electronics` with `AUTH` header, asserts `status === 200`, `body.total === 4`, and `body.data` has 4 items all with `category === 'electronics'`.

2. Category filter is case-insensitive: `GET /products?category=Electronics` returns the same result as `?category=electronics` — `total: 4`, `data` length 4, all items with `category === 'electronics'`.
   - Verified by: a test in `products.test.ts` sending `?category=Electronics` (uppercase E), asserting `body.total === 4`.

3. Unknown category (e.g. `?category=nonexistent`) returns HTTP 200 with `data: []` and `total: 0`.
   - Verified by: a test in `products.test.ts` sending `?category=nonexistent`, asserting `body.data` is an empty array and `body.total === 0`.

4. `GET /products?inStock=true` returns HTTP 200 with `total: 11` and every item in `data` having `inStock === true`.
   - Verified by: a test in `products.test.ts` asserting `body.total === 11` and every `body.data` item satisfies `item.inStock === true`.

5. `GET /products?inStock=false` returns HTTP 200 with `total: 4` and every item in `data` having `inStock === false`.
   - Verified by: a test in `products.test.ts` asserting `body.total === 4` and every `body.data` item satisfies `item.inStock === false`.

---

## Search

6. `GET /products?search=laptop` (lowercase) returns HTTP 200 with `total: 1` and `data[0].name === 'Laptop'` (case-insensitive match against the product named "Laptop").
   - Verified by: a test in `products.test.ts` asserting `body.total === 1` and `body.data[0].name === 'Laptop'`.

7. `GET /products?search=wire` returns HTTP 200 with `total: 1` and `data[0].name === 'Wireless Headphones'` (partial-name match).
   - Verified by: a test in `products.test.ts` asserting `body.total === 1` and `body.data[0].name === 'Wireless Headphones'`.

8. `GET /products?search=%20laptop%20` (URL-encoded leading and trailing spaces) returns the same result as `?search=laptop` — `total: 1`, `data[0].name === 'Laptop'` — confirming whitespace is trimmed before matching.
   - Verified by: a test in `products.test.ts` sending `?search=%20laptop%20`, asserting `body.total === 1` and `body.data[0].name === 'Laptop'`.

---

## Sorting

9. `GET /products?sort=price_asc` returns HTTP 200 with `data[0].name === 'Jump Rope'` (price $19, lowest in fixture).
   - Verified by: a test in `products.test.ts` asserting `body.data[0].name === 'Jump Rope'` and `body.data[0].price === 19`.

10. `GET /products?sort=price_desc` returns HTTP 200 with `data[0].name === 'Laptop'` (price $999, highest in fixture).
    - Verified by: a test in `products.test.ts` asserting `body.data[0].name === 'Laptop'` and `body.data[0].price === 999`.

11. `GET /products?sort=name_asc` returns HTTP 200 with `data[0].name === 'Bookshelf'` (alphabetically first across all 15 products).
    - Verified by: a test in `products.test.ts` asserting `body.data[0].name === 'Bookshelf'`.

12. `GET /products?sort=name_desc` returns HTTP 200 with `data[0].name === 'Yoga Mat'` (alphabetically last across all 15 products).
    - Verified by: a test in `products.test.ts` asserting `body.data[0].name === 'Yoga Mat'`.

---

## Pagination

13. Default `GET /products` (no pagination params) returns HTTP 200 with envelope `{ data, total: 15, page: 1, limit: 10, totalPages: 2 }` and `data` containing exactly 10 items.
    - Verified by: a test in `products.test.ts` asserting `body.total === 15`, `body.page === 1`, `body.limit === 10`, `body.totalPages === 2`, and `body.data.length === 10`.

14. `GET /products?page=2` returns HTTP 200 with `page: 2`, `data` containing exactly 5 items (the remaining 5 products beyond the first 10), and `total: 15`.
    - Verified by: a test in `products.test.ts` asserting `body.page === 2`, `body.data.length === 5`, and `body.total === 15`.

15. The product IDs returned by `?page=1` and `?page=2` (default limit=10) are completely disjoint — no product appears on both pages.
    - Verified by: a test in `products.test.ts` that collects `body.data.map(p => p.id)` from both pages and asserts the intersection is empty.

16. `GET /products?limit=100` returns HTTP 200 with `limit: 50` (clamped) and all 15 products in `data`, confirming the limit cap is applied and reflected in the response envelope.
    - Verified by: a test in `products.test.ts` asserting `body.limit === 50` and `body.data.length === 15`.

---

## Combined Filters

17. `GET /products?category=electronics&inStock=true` returns HTTP 200 with `total: 3` and `data` containing exactly Laptop, Smartphone, and Mechanical Keyboard (the 3 in-stock electronics).
    - Verified by: a test in `products.test.ts` asserting `body.total === 3` and `body.data` has 3 items, each satisfying `item.category === 'electronics'` and `item.inStock === true`.

18. `GET /products?search=chair&sort=price_desc` returns HTTP 200 with `total: 1` and `data[0].name === 'Ergonomic Chair'` — confirming search and sort are applied together.
    - Verified by: a test in `products.test.ts` asserting `body.total === 1` and `body.data[0].name === 'Ergonomic Chair'`.

---

## Authentication

19. `GET /products` with no `Authorization` header returns HTTP 401 with a JSON body containing `{ error: 'Unauthorized' }`.
    - Verified by: a test in `products.test.ts` sending the request without any auth header, asserting `status === 401` and `body.error === 'Unauthorized'`.

20. `GET /products` with `Authorization: Bearer benchmark-token-2023` (digit sum 7, odd → invalid) returns HTTP 401 with body `{ error: 'Unauthorized' }`.
    - Verified by: a test in `products.test.ts` asserting `status === 401` and `body.error === 'Unauthorized'`.

21. `GET /products` with `Authorization: Bearer benchmark-token-2024` (digit sum 8, even → valid) returns HTTP 200.
    - Verified by: a test in `products.test.ts` asserting `status === 200`.

22. `GET /health` with no `Authorization` header returns HTTP 200 with body `{ status: 'ok' }` — the health endpoint is exempt from auth.
    - Verified by: a test in `products.test.ts` (or sibling describe block) asserting `status === 200` and `body.status === 'ok'` when no auth header is sent.

---

## Constraints

23. The mock `fetchAllProducts` from `../../services/dataFetcher` is wired via `vi.mock` in `products.test.ts` and `mockFetchAllProducts.mockResolvedValue([...MOCK_PRODUCTS])` is set in `beforeAll`. No test modifies any application source file.
    - Verified by: `pnpm vitest run` inside `src/benchmark-backend` completes with all tests passing and zero modified files outside `src/tests/visible/products.test.ts` (confirmed by `git diff --name-only`).

24. All tests use Supertest against the `app` import, assert specific field values (not just status codes), are self-contained, and produce deterministic results across repeated runs.
    - Verified by: running `pnpm vitest run` twice in succession inside `src/benchmark-backend` produces identical pass/fail output both times.

---

## Edge Cases

- Whitespace-only search (e.g. `?search=%20`): after trimming the term is empty string `''`, so `''.includes('')` is true for every product name — all 15 products returned; covered by the search implementation (not a separate requirement, but tests for requirement 8 implicitly rely on trim behaviour).
- `limit` query param of `0` or negative: `parseInt` gives a non-positive number, so the parser skips it and falls back to default `limit=10`; covered by the pagination default (requirement 13).
- `page` out of range (e.g. `?page=99`): slice returns an empty array; `data: []`, `total: 15`, `page: 99`; not a separate requirement but consistent with the implementation — covered by requirement 14 which verifies the page value is reflected in the envelope.
- Token with no digits (e.g. `Bearer abc`): digit sum = 0 (even) → 200; covered by requirement 21's general principle that even-sum tokens are valid.
- Category filter applied before sort and pagination: order of operations is search → category → inStock → sort → paginate; requirements 17–18 (combined) exercise this ordering.
- `inStock` values other than `'true'`/`'false'` (e.g. `?inStock=1`): the parser ignores them; all 15 products returned; not explicitly tested but covered by the unfiltered default (requirement 13).
