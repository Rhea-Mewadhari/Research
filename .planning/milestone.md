# Milestone

Task: task9
Target: frontend

## Requirements addressed

- Req 1 (fetch success retains optimistic change): verified — all 4 tests in tests/favouriteRevert.test.tsx passed; full suite 21 passed (21), exit code 0.
- Req 2 (catch block reverts optimistic change for affected product only): verified — FavouritesContext.tsx lines 75-85 contain setFavouriteIds functional updater that conditionally deletes or re-adds productId based on wasAdded.
- Req 3 (catch revert uses functional updater, not captured snapshot): verified — setFavouriteIds((prev) => { ... }) form confirmed at lines 76-84; no captured snapshot used.
- Req 4 (productId added to pendingIds before fetch, functional updater): verified — setPendingIds((prev) => new Set(prev).add(productId)) at line 61, after optimistic update and before fetch calls.
- Req 5 (productId removed from pendingIds unconditionally in finally block): verified — finally block at lines 86-91 calls setPendingIds with delete; no duplication in try or catch.
- Req 6 (only FavouritesContext.tsx modified): verified — git diff --name-only returned no output; FavouriteButton.tsx and FavouritesPage.tsx unchanged.
- Req 7 (TypeScript build succeeds): verified — pnpm --filter benchmark-frontend build exited 0; 65 modules transformed, no type errors.
- Req 8 (all visible tests pass): verified — pnpm --filter benchmark-frontend test: 7 test files passed, 21 tests passed, exit code 0.

## Files changed

- src/benchmark-frontend/src/context/FavouritesContext.tsx: Added setPendingIds call before fetch to mark product as in-flight; added functional-updater revert in catch block; added finally block to unconditionally clean up pendingIds.

## Checks

- pnpm test: 21 passed, 0 failed
- pnpm run build: pass
