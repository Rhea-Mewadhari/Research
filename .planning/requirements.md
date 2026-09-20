# Requirements

1. When `fetch` rejects (any error) during an **add** (`wasAdded === true`), `toggleFavourite` must remove `productId` from `favouriteIds`, restoring the pre-toggle state.
   - Verified by: `tests/favouriteRevert.test.tsx` (full suite passes); and in `FavouritesContext.tsx` the `catch` block must call `setFavouriteIds` with a functional updater that deletes `productId` when `wasAdded` is `true`.

2. When `fetch` rejects (any error) during a **remove** (`wasAdded === false`), `toggleFavourite` must re-add `productId` to `favouriteIds`, restoring the pre-toggle state.
   - Verified by: `tests/favouriteRevert.test.tsx` (full suite passes); and in `FavouritesContext.tsx` the `catch` block must call `setFavouriteIds` with a functional updater that adds `productId` when `wasAdded` is `false`.

3. The revert in the `catch` block must use a **functional updater** (`setFavouriteIds(prev => ...)`) rather than capturing the entire `favouriteIds` Set at call time, so that a concurrent successful toggle on a different product is not overwritten.
   - Verified by: code inspection of `src/benchmark-frontend/src/context/FavouritesContext.tsx` — the `catch` block must pass a callback to `setFavouriteIds`, never a literal `Set` value constructed from a closure variable captured before the optimistic update.

4. `toggleFavourite` must call `setPendingIds` to **add** `productId` before the `fetch` call, so that `isPending(productId)` returns `true` while the request is in flight.
   - Verified by: `tests/favouriteRevert.test.tsx` (full suite passes); and code inspection confirms `setPendingIds(prev => new Set(prev).add(productId))` (or equivalent functional form) appears before the `fetch` call in `FavouritesContext.tsx`.

5. `toggleFavourite` must call `setPendingIds` to **remove** `productId` in a `finally` block (after both success and failure paths), so that `isPending(productId)` returns `false` once the request completes.
   - Verified by: code inspection of `FavouritesContext.tsx` confirms a `finally` block exists containing `setPendingIds(prev => { const next = new Set(prev); next.delete(productId); return next; })` (or equivalent), and the cleanup does **not** appear duplicated in both `try` and `catch` branches.

6. While `toggleFavourite` is in flight for `productId`, `FavouriteButton` for that product must be rendered as `disabled`.
   - Verified by: `tests/favouriteRevert.test.tsx` (full suite passes) — `FavouriteButton.tsx` already reads `isPending` and applies `disabled={pending}`; this requirement is satisfied automatically once requirement 4 is met. No change to `FavouriteButton.tsx` is permitted.

7. Only `src/benchmark-frontend/src/context/FavouritesContext.tsx` is modified; `FavouriteButton.tsx`, `FavouritesPage.tsx`, and all files under `tests/` are left unchanged.
   - Verified by: `git diff --name-only` shows exactly one changed file: `src/benchmark-frontend/src/context/FavouritesContext.tsx`.

8. The TypeScript build for `benchmark-frontend` completes without errors.
   - Verified by: `pnpm --filter benchmark-frontend build` exits with code 0 and produces no TypeScript diagnostic output.

9. All visible tests in `src/benchmark-frontend/tests/` pass.
   - Verified by: `pnpm --filter benchmark-frontend test --run` (or `vitest run` inside the package) exits with code 0 and reports 0 failures.

---

## Edge cases

- **Concurrent toggles on different products**: A failure on product A reverts only A — covered by requirement 3 (functional updater prevents stale Set overwrite).
- **Second toggle on same in-flight product**: Button is disabled (`disabled={pending}`) while the first request is in flight; if a second call somehow reaches `toggleFavourite` for the same `productId`, adding an already-present id to a `Set` is a no-op and the `finally` cleanup correctly removes it once. Covered by requirements 4 and 5.
- **Server returns non-2xx but `fetch` does not reject**: The current implementation does not inspect `response.ok`; the task spec only requires handling `fetch` rejections (network error, etc.), so non-throwing 4xx/5xx are out of scope and must not be guarded against (to avoid over-engineering). Covered by requirement 1 and 2 (catch block scope).
- **`finally` ordering relative to `catch`**: `catch` reverts state, `finally` removes pending — both execute on failure. Covered by requirements 2 and 5.
