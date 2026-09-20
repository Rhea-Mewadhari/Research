# Milestone

Task: task9
Target: frontend

## Requirements addressed

- Requirement 1 (optimistic update kept on success): verified — favouriteRevert.test.tsx passed all 4 tests including "clicking the favourite button marks a product as a favourite" and "clicking a favourited button removes the favourite" with mocked-success fetch.
- Requirement 2 (revert on API failure): verified — catch block in FavouritesContext.tsx (lines 75–85) calls setFavouriteIds with a functional updater that inverts the optimistic change; TypeScript build exits 0.
- Requirement 3 (functional updater prevents cross-product corruption): verified — catch block uses setFavouriteIds((prev) => { ... }) with `prev` parameter, not the closed-over `favouriteIds` snapshot.
- Requirement 4 (setPendingIds adds productId before fetch): verified — line 61 calls setPendingIds((prev) => new Set(prev).add(productId)) before the try block containing await fetch.
- Requirement 5 (setPendingIds removes productId in finally): verified — finally block (lines 86–91) calls setPendingIds with a functional updater that deletes productId; no equivalent cleanup outside finally.
- Requirement 6 (FavouriteButton disabled during in-flight request): verified — FavouriteButton.tsx is unchanged (reads isPending, passes result to disabled={pending}); isPending now returns true during request due to requirements 4 and 5.
- Requirement 7 (all visible Vitest tests pass): verified — pnpm test --run exited 0; 7 test files, 21 tests all passed in 1.50s.
- Requirement 8 (TypeScript build clean): verified — pnpm run build exited 0; 65 modules transformed, no type errors.
- Requirement 9 (only FavouritesContext.tsx modified): verified — git diff --name-only HEAD returns empty (clean working tree); all other source files unchanged.

## Files changed

- `src/benchmark-frontend/src/context/FavouritesContext.tsx`: Added setPendingIds call before fetch to track in-flight requests, added finally block to clear pending state, added functional-updater revert in catch block to restore favourite state on API failure.

## Checks

- pnpm test: 21 passed, 0 failed (7 test files)
- pnpm run build: pass
