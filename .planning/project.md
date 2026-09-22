# Project

Task: task9
Target: backend

## Idea

Fix three correctness bugs in `src/services/favouritesService.ts`. First, adding a favourite for a non-existent product must be rejected with a signal that causes the controller to return 404 — currently the FK constraint exists in the schema but SQLite FK enforcement is not enabled in the DB client, so the insert silently succeeds. Second, the SELECT-then-INSERT pattern is not atomic and can produce duplicate rows under concurrent access; it must be replaced with `INSERT OR IGNORE` (the schema already has `UNIQUE(product_id)`) so the upsert is a single atomic statement. Third, `removeFavourite` returns `result.changes > -1` which is always `true` even when zero rows were deleted; it must return `result.changes > 0` so the controller's 404 branch is actually reached.

## Spec pointers

- `benchmark-backend/instructions/task9.md`: defines the three bugs, the requirements (404 on missing product, one-row dedup, 404 on missing favourite), and the constraints (do not touch controller, routes, or migration SQL files)

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/services/favouritesService.ts`: contains all three bugs — wrong `removeFavourite` return, non-atomic insert, and no product-existence check
- `src/benchmark-backend/src/db/client.ts`: SQLite FK enforcement (`PRAGMA foreign_keys = ON`) must be added here; without it the FK reference on `favourites.product_id → products.id` is not enforced at runtime
- `src/benchmark-backend/src/db/migrations/002_favourites.sql`: already defines `REFERENCES products(id)` and `UNIQUE(product_id)` — no changes needed here (constraint says do not modify)
- `src/benchmark-backend/src/controllers/favouriteController.ts`: read-only for understanding the `removed` boolean contract; must not be modified
