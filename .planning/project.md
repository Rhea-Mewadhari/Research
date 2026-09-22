# Project

Task: task9
Target: backend

## Idea

The favourites service (`src/services/favouritesService.ts`) has three correctness bugs in edge-case handling. First, adding a favourite for a non-existent `productId` is not validated against the products table, so it silently inserts a row that references no real product. Second, the add logic is non-atomic — a SELECT then INSERT race allows duplicate rows under concurrent access, and the SQLite FK constraint is also not enabled (no `PRAGMA foreign_keys = ON` in `client.ts`). Third, `removeFavourite` returns `true` even when zero rows are deleted (`result.changes > -1` is always true), so the controller cannot distinguish "deleted" from "not found" and always responds 200 instead of 404.

## Spec pointers

- `src/benchmark-backend/instructions/task9.md`: Full bug descriptions, requirements, technical constraints, and success criteria

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/services/favouritesService.ts`: All three bugs live here — missing product existence check in `addFavourite`, non-atomic insert (SELECT + INSERT instead of INSERT OR IGNORE), and wrong boolean logic in `removeFavourite` (`changes > -1` should be `changes > 0`)
- `src/benchmark-backend/src/db/client.ts`: Missing `PRAGMA foreign_keys = ON` — without it SQLite silently ignores FK violations, so the product-existence check could alternatively be enforced at the DB level, but the spec also requires an explicit 404 response which must be handled in the service layer
- `src/benchmark-backend/src/controllers/favouriteController.ts`: Read-only reference — must not be modified, but explains how the boolean return from `removeFavourite` maps to HTTP status codes
- `src/benchmark-backend/src/db/migrations/`: Read-only reference — confirms the schema (FK on `product_id → products.id`) and whether FK constraints are declared
