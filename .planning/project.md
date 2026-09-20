# Project

Task: task9
Target: frontend

## Idea

Fix two logical bugs in `FavouritesContext.toggleFavourite`. First, the optimistic UI update (immediate state flip) is never reverted when the API call fails — the UI stays in the toggled state even though the server rejected it. Second, `setPendingIds` is never called, so `isPending(productId)` always returns `false` and the `FavouriteButton` is never disabled during an in-flight request, allowing duplicate requests via double-click. The fix adds `pendingIds` tracking around the fetch (add before, remove in `finally`), and adds a revert in the `catch` block using a functional updater so concurrent toggles on other products are not disturbed.

## Spec pointers

- `benchmark-frontend/instructions/TASK9.MD`: Full task description — objective, context, two bugs, requirements (revert on failure, mark in-flight, no double-state corruption), constraints, decision surfaces, expected file to modify, and success criteria.

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/context/FavouritesContext.tsx`: The only file that needs changing — contains `toggleFavourite` with both bugs (missing `setPendingIds` calls and missing revert in `catch` block).
- `src/benchmark-frontend/src/components/FavouriteButton.tsx`: Reads `isPending` and sets `disabled={pending}` — must NOT be modified, but its behaviour is a success criterion.
- `src/benchmark-frontend/src/pages/FavouritesPage.tsx`: Consumes the context — must NOT be modified.
- `src/benchmark-frontend/tests/`: Visible tests that must pass — must NOT be modified.
