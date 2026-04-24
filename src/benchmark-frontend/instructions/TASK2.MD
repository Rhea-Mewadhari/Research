# Task 2: Frontend Logical Bug Fix

## Objective

The product filtering feature is implemented, but contains logical issues.

Your task is to identify and fix incorrect behavior in filtering and sorting so that the application behaves correctly and all tests pass.

---

## Context

The application allows users to:
- search products
- filter by category
- filter by in-stock status
- sort results

However, some combinations of filters and sorting produce incorrect results.

---

## Requirements

Fix the implementation so that:

### 1. Filters combine correctly
- Search, category, and in-stock filters must work together
- Applying one filter must not override or reset others

### 2. Search behavior
- Must be case-insensitive
- Must ignore leading/trailing whitespace
- Must only match against product name

### 3. Category filter
- Selecting `All` must not filter anything
- Selecting a category must strictly match that category

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