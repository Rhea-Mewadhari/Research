# Task 6: Frontend Integration Task

## Objective

Modify the application to fetch product data asynchronously instead of using a static dataset.

---

## Context

Currently, products are loaded from a local file.

You must simulate integration with an external API.

---

## Requirements

### 1. Data fetching
- Replace static import with async data loading
- Simulate API using a Promise or mock fetch

### 2. Loading state
- Display a loading indicator while fetching data

### 3. Error handling
- Handle failure scenarios gracefully

### 4. Filtering compatibility
- Existing filtering and sorting must still work

---

## Constraints

- Do not introduce real backend services
- Keep implementation simple and deterministic
- Do not break existing filtering logic

---

## Expected Files to Modify

- `App.tsx`
- possibly create a new data service

---

## Success Criteria

- Data loads asynchronously
- UI handles loading and error states
- Filtering continues to work correctly
- Tests pass