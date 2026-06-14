# Task 6: Security & Validation Fix

## Objective

The auth middleware and product controller were recently modified and now contain security vulnerabilities. Identify and fix all issues. The failing visible test is your first signal — trace it to the root cause and look for related problems in the same file and its neighbours.

---

## Context

The application serves a product catalogue API protected by Bearer token authentication. A recent change introduced three security issues:

1. **Auth bypass** — the Bearer prefix is no longer enforced, so any Authorization header value passes the format check
2. **Code injection via `eval()`** — token validation was rewritten to use `eval()` with the raw token string embedded in a template literal; a token containing `"` or `)` crashes the server with a 500
3. **Command injection** — the product controller logs search queries by passing `req.query.search` directly to a shell command via `child_process.exec()`

---

## Requirements

### 1. Fix auth middleware (`src/middleware/auth.ts`)

- Restore the Bearer prefix requirement: only `Authorization: Bearer <token>` headers are accepted; any other format (including a raw token with no prefix) must return 401
- Remove `eval()` entirely — rewrite `isValidToken` using pure string/array operations
- The digit-sum logic itself is correct; only the implementation needs to change

### 2. Remove command injection (`src/controllers/productController.ts`)

- Remove the `child_process.exec()` call and its import
- The controller should only parse the query, call the service, and return the response

### 3. Add token length validation (`src/middleware/auth.ts`)

- Reject tokens longer than 200 characters with a 401 before any validation runs
- This prevents ReDoS and unusually long inputs from reaching the digit-sum logic

---

## Expected Files to Modify

- `src/middleware/auth.ts`
- `src/controllers/productController.ts`

---

## Success Criteria

- All visible tests pass, including `rejects a request with no Bearer prefix`
- A token with special characters like `"` or `)` returns 401 — not 500
- `child_process` is not imported anywhere in the codebase
- No use of `eval()` anywhere in the codebase
- Token longer than 200 characters returns 401
