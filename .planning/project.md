# Project

Task: task9
Target: frontend

## Idea

Fix two logical bugs in `FavouritesContext.toggleFavourite`: (1) when the API call fails, the optimistic UI update is not reverted — the favourite state stays toggled regardless of server rejection; and (2) `setPendingIds` is never called, so `isPending(productId)` always returns `false`, meaning `FavouriteButton` is never disabled during in-flight requests. The fix must add the product ID to `pendingIds` before the fetch, revert the optimistic state change on error using the pre-captured `wasAdded` flag (not the whole Set snapshot, to avoid concurrent-toggle corruption), and remove the product from `pendingIds` in a `finally` block.

## Spec pointers

- `src/benchmark-frontend/instructions/TASK9.MD`: full requirements — revert on failure, `isPending` tracking, no double-state corruption, constraints (do not modify FavouriteButton.tsx / FavouritesPage.tsx), and success criteria

## Affected areas (initial read, not final)

- `src/benchmark-frontend/src/context/FavouritesContext.tsx`: the only file that needs to change — `toggleFavourite` callback contains both bugs (no `setPendingIds` call, no revert in catch block)
- `src/benchmark-frontend/tests/favouriteRevert.test.tsx`: visible test file that exercises these exact scenarios (revert on failure, isPending tracking)
- `src/benchmark-frontend/src/components/FavouriteButton.tsx`: read-only reference — already reads `isPending` and applies `disabled`; must not be modified
- `src/benchmark-frontend/src/pages/FavouritesPage.tsx`: read-only reference — must not be modified
