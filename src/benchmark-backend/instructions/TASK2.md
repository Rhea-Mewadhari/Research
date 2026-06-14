# Task 2: Refactoring — Backend Service Layer

## Objective

Improve the structure and maintainability of the product service layer without changing its behaviour.

---

## Context

The current implementation works and all tests pass, but the code has structural issues that make it harder to maintain and extend.

---

## Requirements

### 1. Separation of concerns
- Filtering logic (search, category, inStock) belongs in a dedicated helper — not inlined inside `getAllProducts`
- Sorting logic belongs in a dedicated helper — not inlined inside `getAllProducts`
- `getAllProducts` should be a thin orchestrator: fetch → filter → sort → paginate → return

### 2. Dead code removal
- Remove unused exports and variables
- Remove any constants defined but never referenced

### 3. Readability
- Replace redundant boolean checks (`=== true`, `!== undefined`) with idiomatic equivalents
- Ensure sort logic uses a consistent, readable structure

### 4. No regressions
- All existing tests must continue to pass
- The response envelope shape must not change
- Do not modify `queryParser.ts`, `auth.ts`, or route/controller files

---

## Expected Refactoring Areas

- `src/services/productService.ts` — extract filter and sort helpers, remove dead code

---

## Success Criteria

- All tests still pass
- Filtering and sorting logic each live in their own named helper function, not inline in `getAllProducts`
- No unused exports or dead variables remain
- No behaviour regression
