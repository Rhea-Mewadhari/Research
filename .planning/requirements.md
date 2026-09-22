# Requirements

1. `POST /api/favourites` with a `productId` not present in the `products` table must return HTTP 404 with a JSON body containing an `error` field.
   - Verified by: Sending `POST /api/favourites` with body `{ "productId": "nonexistent-999" }` to the running server returns `res.status === 404` and `res.body.error` is a non-empty string. Achievable mechanically by the hidden test suite or by running the server and using supertest.

2. Calling `POST /api/favourites` twice with the same `productId` must result in exactly one row in the `favourites` table (idempotent insert), with the second call returning HTTP 200.
   - Verified by: The visible test `'POST /api/favourites with the same productId is idempotent and returns 200'` in `src/benchmark-backend/src/tests/visible/favourites.test.ts` passes. Additionally, `favouritesService.ts::addFavourite` must use `INSERT OR IGNORE` (a single atomic statement) rather than a check-then-insert sequence.

3. `DELETE /api/favourites/:productId` for a `productId` with no row in the `favourites` table must return HTTP 404 with a JSON body containing an `error` field.
   - Verified by: Sending `DELETE /api/favourites/nonexistent-999` to the running server returns `res.status === 404` and `res.body.error` is a non-empty string. Root condition: `favouritesService.ts::removeFavourite` returns `false` when `result.changes === 0`, which requires the guard to be `result.changes > 0` (not `result.changes > -1`).

4. All visible tests in `src/benchmark-backend/src/tests/visible/favourites.test.ts` pass without modification.
   - Verified by: `pnpm test` run from `src/benchmark-backend/` exits with code 0 and all four test cases in the `Favourites API — happy path` describe block report as passing.

5. SQLite foreign-key constraints are enforced at the DB client level so that the schema-level `REFERENCES products(id)` on `favourites.product_id` is active.
   - Verified by: `src/benchmark-backend/src/db/client.ts` contains the statement `db.pragma('foreign_keys = ON')` — inspectable directly in the source file after the fix.

6. The files `src/benchmark-backend/src/controllers/favouriteController.ts`, `src/benchmark-backend/src/routes/favouriteRoutes.ts`, and all files under `src/benchmark-backend/src/db/migrations/` are not modified.
   - Verified by: `git diff --name-only` after applying fixes does not include any of those paths.

---

## Edge cases

- Non-existent `productId` on POST (e.g. `"nonexistent-999"`): covered by requirement 1. The explicit product-existence check in `addFavourite` must fire before the INSERT and throw `ProductNotFoundError` (statusCode 404), which propagates via `next(err)` through the error handler and returns 404.
- Duplicate `productId` on POST: covered by requirement 2. The `INSERT OR IGNORE` pattern is atomic under the existing `UNIQUE(product_id)` schema constraint, so no duplicate rows can be created even under concurrent access.
- DELETE for `productId` that was never added: covered by requirement 3. `result.changes` is 0; `removeFavourite` returns `false`; controller returns 404.
- DELETE for `productId` that was previously added then removed: same as above — covered by requirement 3.
- POST with missing or non-string `productId` body field: returns HTTP 400 via the existing `validate(addFavouriteSchema)` middleware — this is pre-existing behaviour and must not regress (covered implicitly by requirement 4 since the happy-path test supplies a valid body and passes).
- `addFavourite` for a product that is concurrently deleted between the existence check and the INSERT: the FK constraint fires (now that `PRAGMA foreign_keys = ON` is set), which throws a SQLite error caught by the `try/catch` and wrapped as `DatabaseError` (500) — acceptable; this race is not a stated requirement.
