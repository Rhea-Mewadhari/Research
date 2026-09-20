# Project

Task: task9
Target: frontend

## Idea

Fix two bugs in `FavouritesContext.toggleFavourite`: (1) when a fetch call fails, the optimistic UI update must be reverted so the favourite state returns to what it was before the toggle — using a functional state updater with the captured `wasAdded` flag so concurrent toggles on other products are unaffected; (2) `setPendingIds` must be called before the fetch to mark the product as in-flight, and removed in a `finally` block so `isPending(productId)` correctly returns `true` during the request and `false` after it completes, keeping `FavouriteButton` disabled while the request is outstanding.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK9.MD`: full bug description, requirements, constraints, decision surfaces, and success criteria for the optimistic-UI revert and `isPending` fixes

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/context/FavouritesContext.tsx`: the only file to modify — contains `toggleFavourite` with both bugs (missing `setPendingIds` calls and missing revert logic in the catch block)
- `src/benchmark-frontend/tests/`: visible tests that must pass (read-only, must not be modified)
