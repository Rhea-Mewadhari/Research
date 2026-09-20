# Milestone

Task: task9
Target: frontend

## Requirements addressed

- Req 1 (revert on add failure): verified — catch block calls `setFavouriteIds` with functional updater that deletes `productId` when `wasAdded===true`; 4/4 favouriteRevert tests passed.
- Req 2 (revert on remove failure): verified — catch block calls `setFavouriteIds` with functional updater that adds `productId` when `wasAdded===false`; 4/4 favouriteRevert tests passed.
- Req 3 (functional updater in catch): verified — catch block uses `setFavouriteIds((prev) => { const next = new Set(prev); ... return next; })`, never a closure-captured Set literal.
- Req 4 (setPendingIds add before fetch): verified — `setPendingIds((prev) => new Set(prev).add(productId))` at line 61, before the try block; all tests passed.
- Req 5 (setPendingIds remove in finally): verified — `finally { setPendingIds((prev) => { const next = new Set(prev); next.delete(productId); return next; }); }` at lines 86–91; cleanup only in finally, not duplicated in try/catch.
- Req 6 (FavouriteButton disabled while in-flight): verified — FavouriteButton.tsx already reads `isPending(productId)` and applies `disabled={pending}`; satisfied automatically by Req 4; all tests passed.
- Req 7 (only FavouritesContext.tsx modified): verified — `git diff --name-only` shows working tree clean; FavouriteButton.tsx, FavouritesPage.tsx, and tests/ are unchanged.
- Req 8 (TypeScript build passes): verified — `pnpm build` (tsc -b && vite build) exited with code 0; 65 modules transformed, no TS diagnostics.
- Req 9 (all visible tests pass): verified — `pnpm test --run` exited with code 0; Test Files 7 passed (7), Tests 21 passed (21), 0 failures.

## Files changed

- `src/benchmark-frontend/src/context/FavouritesContext.tsx`: Added `setPendingIds` call before fetch (Req 4), added `catch` block with functional-updater revert of `favouriteIds` (Reqs 1–3), added `finally` block that removes `productId` from `pendingIds` (Req 5).

## Checks

- pnpm test: 21 passed, 0 failed
- pnpm run build: pass
