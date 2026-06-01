# Task 4: Frontend Refactoring

## Objective

Improve the structure and maintainability of the product filtering implementation without changing its behavior.

---

## Context

The current implementation works and tests pass, but the code has structural issues that make it harder to maintain.

---

## Requirements

### 1. Separation of concerns
- Filter and sort logic belongs in `src/utils/productFilters.ts`, not inside components
- Components should call utility functions — not re-implement filtering inline
- `App.tsx` should own filter state; components should receive values and callbacks as props

### 2. Reusability
- Extract any repeated logic into named utility functions
- If logic is duplicated between `FilterPanel.tsx` and `productFilters.ts`, consolidate it

### 3. Readability
- Rename variables or functions whose names don't describe what they do
- Break up any functions that do too many things

### 4. Dead code
- Remove unused imports, variables, or functions

---

## Constraints

- Do NOT change functionality
- Do NOT break existing tests
- Do NOT introduce new dependencies

---

## Expected Refactoring Areas

- `src/utils/productFilters.ts`
- `src/components/FilterPanel.tsx`
- `src/components/SortSelect.tsx`
- `src/App.tsx`

---

## Success Criteria

- All tests still pass
- Filter and sort logic lives in `productFilters.ts`, not in component bodies
- No unused imports or dead code
- No behavior regression
