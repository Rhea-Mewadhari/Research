# Requirements

1. After `toggleFavourite(id)` resolves successfully when `id` was not previously a favourite, `isFavourite(id)` returns `true` and the button renders with `aria-pressed="true"`.
   - Verified by: visible test "clicking the favourite button marks a product as a favourite" in `tests/favouriteRevert.test.tsx` passes under `pnpm test`.

2. After `toggleFavourite(id)` resolves successfully when `id` was previously a favourite, `isFavourite(id)` returns `false` and the button renders with `aria-pressed="false"`.
   - Verified by: visible test "clicking a favourited button removes the favourite" in `tests/favouriteRevert.test.tsx` passes under `pnpm test`.

3. After `toggleFavourite(id)` rejects (any thrown error or rejected promise) when `id` was not previously a favourite, `isFavourite(id)` returns `false` — the optimistic add is undone.
   - Verified by: hidden test that mocks `fetch` to reject and asserts the button's `aria-pressed` attribute is `"false"` after the promise settles.

4. After `toggleFavourite(id)` rejects when `id` was previously a favourite, `isFavourite(id)` returns `true` — the optimistic remove is undone.
   - Verified by: hidden test that mocks `fetch` to reject and asserts the button's `aria-pressed` attribute is `"true"` after the promise settles.

5. Between the moment `toggleFavourite(id)` is called and the moment `fetch` settles, `isPending(id)` returns `true` and `FavouriteButton` for that product renders with the `disabled` attribute and visible "Loading" sr-only text.
   - Verified by: hidden test that holds `fetch` in a pending state (unresolved Promise) and asserts the button has `disabled` and contains a "Loading" span before resolving.

6. After `toggleFavourite(id)` resolves successfully, `isPending(id)` returns `false` and the button does not have the `disabled` attribute.
   - Verified by: all visible tests in `tests/favouriteRevert.test.tsx` pass (buttons must be interactable after the mocked `fetch` resolves); `disabled` attribute absent confirmed by RTL `not.toBeDisabled()` in hidden tests.

7. After `toggleFavourite(id)` rejects, `isPending(id)` returns `false` and the button does not have the `disabled` attribute.
   - Verified by: hidden test that mocks `fetch` to reject and asserts button is not disabled after rejection settles.

8. A failed toggle on product A does not alter the `isFavourite` state of product B whose concurrent toggle completed successfully. Both buttons reflect their own independent outcomes.
   - Verified by: hidden test that fires two concurrent `toggleFavourite` calls, mocking one to succeed and one to fail, then asserts each button's `aria-pressed` matches the expected independent outcome.

9. All visible tests in `src/benchmark-frontend/tests/` pass.
   - Verified by: `pnpm test` run from `src/benchmark-frontend/` exits with code 0 and all test suites report no failures.

10. The TypeScript build produces no type errors.
    - Verified by: `pnpm build` run from `src/benchmark-frontend/` exits with code 0.

11. Only `src/benchmark-frontend/src/context/FavouritesContext.tsx` is modified — no changes to `FavouriteButton.tsx`, `FavouritesPage.tsx`, or any file under `tests/`.
    - Verified by: `git diff --name-only` shows exactly `src/benchmark-frontend/src/context/FavouritesContext.tsx` and no other files.

## Edge cases

- **Rapid double-click on same button**: `FavouriteButton` is already `disabled` while `isPending(id)` is `true` (requirement 5), blocking a second click at the UI level. If `toggleFavourite` is nonetheless called twice for the same `id` concurrently, the revert logic in the `catch` block must use a functional state updater (operating on the latest state at revert time) rather than a stale snapshot captured before the first optimistic update — covered by requirement 8.

- **Error message preserved**: The existing `setError(...)` call in the `catch` block must remain so the error is surfaced to the UI; the fix only adds the revert `setFavouriteIds` call alongside it — covered implicitly by requirement 11 (no unrelated behaviour is changed).

- **`finally` cleanup, not duplicated try/catch cleanup**: `setPendingIds` removal must appear in a `finally` block so it fires regardless of success or failure — requirements 6 and 7 together enforce this: pending must be cleared in both paths without duplicating the cleanup code.

- **Functional updater for concurrent-safe revert**: The `catch` block must call `setFavouriteIds(prev => ...)` to operate on the latest state, not restore a stale full-Set snapshot captured before the optimistic update — covered by requirement 8 (a snapshot revert would overwrite concurrently-settled toggles).
