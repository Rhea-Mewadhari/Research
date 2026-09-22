# Requirements

1. `POST /api/favourites` with a `productId` that does not exist in the `products` table must return HTTP 404.
   - Verified by: `src/benchmark-backend/src/tests/visible/favourites.test.ts` — add a test (or confirm hidden test) that sends `POST /api/favourites` with a productId not present in the seeded products table and asserts `res.status === 404`. Also: `PRAGMA foreign_keys = ON` must appear in `src/benchmark-backend/src/db/client.ts`; without it no FK check fires.

2. Sending `POST /api/favourites` with the same `productId` twice must result in exactly one row in the `favourites` table, and the second call must return HTTP 200 (not an error).
   - Verified by: the existing visible test "POST /api/favourites with the same productId is idempotent and returns 200" passes (`pnpm test`), **and** a direct DB query after two inserts of the same productId returns `COUNT(*) = 1`. The insert statement in `addFavourite` must use `INSERT OR IGNORE` so the operation is atomic and cannot throw on a UNIQUE constraint violation under concurrent access.

3. `DELETE /api/favourites/:productId` for a productId that is not present in the `favourites` table must return HTTP 404.
   - Verified by: `src/benchmark-backend/src/tests/visible/favourites.test.ts` — the existing DELETE test removes a real row (204); a subsequent identical DELETE (or a DELETE for a never-added productId) must return 404. Mechanically: `removeFavourite` must return `false` when `result.changes === 0`, which requires fixing the condition from `result.changes > -1` to `result.changes > 0`.

4. All visible tests pass with no modifications to `src/controllers/favouriteController.ts`, `src/routes/favouriteRoutes.ts`, or any file under `src/db/migrations/`.
   - Verified by: `pnpm test` exits with code 0 from `src/benchmark-backend/`.

## Edge cases

- Empty-string or random productId not in `products`: covered by requirement 1 (FK enforcement rejects any productId not in the products table, regardless of format).
- `removeFavourite` called with a productId that was never added: `result.changes` will be 0, so the fixed condition (`> 0`) returns `false`, and the controller sends 404 — covered by requirement 3.
- Concurrent duplicate inserts: `INSERT OR IGNORE` is atomic at the SQLite level, so the second insert is silently dropped and no UNIQUE constraint error is thrown — covered by requirement 2.
- `result.changes` is always ≥ 0 (never negative): the old check `> -1` was therefore always `true`; fixing to `> 0` correctly distinguishes "deleted one row" from "deleted zero rows" — covered by requirement 3.
