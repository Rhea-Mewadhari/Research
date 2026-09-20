# Requirements

1. When the API call succeeds, the optimistic favourite state change is kept — `isFavourite(productId)` returns `true` after a successful add and `false` after a successful remove.
   - Verified by: `pnpm --filter benchmark-frontend test` — `favouriteRevert.test.tsx` "clicking the favourite button marks a product as a favourite" and "clicking a favourited button removes the favourite" pass with a mocked-success fetch.

2. When the API call fails (fetch rejects), the optimistic state change is reverted: if the product was being added it is removed from `favouriteIds`, and if it was being removed it is re-added.
   - Verified by: Code inspection of `FavouritesContext.tsx` confirms the `catch` block calls `setFavouriteIds` with a functional updater that inverts the optimistic change (adds back if `wasAdded === false`, deletes if `wasAdded === true`). TypeScript build (`pnpm --filter benchmark-frontend build`) exits 0 with no type errors.

3. A failed toggle on product A does not alter the favourite state of product B. The revert must use a functional state updater (`prev => ...`) rather than a closed-over snapshot of `favouriteIds`, so that concurrent updates from other products are preserved.
   - Verified by: Code inspection of the `catch` block in `FavouritesContext.tsx` confirms it calls `setFavouriteIds(prev => ...)` with a functional updater rather than closing over the `favouriteIds` variable captured at the time of the toggle call.

4. `setPendingIds` is called to add `productId` to `pendingIds` before the `fetch` call begins, so `isPending(productId)` returns `true` while the request is in flight.
   - Verified by: Code inspection of `FavouritesContext.tsx` confirms `setPendingIds(prev => new Set(prev).add(productId))` (or equivalent functional updater) appears in `toggleFavourite` before the `await fetch(...)` call.

5. `setPendingIds` is called to remove `productId` from `pendingIds` after the request completes — whether it succeeds or fails — so `isPending(productId)` returns `false` once the request is done. This cleanup must be in a `finally` block, not duplicated in both `try` and `catch` branches.
   - Verified by: Code inspection of `FavouritesContext.tsx` confirms a `finally` block exists that calls `setPendingIds(prev => { const next = new Set(prev); next.delete(productId); return next; })` (or equivalent), and that no equivalent cleanup exists outside `finally`.

6. `FavouriteButton` is rendered with `disabled` attribute while the request is in flight, preventing double-click. No change to `FavouriteButton.tsx` is required — it already reads `isPending(productId)` and passes the result to `disabled`.
   - Verified by: `FavouriteButton.tsx` is unchanged (git diff shows no modifications to that file). Requirement 4 ensures `isPending` returns `true` during the request, which flows to `disabled={pending}` in the existing button.

7. All visible Vitest tests in `src/benchmark-frontend/tests/` pass without modification.
   - Verified by: `pnpm --filter benchmark-frontend test --run` exits 0 with all test suites green.

8. The TypeScript build of `benchmark-frontend` completes without errors.
   - Verified by: `pnpm --filter benchmark-frontend build` exits 0.

9. Only `src/benchmark-frontend/src/context/FavouritesContext.tsx` is modified; no test files, no other source files are changed.
   - Verified by: `git diff --name-only` lists only `src/benchmark-frontend/src/context/FavouritesContext.tsx`.

## Edge cases

- Concurrent successful toggle on product B while product A's toggle is failing: covered by requirement 3 (functional updater preserves B's state).
- Network error (fetch rejects outright, not a non-ok response): covered by requirement 2 — the `catch` block triggers on any fetch rejection.
- Request that completes successfully followed by a request that fails for the same product: each call captures `wasAdded` before its own optimistic update, and the functional updater in `catch` reverts only the specific change for that invocation; covered by requirements 2 and 3.
- `finally` block always runs even if `catch` re-throws: requirement 5 mandates cleanup is in `finally`, satisfying this by construction.
