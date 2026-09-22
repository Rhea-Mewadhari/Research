# Milestone

Task: task9
Target: backend

## Requirements addressed

- **POST /api/favourites with non-existent productId returns 404**: verified — `db.pragma('foreign_keys = ON')` added to `client.ts:11`; SQLite FK enforcement raises `SQLITE_CONSTRAINT_FOREIGNKEY` on insert of unknown productId; `favouritesService.ts:25-27` catch block maps this to `ProductNotFoundError` (statusCode=404); `errorHandler.ts` converts it to HTTP 404.

- **Duplicate POST /api/favourites is idempotent (HTTP 200, one row)**: verified — `favouritesService.ts:17` uses `INSERT OR IGNORE INTO favourites`; when duplicate, `result.changes===0` → `created: false`; follow-up SELECT returns existing row; controller responds 200. Visible test "POST /api/favourites with the same productId is idempotent and returns 200" passes.

- **DELETE /api/favourites/:productId for missing productId returns 404**: verified — `favouritesService.ts:36` returns `result.changes > 0` (was `> -1`); when 0 rows deleted, returns `false`; `favouriteController.ts:27-30` sends HTTP 404. Visible DELETE test passes.

- **All visible tests pass without modifying controller/routes/migrations**: verified — `pnpm test` from `src/benchmark-backend/` exits 0: Test Files 2 passed (2), Tests 23 passed (23). `pnpm run build` exits 0. `favouriteController.ts`, `favouriteRoutes.ts`, and all migration SQL files are unchanged.

## Files changed

- `src/benchmark-backend/src/db/client.ts`: added `db.pragma('foreign_keys = ON')` after the existing WAL pragma to enable SQLite FK enforcement on the shared connection
- `src/benchmark-backend/src/services/favouritesService.ts`: replaced SELECT-then-INSERT race with atomic `INSERT OR IGNORE`; fixed `removeFavourite` return condition from `result.changes > -1` to `result.changes > 0`

## Checks

- pnpm test: 23 passed, 0 failed
- pnpm run build: pass
