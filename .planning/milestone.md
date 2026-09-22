# Milestone

Task: task9
Target: backend

## Requirements addressed

- Req 1 — POST /api/favourites with non-existent productId returns HTTP 404 with error field: verified — addFavourite() runs `SELECT 1 FROM products WHERE id = ?` before any insert and throws ProductNotFoundError(productId) if no row found; errorHandler maps it to `{ error: "Product with id '<id>' not found" }`; all 23 tests passed.
- Req 2 — PRAGMA foreign_keys = ON executed on every connection: verified — `db.pragma('foreign_keys = ON')` present at client.ts line 11, runs for both `:memory:` (test) and file-based (production) databases.
- Req 3 — Adding same productId twice results in exactly one row (idempotent upsert): verified — addFavourite uses single atomic `INSERT OR IGNORE INTO favourites (id, product_id) VALUES (?, ?)`, eliminating SELECT-then-INSERT race; visible test 'POST /api/favourites with the same productId is idempotent and returns 200' passed.
- Req 4 — DELETE /api/favourites/:productId for unknown productId returns HTTP 404 `{ "error": "Favourite not found" }`: verified — removeFavourite returns `result.changes > 0` (fixed from `> -1`); controller responds 404 when false; all 23 tests passed.
- Req 5 — All existing visible tests continue to pass: verified — pnpm test: 2 test files passed, 23 tests passed, exit code 0.

## Files changed

- `src/benchmark-backend/src/db/client.ts`: Added `db.pragma('foreign_keys = ON')` to enable SQLite FK enforcement on every connection.
- `src/benchmark-backend/src/services/favouritesService.ts`: Three fixes — (1) product existence check before try-catch throwing ProductNotFoundError; (2) atomic `INSERT OR IGNORE` replacing non-atomic SELECT+INSERT; (3) `result.changes > 0` replacing always-true `result.changes > -1` in removeFavourite.

## Checks

- pnpm test: 23 passed, 0 failed (2 test files)
- pnpm run build: pass
