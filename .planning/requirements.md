# Requirements

1. `src/db/client.ts` must enable SQLite foreign-key enforcement by calling
   `db.pragma('foreign_keys = ON')` immediately after the database connection is opened.
   - Verified by: `src/benchmark-backend/src/db/client.ts` contains the line
     `db.pragma('foreign_keys = ON')` (grep confirms presence).

2. `POST /api/favourites` with a `productId` that does not exist in the `products` table
   must return HTTP 404 with a JSON body containing `{ "error": "...", "code": "PRODUCT_NOT_FOUND" }`.
   `addFavourite` must throw `ProductNotFoundError` when the product is absent (checked
   via a `SELECT` on `products` before attempting the insert).
   - Verified by: `pnpm test` in `benchmark-backend` passes all visible tests; sending
     `POST /api/favourites` with `{ "productId": "nonexistent-999" }` to the test server
     returns status 404 and a JSON body whose `code` field equals `"PRODUCT_NOT_FOUND"`.

3. Adding the same `productId` twice must result in exactly one row in the `favourites`
   table. The SELECT-then-INSERT pattern must be replaced with a single atomic
   `INSERT OR IGNORE INTO favourites (id, product_id) VALUES (?, ?)` statement. When
   the row already exists (INSERT was ignored), the service must query the existing row
   and return `{ favourite, created: false }`.
   - Verified by: `favouritesService.ts` contains `INSERT OR IGNORE` (grep confirms);
     `pnpm test` passes the visible test "POST /api/favourites with the same productId
     is idempotent and returns 200".

4. `removeFavourite(productId: string)` must return `false` when `result.changes === 0`
   (no row was deleted). The expression `result.changes > -1` must be replaced with
   `result.changes > 0`. Consequently, `DELETE /api/favourites/:productId` for a
   non-existent favourite must return HTTP 404 with JSON body
   `{ "error": "Favourite not found" }`.
   - Verified by: `favouritesService.ts` contains `result.changes > 0` (grep confirms
     absence of `> -1`); `pnpm test` passes the visible delete test; sending
     `DELETE /api/favourites/nonexistent-999` returns status 404 with JSON body
     `{ "error": "Favourite not found" }`.

5. The visible test suite must pass in full without modifying any test file.
   - Verified by: `pnpm test` exits with code 0 inside `benchmark-backend`.

## Edge cases

- `productId` that was valid but has since been deleted from `products`: covered by
  requirement 2 (SELECT on products checks current state at call time).
- Concurrent duplicate inserts racing through the check in requirement 2: covered by
  requirement 3 (`INSERT OR IGNORE` makes the insert atomic regardless of the
  product-existence pre-check result ordering).
- `removeFavourite` called with a valid productId that was never added to favourites:
  covered by requirement 4 (`changes === 0` → returns `false` → controller returns 404).
- `removeFavourite` called with an empty string: covered by requirement 4 (no row
  matches, `changes === 0`, returns `false`).
- `addFavourite` with an existing productId that is already a favourite: covered by
  requirement 3 (INSERT OR IGNORE skips, existing row returned, `created: false`).
