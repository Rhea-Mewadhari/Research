# Project

Task: task6
Target: backend

## Idea

Fix three security vulnerabilities introduced by a recent change to the auth middleware and product controller. The auth middleware no longer enforces the `Bearer` prefix (auth bypass), uses `eval()` with a raw token string embedded in a template literal (code injection — crashes on `"` or `)` characters), and does not enforce a token length limit (ReDoS risk). The product controller passes `req.query.search` directly into a shell command via `child_process.exec()` (command injection). The fix requires: restoring the `Bearer` prefix check, rewriting `isValidToken` using pure string operations, adding a 200-character token length cap, and removing the `exec()` call and `child_process` import from the controller.

## Spec pointers

- `src/benchmark-backend/instructions/TASK6.md`: full requirements — three bugs to fix, two files to modify, success criteria

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/middleware/auth.ts`: auth bypass (no Bearer prefix check), eval() code injection, missing token length validation
- `src/benchmark-backend/src/controllers/productController.ts`: command injection via child_process.exec() on req.query.search
- `src/benchmark-backend/src/tests/visible/products.test.ts`: visible tests that must pass (read-only)
