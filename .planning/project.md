# Project

Task: task9
Target: backend

## Idea

Fix three correctness bugs in `src/services/favouritesService.ts` and `src/db/client.ts`. The favourites service manages a SQLite-backed list of favourite products. Currently: (1) SQLite FK constraints are not enforced because `PRAGMA foreign_keys = ON` is never set in the DB client, so adding a favourite for a non-existent product silently succeeds instead of being rejected; (2) the insert path uses a non-atomic check-then-insert that is vulnerable to duplicate rows under concurrent access (the schema has a UNIQUE constraint on `product_id`, so an `INSERT OR IGNORE` pattern would be atomic and correct); (3) `removeFavourite` returns `result.changes > -1` which is always `true` — the correct guard is `result.changes > 0`, meaning the controller always returns 204 even when no row was deleted.

## Spec pointers

- `benchmark-backend/instructions/task9.md`: Defines three bugs to fix, requirements (404 for non-existent productId on POST and DELETE, exactly one row for duplicate inserts), and the constraint not to modify the controller, routes, or migration SQL files.

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/db/client.ts`: Missing `db.pragma('foreign_keys = ON')` — FK constraints on `favourites.product_id REFERENCES products(id)` are never enforced.
- `src/benchmark-backend/src/services/favouritesService.ts`:
  - `addFavourite`: non-atomic check-then-insert; needs to become atomic `INSERT OR IGNORE` to prevent duplicate rows under concurrent access.
  - `removeFavourite`: `result.changes > -1` always returns `true`; must be `result.changes > 0` to correctly signal "nothing was deleted".
- `src/benchmark-backend/src/db/migrations/002_favourites.sql`: Defines `UNIQUE(product_id)` and `REFERENCES products(id)` — read-only reference; do not modify.
- `src/benchmark-backend/src/controllers/favouriteController.ts`: Read-only reference showing how `removeFavourite`'s boolean drives the 404/204 response — do not modify.

## Bug analysis

| # | Bug | Root cause | Fix |
|---|-----|-----------|-----|
| 1 | POST with non-existent productId returns 201 instead of 404 | FK pragma not enabled in `client.ts` | Add `db.pragma('foreign_keys = ON')` in `client.ts`; the FK violation will throw, the controller's `next(err)` will propagate it, and the error handler must recognise the SQLite FK error and return 404. Alternatively, add an explicit product-existence check in `addFavourite` before the insert. |
| 2 | Two concurrent inserts produce duplicate rows | Check-then-insert is not atomic | Replace with `INSERT OR IGNORE INTO favourites ... ` (atomic under the existing UNIQUE constraint), then SELECT to return the row. |
| 3 | DELETE for non-existent favourite returns 204 instead of 404 | `result.changes > -1` always true | Change to `result.changes > 0`. |

## Notes on bug 1 approach

Enabling FK via pragma is the right SQLite-level fix and satisfies the task's statement "SQLite FK constraints must be enforced — check how the DB client is configured." However, when a FK violation fires, better-sqlite3 throws a SqliteError with `code = 'SQLITE_CONSTRAINT_FOREIGNKEY'`. The controller's `add` handler calls `next(err)` which forwards to the error handler. Whether the error handler converts that to 404 needs to be verified; if not, an explicit product-existence check in the service is safer (and is also what the task description implies: "Adding a favourite for a product that does not exist should be rejected, but is not").

Both fixes (FK pragma + explicit check) are complementary and both may be needed. The explicit check approach ensures the service layer itself returns a meaningful result that allows the controller to respond 404 via the existing `addFavourite` return type — but the controller doesn't currently handle that case; it only calls `next(err)`. So the cleanest path is: enable FK pragma AND let the resulting SqliteError propagate, provided the error handler maps FK errors to 404. Must inspect the error handler.
