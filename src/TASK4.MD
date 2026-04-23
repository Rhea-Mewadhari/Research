# Task 4: Frontend Refactoring

## Objective

Improve the structure and maintainability of the product filtering implementation without changing its behavior.

---

## Context

The current implementation works but may contain:
- duplicated logic
- tightly coupled components
- poor separation of concerns

---

## Requirements

Refactor the code to improve:

### 1. Separation of concerns
- Move logic out of components where appropriate
- Keep UI components focused on rendering

### 2. Reusability
- Extract reusable logic into utilities or hooks

### 3. Readability
- Improve naming
- simplify complex logic

### 4. Maintainability
- Reduce duplication
- improve structure

---

## Constraints

- Do NOT change functionality
- Do NOT break existing tests
- Do NOT introduce new dependencies

---

## Expected Refactoring Areas

- `productFilters.ts`
- component logic in FilterPanel / SortSelect
- state handling in App

---

## Success Criteria

- All tests still pass
- Code is cleaner and easier to follow
- No regression in behavior