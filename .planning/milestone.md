# Milestone

Task: task9
Target: backend

## Requirements addressed

- Requirement 1 (POST with non-existent productId → 404): verified — `favouritesService.ts::addFavourite` performs an explicit `SELECT 1 FROM products WHERE id = ?` existence check and throws `ProductNotFoundError(productId)` (statusCode 404) before the INSERT; propagates via `next(err)` through the error handler and returns HTTP 404 with `{ error }` body.
- Requirement 2 (idempotent POST → exactly one row, second call → 200): verified — `addFavourite` uses `INSERT OR IGNORE INTO favourites (id, product_id) VALUES (?, ?)` (atomic under the existing `UNIQUE(product_id)` schema constraint); `created` flag is `stmt.changes === 1`; visible test `POST /api/favourites with the same productId is idempotent and returns 200` passes (1ms).
- Requirement 3 (DELETE for non-existent favourite → 404): verified — `removeFavourite` returns `result.changes > 0`; when no row is deleted `changes === 0` → returns `false` → controller returns 404 with error body. Old guard `> -1` (always true) is gone.
- Requirement 4 (all visible tests pass): verified — `pnpm test` exited code 0; 2 test files, 23 tests, all passed; 4 tests in `Favourites API — happy path` all green.
- Requirement 5 (FK constraints enforced in DB client): verified — `src/benchmark-backend/src/db/client.ts` contains `db.pragma('foreign_keys = ON');` immediately after `db.pragma('journal_mode = WAL');`.
- Requirement 6 (controller, routes, and migration files not modified): verified — `git diff --name-only` for `favouriteController.ts`, `favouriteRoutes.ts`, and `src/benchmark-backend/src/db/migrations/` produced no output.

## Files changed

- `src/benchmark-backend/src/db/client.ts`: added `db.pragma('foreign_keys = ON')` after the WAL pragma to enforce schema-level FK constraints for the lifetime of the connection.
- `src/benchmark-backend/src/services/favouritesService.ts`: (1) added product existence check before INSERT in `addFavourite` — throws `ProductNotFoundError` on miss; (2) replaced non-atomic SELECT+INSERT with atomic `INSERT OR IGNORE` + post-SELECT for idempotent inserts; (3) fixed `removeFavourite` return guard from `result.changes > -1` to `result.changes > 0`.

## Checks

- pnpm test: 23 passed, 0 failed (2 test files)
- pnpm run build: pass
