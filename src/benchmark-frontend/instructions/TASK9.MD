# Task 9: Logical Bug — Optimistic UI Revert on Error

## Objective

Fix `FavouritesContext.toggleFavourite` so that a failed API call reverts the optimistic UI update for the affected product only, and so that `isPending` correctly tracks in-flight requests.

---

## Context

`FavouritesContext` implements an optimistic UI pattern: when the user clicks a favourite button the UI updates immediately, and a background API call persists the change. This architecture is intentional.

Two bugs have been introduced:

1. **No revert on failure**: When the API call fails, the favourite state stays in the toggled position — the heart appears filled when the server rejected the add, or empty when it rejected the delete. The `catch` block only sets an error message; it does not undo the optimistic change.

2. **`isPending` is never set**: `setPendingIds` is never called to mark a product as in-flight, so `isPending(productId)` always returns `false`. As a result, `FavouriteButton` is never disabled during the request — users can double-click and fire duplicate requests.

---

## Requirements

### 1. Revert on failure

When `fetch` rejects (network error, server 5xx, etc.), the optimistic state change must be undone:

- If the product was being added (`wasAdded === true`), remove it from `favouriteIds` on failure.
- If the product was being removed (`wasAdded === false`), re-add it to `favouriteIds` on failure.

The revert must apply only to the product that failed. A concurrent successful toggle on a different product must not be affected.

### 2. Mark in-flight requests

Before the `fetch` call, add the `productId` to `pendingIds`. After the request completes — whether it succeeds or fails — remove it. A `finally` block is the right place for the cleanup.

### 3. No double state for the same product

If the user somehow triggers a second toggle on the same product while the first is still in flight (button should be disabled, but treat this defensively), the second call must not corrupt the first call's revert data.

---

## Constraints

- Do not modify `FavouriteButton.tsx` — it already reads `isPending` and sets `disabled={pending}`
- Do not modify `FavouritesPage.tsx`
- Do not add new dependencies
- Keep the public interface of `FavouritesContext` unchanged

---

## Decision surfaces

- **Where to store pre-optimistic state for revert**: Capture `wasAdded` before the optimistic update and use it in the `catch` block via a functional state updater. Do not capture the entire `favouriteIds` Set — that snapshot goes stale if other products are toggled concurrently.
- **`try/catch` vs `.catch()`**: Either is valid. The revert logic must be in the error path.
- **`finally` for cleanup**: Use a `finally` block to remove the `productId` from `pendingIds`. Avoid duplicating the cleanup in both the `try` and `catch` branches.

---

## Expected Files to Modify

- `src/context/FavouritesContext.tsx`

---

## Success Criteria

1. Toggling a favourite when the API succeeds keeps the new state
2. Toggling a favourite when the API fails reverts back to the original state
3. A failure on product A does not change the favourite state of product B
4. `isPending(productId)` returns `true` while the toggle request is in flight
5. `isPending(productId)` returns `false` after the request completes (success or failure)
6. `FavouriteButton` is disabled while the request is in flight
7. All visible tests pass and the build succeeds
