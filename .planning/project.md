# Project

Task: task6
Target: backend

## Idea

Three security vulnerabilities were injected into the auth middleware and product controller. The fixes require: (1) restoring strict Bearer-prefix enforcement in auth so raw tokens without the prefix are rejected with 401, (2) removing `eval()` from `isValidToken` and replacing it with plain string/array operations that preserve the original digit-sum logic, (3) adding a 200-character token length check (returns 401) before any validation to prevent ReDoS, and (4) removing the `child_process.exec()` call (and its import) from the product controller that currently shells out with the raw search query — a command injection vulnerability.

## Spec pointers

- `src/benchmark-backend/instructions/TASK6.md`: Full task description — three security issues to fix, exact files to change, success criteria

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/middleware/auth.ts`: Auth bypass (no Bearer prefix check), eval() usage, missing token length cap — all three auth issues live here
- `src/benchmark-backend/src/controllers/productController.ts`: Command injection via child_process.exec() with unsanitised req.query.search — must be removed entirely
- `src/benchmark-backend/src/tests/visible/products.test.ts`: Visible tests (read-only) — includes the failing test "rejects a request with no Bearer prefix" that signals the auth bypass
