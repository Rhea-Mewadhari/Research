# Project

Task: task9
Target: frontend

## Idea

Fix two logical bugs in `FavouritesContext.toggleFavourite`. The context already implements an optimistic UI pattern (UI updates immediately before the API call), but two things are broken: (1) when the API call fails, the optimistic change is never reverted — the UI stays in the toggled state instead of rolling back to the original; and (2) `setPendingIds` is never called, so `isPending(productId)` always returns `false`, which means `FavouriteButton` is never disabled during the in-flight request, allowing duplicate concurrent toggles. The fix requires capturing `wasAdded` before the optimistic update, using a functional state updater in the `catch` block to revert only the failed product, adding the `productId` to `pendingIds` before the fetch, and removing it in a `finally` block regardless of success or failure.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK9.MD`: Full task description — objective, context, requirements (revert on failure, mark in-flight, no double-state corruption), constraints (don't modify FavouriteButton.tsx or FavouritesPage.tsx), decision surfaces, and success criteria.

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/context/FavouritesContext.tsx`: The only file that needs modification — contains `toggleFavourite`, `setPendingIds`, and the optimistic update logic with the broken `catch` and missing `pendingIds` management.
- `src/benchmark-frontend/tests/`: Visible tests that must pass after the fix (read-only, must not be modified).
