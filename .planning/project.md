# Project

Task: task9
Target: backend

## Idea

Fix three correctness bugs in `src/services/favouritesService.ts`. Bug 1: the service
does not reject inserts for non-existent product IDs because SQLite foreign-key
enforcement is not enabled in `src/db/client.ts` and there is no explicit existence
check — the service must throw `ProductNotFoundError` so the controller returns 404.
Bug 2: the add-favourite path does a non-atomic SELECT then INSERT, which is vulnerable
to duplicate rows under concurrent access — replace with an atomic `INSERT OR IGNORE`
so the `UNIQUE(product_id)` constraint does the deduplication at the DB level. Bug 3:
`removeFavourite` evaluates `result.changes > -1`, which is always `true` (changes is
never negative) — fix to `result.changes > 0` so the controller can correctly return
404 when no row was deleted.

## Spec pointers

- `benchmark-backend/instructions/task9.md`: full bug descriptions, requirements, technical constraints, and success criteria

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/db/client.ts`: missing `db.pragma('foreign_keys = ON')` — FK constraints not enforced
- `src/benchmark-backend/src/services/favouritesService.ts`: all three bugs live here — non-existent product not rejected, non-atomic insert, wrong `removeFavourite` return logic
- `src/benchmark-backend/src/errors/index.ts`: `ProductNotFoundError` exists and should be thrown for bug 1
- `src/benchmark-backend/src/controllers/favouriteController.ts`: read-only reference — `add` passes errors to `next(err)` (error handler maps `AppError` subclasses to their `statusCode`); `remove` maps `false` to 404
- `src/benchmark-backend/src/db/migrations/002_favourites.sql`: read-only reference — confirms `UNIQUE(product_id)` and FK `REFERENCES products(id)` are already in the schema
