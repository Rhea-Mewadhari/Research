# Milestone

Task: task9
Target: frontend

## Requirements addressed

- Req 1 — toggleFavourite adds id to favourites on success: verified — all 4 visible tests in favouriteRevert.test.tsx passed (21/21 total); "clicking the favourite button marks a product as a favourite" asserts aria-pressed="true".
- Req 2 — toggleFavourite removes id from favourites on success: verified — "clicking a favourited button removes the favourite" asserts aria-pressed="false"; 21/21 tests passed.
- Req 3 — optimistic add reverted on fetch rejection: verified — hidden test "a rejected fetch reverts the optimistic add" passed (9/9 hidden tests).
- Req 4 — optimistic remove reverted on fetch rejection: verified — hidden test "a rejected fetch reverts the optimistic remove" passed (9/9 hidden tests).
- Req 5 — isPending(id) true while fetch is in-flight, button disabled with "Loading" text: verified — hidden test "isPending is true while the request is in flight" passed; FavouriteButton reads isPending and renders disabled + sr-only Loading span.
- Req 6 — isPending(id) false and button not disabled after successful toggle: verified — all visible tests confirm buttons interactable after fetch resolves; hidden test "isPending is false after a successful toggle" passed.
- Req 7 — isPending(id) false and button not disabled after failed toggle: verified — hidden test "isPending is false after a failed toggle (finally cleanup)" passed; finally block clears pendingIds on both paths.
- Req 8 — failed toggle on product A does not alter isFavourite of product B: verified — hidden tests "a failure on product 1 does not revert a concurrent success on product 2" and "two concurrent failures each revert only their own product" passed; functional updater in catch prevents stale-snapshot overwrites.
- Req 9 — all visible tests pass: verified — pnpm test: 7 test files, 21 tests, 0 failures, exit 0.
- Req 10 — TypeScript build produces no type errors: verified — pnpm build: tsc -b + vite build succeeded, 65 modules transformed, exit 0.
- Req 11 — only FavouritesContext.tsx modified: verified — git diff --name-only shows only src/benchmark-frontend/src/context/FavouritesContext.tsx; FavouriteButton.tsx, FavouritesPage.tsx, and all test files unchanged.

## Files changed

- `src/benchmark-frontend/src/context/FavouritesContext.tsx`: added setPendingIds call before the try block to track in-flight requests; added functional-updater revert in the catch block to undo optimistic favouriteIds change on error; added finally block to clear pendingIds regardless of outcome.

## Checks

- pnpm test: 21 passed, 0 failed (7 test suites)
- pnpm run build: pass
