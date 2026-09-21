# Requirements

1. `src/benchmark-backend/src/db/client.ts` executes `db.pragma('foreign_keys = ON')` immediately after opening the database connection.
   - Verified by: `grep -n "foreign_keys = ON" src/benchmark-backend/src/db/client.ts` returns at least one match.

2. `addFavourite` in `src/benchmark-backend/src/services/favouritesService.ts` throws `ProductNotFoundError` when the given `productId` is absent from the `products` table (checked before any insert attempt).
   - Verified by: `grep -n "ProductNotFoundError" src/benchmark-backend/src/services/favouritesService.ts` returns a match.

3. `POST /api/favourites` with a `productId` that does not exist in the `products` table returns HTTP 404 with a JSON body containing an `"error"` field.
   - Verified by: `pnpm test` passes (the hidden test suite includes this case); the controller already passes thrown errors to `next(err)`, and the error handler maps `ProductNotFoundError.statusCode` (404) to the response.

4. `addFavourite` uses a single atomic `INSERT OR IGNORE` statement instead of a separate SELECT followed by INSERT, so the database's `UNIQUE(product_id)` constraint handles deduplication at the DB level.
   - Verified by: `grep -n "INSERT OR IGNORE" src/benchmark-backend/src/services/favouritesService.ts` returns a match; no bare `INSERT INTO favourites` without `OR IGNORE` remains in the file.

5. `POST /api/favourites` with the same `productId` twice results in exactly one row in `favourites` for that `productId`, and the second call returns HTTP 200 (not 201).
   - Verified by: `pnpm test` passes — the visible test `'POST /api/favourites with the same productId is idempotent and returns 200'` passes and does not produce duplicate rows in the in-memory test database.

6. `removeFavourite` in `src/benchmark-backend/src/services/favouritesService.ts` evaluates `result.changes > 0` (not `> -1`) to determine whether a row was deleted, returning `false` when `changes === 0`.
   - Verified by: `grep -n "result.changes > 0" src/benchmark-backend/src/services/favouritesService.ts` returns a match; the expression `result.changes > -1` must not appear in the file.

7. `DELETE /api/favourites/:productId` for a `productId` that has no matching favourite row returns HTTP 404 with JSON body `{ "error": "Favourite not found" }`.
   - Verified by: `pnpm test` passes (the hidden test suite includes this case); the controller already returns 404 when `removeFavourite` returns `false`.

8. `src/benchmark-backend/src/controllers/favouriteController.ts`, `src/benchmark-backend/src/routes/favouriteRoutes.ts`, and all files under `src/benchmark-backend/src/db/migrations/` are not modified.
   - Verified by: `git diff --name-only` after the fix does not include any of those paths.

9. All visible tests pass with exit code 0.
   - Verified by: `pnpm test` run from the `src/benchmark-backend` directory exits with code 0 and all four tests in `src/tests/visible/favourites.test.ts` report as passing.

## Edge cases

- `productId` absent from `products` table → `addFavourite` throws before reaching the INSERT: covered by requirements 2 and 3.
- `productId` valid but already favourited (duplicate add) → `INSERT OR IGNORE` is a no-op; service returns `{created: false}` → controller returns 200: covered by requirements 4 and 5.
- `DELETE` for a `productId` never favourited → `result.changes === 0` → `removeFavourite` returns `false` → controller returns 404: covered by requirements 6 and 7.
- SQLite FK constraint as secondary guard: with `foreign_keys = ON`, the DB itself rejects a foreign-key violation even if the explicit existence check were bypassed: covered by requirement 1.
- `DELETE /api/favourites/1` for an existing favourite still returns 204 (regression check): covered by requirement 9 (the visible delete test asserts 204).
