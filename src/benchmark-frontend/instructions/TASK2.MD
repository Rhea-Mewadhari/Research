# Task 2: Frontend Logical Bug Fix

## Objective

The product filtering feature is implemented, but contains logical issues.

Your task is to identify and fix incorrect behavior in filtering and sorting so that the application behaves correctly and all tests pass.

---

## Context

The product filtering feature is implemented, but has logical bugs. Observable incorrect behaviors include:

- Searching for a lowercase term (e.g. `wireless`) returns no results, even when a matching product exists
- A search term with surrounding spaces returns no results
- Selecting a category and then enabling in-stock filtering shows incorrect results — one filter overrides the other
- Sorted results are not in the expected order
- Clicking "Clear filters" does not fully reset all filter state

---

## Requirements

Fix the implementation so that:

### 1. Filters combine correctly
- Search, category, and in-stock filters must all apply together
- Applying one filter must not override or reset others

### 2. Search behavior
- Must be case-insensitive
- Must ignore leading/trailing whitespace in the input value
- Must only match against product name

### 3. Category filter
- Selecting `All` must show all products
- Selecting a specific category must strictly match that category

### 4. In-stock filter
- Must exclude all `inStock === false` items when enabled

### 5. Sorting
- Sorting must be applied **after filtering**
- Sorting must not mutate the original dataset
- Default sort must preserve original order

### 6. Clear filters
- Must reset ALL filter fields including sorting

---

## Constraints

- Do not rewrite the entire app
- Do not introduce new libraries
- Keep changes minimal and focused
- Preserve component structure

---

## Expected Files to Modify

- `src/utils/productFilters.ts`
- Possibly minor fixes in components

---

## Success Criteria

- All tests pass
- Combined filters behave correctly
- Sorting is stable and correct
- No regressions in basic functionality