# Task 4: Refactor Backend Structure

## Objective
Improve code quality and maintainability in the backend without changing API behavior.

## Goals

### 1. Keep concerns in the right layer
- Business logic (filtering, sorting, searching) belongs in `src/services/productService.ts`
- Controllers should only extract query parameters and call service functions — no inline filter logic
- Routes should only wire up controllers

### 2. Type safety
- Use the `Product` interface from `src/types/product.ts` consistently
- Avoid implicit `any` in function signatures and return types

### 3. Readability
- Break up large or complex functions into smaller named helpers
- Remove unused imports and dead code

### 4. Avoid duplication
- If the same logic appears in more than one place, consolidate it into a shared function

## Constraints
- Do not change API behavior (route paths, response format, query parameter names)
- Do not break existing visible tests

## Expected Files to Modify
- `src/services/productService.ts`
- `src/controllers/productController.ts`

## Success Criteria
- All visible tests pass
- All filtering and sorting logic lives in the service layer, not in controllers or routes
- No TypeScript errors
- No unused imports or dead code
