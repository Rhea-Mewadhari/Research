# Project

Task: task6
Target: backend

## Idea

Fix three security vulnerabilities introduced by a recent change to the auth middleware and product controller: (1) the Bearer prefix is no longer enforced so any Authorization header value passes; (2) token validation uses `eval()` with the raw token embedded in a template literal, causing crashes on special characters and enabling code injection; (3) the product controller passes `req.query.search` directly to `child_process.exec()`, enabling command injection. Additionally, add a token length guard (>200 chars → 401) to prevent ReDoS. The digit-sum logic for token validity is correct and must be preserved, only its implementation must change.

## Spec pointers

- `src/benchmark-backend/instructions/TASK6.md`: Full description of all three vulnerabilities, the required fixes, expected files to modify, and success criteria

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/middleware/auth.ts`: Contains the auth bypass (no Bearer prefix check), the `eval()`-based `isValidToken`, and is where the token length guard must be added
- `src/benchmark-backend/src/controllers/productController.ts`: Contains the `child_process.exec()` command injection and its import, both of which must be removed
- `src/benchmark-backend/src/tests/visible/products.test.ts`: Visible tests — read-only reference to understand what the passing criteria look like
