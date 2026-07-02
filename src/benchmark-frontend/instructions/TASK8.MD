# Task 8: Logical Bug — Debounce Implementation

## Objective

Fix the debounce wiring in `FilterContext` so that search filtering is delayed by 300 ms after the last keystroke, and clearing the search field bypasses the debounce and applies immediately.

---

## Context

The codebase has a `useDebounce` hook that accepts a value and a delay in milliseconds. `FilterContext` uses this hook to derive `debouncedSearch`, which `useFilteredProducts` reads when filtering products. This architecture is intentional and correct.

However, two bugs have been introduced:

1. **No real debounce**: The delay argument passed to `useDebounce` is `0`, so `debouncedSearch` updates on every keystroke with no delay. The product list re-filters on every character typed rather than waiting until the user pauses.

2. **No instant clear**: When the user clears the search field, `debouncedSearch` should reset to `''` immediately so the full product list reappears at once. Currently it is treated like any other change and goes through the same (broken) delay path.

---

## Requirements

### 1. 300 ms debounce on typing

Typing in the search field must not trigger a filter update until 300 ms after the last keystroke. The `useDebounce` hook already supports configurable delays via its `delayMs` parameter; the fix is in how `FilterContext` calls the hook.

### 2. Immediate update on clear

When `search` is set to `''`, `debouncedSearch` must become `''` immediately — no 300 ms wait. Any pending debounce timeout that would have applied a stale non-empty value must not fire after a clear.

### 3. No memory leaks on unmount

If the component unmounts while a debounce timeout is pending, that timeout must be cancelled. (`useDebounce` already does this via its `useEffect` cleanup — verify your changes do not break it.)

---

## Constraints

- Do not add new dependencies
- Do not change the public interface of `FilterContext` (its exported functions and the shape of its context value must remain the same)
- Do not modify `useFilteredProducts.ts`
- Keep `useDebounce` generic — it must continue to accept any value type and delay

---

## Decision surfaces

- **Where the 300 constant lives**: It belongs in the `useDebounce` call inside `FilterContext`, not inside the hook itself nor in a consuming component.
- **How to detect "clear" vs "type"**: Several valid approaches exist — a conditional delay expression (`search === '' ? 0 : 300`), a derived value override (`search === '' ? '' : rawDebounced`), or adding an `immediate` flag to the hook. Choose one and apply it consistently.
- **Unmount cleanup**: `useDebounce` cancels pending timeouts via `clearTimeout` in its `useEffect` cleanup. If you modify the hook, preserve this behaviour.

---

## Expected Files to Modify

- `src/context/FilterContext.tsx`
- `src/hooks/useDebounce.ts` *(optional — only if your chosen approach requires it)*

---

## Success Criteria

1. Typing a search term does not filter products until 300 ms after the last keystroke
2. Clearing the search field immediately shows all matching products — no timer delay
3. Rapid keypresses reset the 300 ms window (only the last value is applied)
4. No state-update-on-unmounted-component warning when the component unmounts while a debounce is pending
5. All other filters (category, in-stock toggle, sort) continue to work correctly
6. All visible tests pass and the build succeeds
