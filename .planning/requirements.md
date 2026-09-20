# Requirements

1. When `fetch` succeeds, `favouriteIds` retains the optimistically applied change: adding a product keeps it in the set; removing a product keeps it absent.
   - Verified by: all four tests in `tests/favouriteRevert.test.tsx` pass (`pnpm --filter benchmark-frontend test` exits 0)

2. When `fetch` rejects (network error or thrown exception), the catch block reverts the optimistic change for the affected product only:
   - If `wasAdded === true` (product was being added), `setFavouriteIds` removes that `productId` from the set.
   - If `wasAdded === false` (product was being removed), `setFavouriteIds` re-adds that `productId` to the set.
   - Verified by: code inspection of `src/context/FavouritesContext.tsx` — the `catch` block must contain a `setFavouriteIds` call whose functional updater conditionally adds or removes `productId` based on `wasAdded`.

3. The revert in the catch block uses a functional state updater (`setFavouriteIds(prev => ...)`) — not a captured snapshot of `favouriteIds` — so that concurrent successful toggles on other products are not overwritten.
   - Verified by: code inspection of `FavouritesContext.tsx` — the `setFavouriteIds` call inside the catch block must be in the functional-updater form `(prev) => { ... }`, not `setFavouriteIds(capturedSnapshot)`.

4. `productId` is added to `pendingIds` before the `fetch` call, using a functional updater: `setPendingIds(prev => new Set(prev).add(productId))` (or equivalent that does not mutate `prev`).
   - Verified by: code inspection of `FavouritesContext.tsx` — a `setPendingIds` call adding the id must appear between the optimistic `setFavouriteIds` update and the `fetch` call.

5. `productId` is removed from `pendingIds` unconditionally after the request completes, inside a `finally` block: `setPendingIds(prev => { const next = new Set(prev); next.delete(productId); return next; })` (or equivalent).
   - Verified by: code inspection of `FavouritesContext.tsx` — a `finally` block must exist that calls `setPendingIds` to delete the `productId`; the cleanup must not be duplicated in both `try` and `catch` branches.

6. The only file modified is `src/context/FavouritesContext.tsx`; `FavouriteButton.tsx` and `FavouritesPage.tsx` are unchanged.
   - Verified by: `git diff --name-only` lists only `src/benchmark-frontend/src/context/FavouritesContext.tsx` (or no frontend files outside that path).

7. The TypeScript build succeeds with no type errors.
   - Verified by: `pnpm --filter benchmark-frontend build` exits with code 0.

8. All visible tests pass.
   - Verified by: `pnpm --filter benchmark-frontend test` exits with code 0, with all tests in `tests/favouriteRevert.test.tsx` (and any other test files) reporting pass.

---

## Edge cases

- **Concurrent toggles on different products**: covered by requirement 3 — functional updater in the catch block ensures revert touches only `productId`, not the entire set snapshot.
- **`finally` runs on success too**: covered by requirement 5 — `productId` is correctly removed from `pendingIds` whether the fetch succeeded or failed; no stale pending state remains.
- **`wasAdded` captured before optimistic update**: the variable must be read from `favouriteIds` before `setFavouriteIds` is called, so it reflects the pre-toggle state. Covered by requirement 2 — the revert logic depends on this value being correct.
- **Second toggle while first is in-flight**: `FavouriteButton` reads `isPending` and sets `disabled={pending}`, which is already wired in the unmodified `FavouriteButton.tsx`; once requirement 4 is satisfied `isPending` returns `true` during the request, making the button disabled and preventing a second click. Covered by requirements 4 and 5.
