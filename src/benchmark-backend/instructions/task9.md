# Task BE-T2-3: Bug Fix — Favourites Service Database Integrity

## Objective

The favourites service has correctness issues in edge-case handling that make it non-production-ready. Fix all issues so the service behaves correctly under all conditions.

---

## Context

`src/services/favouritesService.ts` manages favourite products via a SQLite table. The visible tests cover the happy path and currently pass. However the implementation has three correctness issues that only manifest in edge cases:

1. Adding a favourite for a product that does not exist should be rejected, but is not
2. The insert logic is not atomic — it is vulnerable to duplicate rows under concurrent access
3. Removing a favourite returns the wrong value when no row is actually deleted — the controller therefore responds with the wrong status code

---

## Requirements

1. `POST /api/favourites` with a non-existent `productId` must return 404
2. Adding the same `productId` twice must result in exactly one row in the database
3. `DELETE /api/favourites/:productId` for a favourite that does not exist must return 404

---

## Technical Constraints

- Do not modify `src/controllers/favouriteController.ts` or `src/routes/favouriteRoutes.ts`
- Do not modify the migration SQL files in `src/db/migrations/`
- SQLite FK constraints must be enforced — check how the DB client is configured

---

## Files to Investigate

- `src/services/favouritesService.ts`
- `src/db/client.ts`

---

## Success Criteria

- All visible tests pass (`pnpm test`)
- `POST /api/favourites` with a non-existent `productId` returns 404
- `DELETE /api/favourites/:productId` for a non-existent favourite returns 404
- Inserting the same `productId` twice results in one row, not two
