# Requirements

1. `POST /api/favourites` with a `productId` that does not exist in the `products` table must return HTTP 404 with a JSON body containing an `error` field.
   - Verified by: `POST /api/favourites` with `{ productId: "nonexistent-id" }` returns status 404 and `res.body.error` is a non-empty string. Confirmed by running `pnpm test` in `src/benchmark-backend/` (hidden tests cover this path) plus manual curl or supertest assertion against a running server.

2. SQLite foreign-key constraints must be enforced at the database level — `PRAGMA foreign_keys = ON` must be executed on every connection opened by `src/db/client.ts`.
   - Verified by: After applying the fix, inserting a row into `favourites` with a `product_id` that references no row in `products` must fail at the SQLite layer (FK violation error). Confirmed by inspecting `src/db/client.ts` for the pragma call and by the fact that requirement 1's 404 behaviour is exercised by the test suite.

3. Adding the same `productId` twice via `POST /api/favourites` must result in exactly one row in the `favourites` table (idempotent upsert).
   - Verified by: The visible test `'POST /api/favourites with the same productId is idempotent and returns 200'` passes (`pnpm test`). Additionally, querying the `favourites` table after two identical POSTs returns a count of 1 for that `product_id`. The insert in `addFavourite` must be atomic (a single `INSERT OR IGNORE` statement) — not a SELECT-then-INSERT pair.

4. `DELETE /api/favourites/:productId` for a `productId` that has no row in `favourites` must return HTTP 404 with a JSON body `{ "error": "Favourite not found" }`.
   - Verified by: `DELETE /api/favourites/does-not-exist` returns status 404 and `res.body` equals `{ error: 'Favourite not found' }`. Confirmed by running `pnpm test` (hidden tests cover this path). The fix is in `removeFavourite`: `result.changes > -1` (always true) must become `result.changes > 0`.

5. All existing visible tests must continue to pass without modification.
   - Verified by: `pnpm test` in `src/benchmark-backend/` exits with code 0 and all four tests in `src/tests/visible/favourites.test.ts` show as passing.

---

## Edge cases

- Non-existent `productId` on POST: covered by requirement 1. The product-existence check must happen before any insert attempt, and must produce an error type that the Express error middleware maps to HTTP 404.
- Concurrent duplicate inserts: covered by requirement 3. Using `INSERT OR IGNORE` eliminates the SELECT-then-INSERT TOCTOU race; the `UNIQUE(product_id)` constraint in the schema provides the DB-level guard.
- `DELETE` with a `productId` that was never added (not just removed): covered by requirement 4. `result.changes` is 0 when no row was deleted, so `> 0` correctly distinguishes "deleted" from "not found".
- FK enforcement across all environments (test and production): covered by requirement 2. The pragma must fire for every `db` instance, including the `:memory:` database used in tests.
- Happy-path idempotency (second POST returns 200, not 201): covered by requirement 3 and verified by the visible test suite.
