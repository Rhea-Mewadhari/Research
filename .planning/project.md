# Project

Task: task9
Target: backend

## Idea

Fix three correctness bugs in `src/services/favouritesService.ts` for the SQLite-backed favourites feature. First, adding a favourite for a non-existent productId must be rejected with a 404 (currently the FK constraint in the schema is never enforced because `PRAGMA foreign_keys` is not enabled in the DB client). Second, the insert logic is not atomic — a check-then-insert race can produce duplicate rows (though the UNIQUE constraint exists in the schema, the service never uses INSERT OR IGNORE, so it would throw on a concurrent duplicate). Third, `removeFavourite` returns `true` even when zero rows were deleted (`result.changes > -1` is always true), so the controller can never respond 404.

## Spec pointers

- `src/benchmark-backend/instructions/task9.md`: full requirements and technical constraints

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/services/favouritesService.ts`: all three bugs live here — FK not enforced, non-atomic insert, wrong removeFavourite return value
- `src/benchmark-backend/src/db/client.ts`: missing `PRAGMA foreign_keys = ON` — without it the FK reference from favourites.product_id → products.id is never enforced, so non-existent productIds are silently accepted
- `src/benchmark-backend/src/db/migrations/002_favourites.sql`: (read-only) defines the UNIQUE(product_id) constraint and the FK — both correct but not being used properly by the service
- `src/benchmark-backend/src/controllers/favouriteController.ts`: (read-only, do not modify) depends on addFavourite returning a 404-triggerable signal and removeFavourite returning false when no row deleted
