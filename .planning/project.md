# Project

Task: task9
Target: frontend

## Idea

Fix two logical bugs in `FavouritesContext.toggleFavourite`: (1) when the API call fails after an optimistic UI update, the optimistic change is never reverted — the UI stays in the wrong state; and (2) `setPendingIds` is never called, so `isPending(productId)` always returns `false` and `FavouriteButton` is never disabled during in-flight requests. The fix adds `setPendingIds` calls around the fetch (add before, remove in `finally`), and adds a `catch` block that reverts only the affected product's state using a functional updater (not a stale snapshot of the full Set).

## Spec pointers

- `src/benchmark-frontend/instructions/TASK9.MD`: Full requirements — revert on failure, mark in-flight requests, guard against double-toggle corruption, constraints (do not modify FavouriteButton.tsx or FavouritesPage.tsx), and success criteria.

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/context/FavouritesContext.tsx`: The only file to modify — contains `toggleFavourite` with both bugs (missing `setPendingIds` calls and missing revert logic in the `catch` block).
- `src/benchmark-frontend/src/components/FavouriteButton.tsx`: Read-only reference — already reads `isPending` and sets `disabled={pending}`; must not be modified.
- `src/benchmark-frontend/tests/`: Visible tests that must pass after the fix; must not be modified.
