# Requirements

1. When `fetch` rejects inside `toggleFavourite`, the `catch` block must call `setFavouriteIds` with a functional updater that undoes the optimistic change: if `wasAdded === true`, the updater removes `productId` from the new Set; if `wasAdded === false`, the updater adds `productId` back.
   - Verified by: Code inspection of `src/benchmark-frontend/src/context/FavouritesContext.tsx` — the `catch` block contains `setFavouriteIds(prev => { const next = new Set(prev); if (wasAdded) next.delete(productId); else next.add(productId); return next; })` (or equivalent functional form using `wasAdded`).

2. The revert in the `catch` block must use a functional state updater (`setFavouriteIds(prev => ...)`) rather than closing over the pre-toggle `favouriteIds` snapshot, so that a concurrent successful toggle on a different product is not clobbered.
   - Verified by: Code inspection of `src/benchmark-frontend/src/context/FavouritesContext.tsx` — the `catch` block's `setFavouriteIds` call takes a callback argument, not a Set literal captured before the fetch.

3. Before the `fetch` call, `setPendingIds` must be called to add `productId` to `pendingIds`, making `isPending(productId)` return `true` during the request.
   - Verified by: Code inspection of `src/benchmark-frontend/src/context/FavouritesContext.tsx` — a `setPendingIds(prev => ...)` call that adds `productId` appears before the `await fetch(...)` line, outside any `try` block (or at the start of the `try` before `fetch`).

4. After the fetch settles (success or failure), `setPendingIds` must be called in a `finally` block to remove `productId` from `pendingIds`, making `isPending(productId)` return `false` once the request is done.
   - Verified by: Code inspection of `src/benchmark-frontend/src/context/FavouritesContext.tsx` — a `setPendingIds(prev => { const next = new Set(prev); next.delete(productId); return next; })` (or equivalent) call appears inside a `finally` block wrapping the `fetch` call, and is not duplicated in `try` or `catch`.

5. On a successful API call, the optimistic update is preserved — the product's favourite state remains in the toggled position after `fetch` resolves.
   - Verified by: `pnpm --filter benchmark-frontend test` passes all four tests in `tests/favouriteRevert.test.tsx`, which confirm that clicking a button toggles `aria-pressed` and favourited products appear on the favourites page.

6. No test file is modified and no file outside `src/benchmark-frontend/src/context/FavouritesContext.tsx` is changed.
   - Verified by: `git diff --name-only` shows exactly one changed file: `src/benchmark-frontend/src/context/FavouritesContext.tsx`.

7. All visible tests across the frontend suite pass.
   - Verified by: `pnpm --filter benchmark-frontend test` exits with code 0 and zero failing tests.

8. The TypeScript build produces no type errors.
   - Verified by: `pnpm --filter benchmark-frontend build` (or `pnpm exec tsc --noEmit` run from `src/benchmark-frontend`) exits with code 0.

## Edge cases

- Concurrent toggle on a different product while product A's request is in flight: covered by requirement 2 — the functional updater reads from `prev` (latest state), so product B's successful toggle is not overwritten when product A reverts.
- Fetch rejects after a successful toggle on the same product in a prior call: covered by requirement 1 — `wasAdded` is captured synchronously before the optimistic update, so the revert targets the correct direction for this specific call.
- Request succeeds: the `catch` block does not run, so requirement 1 does not execute and the optimistic state is kept — covered by requirement 5.
- Request fails: the `finally` block still runs after `catch`, so `pendingIds` is cleaned up — covered by requirement 4.
