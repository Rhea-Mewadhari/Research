# Milestone

Task: task9
Target: backend

## Requirements addressed

- Requirement 1 — SQLite foreign-key enforcement enabled: verified — `src/benchmark-backend/src/db/client.ts` line 11 contains `db.pragma('foreign_keys = ON')` immediately after `db.pragma('journal_mode = WAL')`.
- Requirement 2 — `POST /api/favourites` with non-existent `productId` returns 404 `PRODUCT_NOT_FOUND`: verified — `favouritesService.ts` lines 16-19 SELECT from `products` before insert and throw `ProductNotFoundError` if absent; all 23 tests passed.
- Requirement 3 — Atomic `INSERT OR IGNORE` deduplication: verified — `favouritesService.ts` line 22 uses `INSERT OR IGNORE INTO favourites (id, product_id) VALUES (?, ?)`; follow-up SELECT returns existing row; `created` flag derived from `result.changes === 1`; idempotent test passed.
- Requirement 4 — `removeFavourite` returns `false` when no row deleted: verified — `favouritesService.ts` line 40 returns `result.changes > 0`; `> -1` is absent; `DELETE /api/favourites/:productId` for non-existent favourite returns 404 `{ "error": "Favourite not found" }`.
- Requirement 5 — Visible test suite passes in full without modifying test files: verified — `pnpm test` in `benchmark-backend` exited 0 with `Test Files 2 passed (2)`, `Tests 23 passed (23)`.

## Files changed

- `src/benchmark-backend/src/db/client.ts`: added `db.pragma('foreign_keys = ON')` after WAL pragma to enforce FK constraints at runtime.
- `src/benchmark-backend/src/services/favouritesService.ts`: (1) imported `ProductNotFoundError`; (2) added product-existence check before insert; (3) replaced SELECT-then-INSERT with atomic `INSERT OR IGNORE`; (4) fixed `removeFavourite` return from `result.changes > -1` to `result.changes > 0`.

## Checks

- pnpm test: 23 passed, 0 failed
- pnpm run build: pass
