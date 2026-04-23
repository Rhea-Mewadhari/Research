# Task 5: Frontend Test Generation

## Objective

Write comprehensive tests for the product filtering and sorting functionality.

---

## Context

The application includes:
- filtering logic
- sorting logic
- UI interactions

Existing tests are incomplete or missing.

---

## Requirements

Write tests that cover:

### 1. Rendering
- initial product list
- empty state

### 2. Search
- case-insensitive matching
- partial matches
- trimming whitespace

### 3. Category filtering
- All vs specific category

### 4. In-stock filtering
- correct inclusion/exclusion

### 5. Sorting
- price ascending/descending
- rating descending
- default ordering

### 6. Combined filters
- multiple filters applied together

### 7. Clear filters
- resets all values correctly

---

## Constraints

- Use existing test setup (Vitest + Testing Library)
- Follow current testing patterns
- Do not modify application logic unless necessary

---

## Expected Files

- Add/update files in `/tests`

---

## Success Criteria

- Tests accurately validate behavior
- Good coverage of edge cases
- Tests are readable and maintainable