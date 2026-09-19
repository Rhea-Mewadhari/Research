# Project

Task: task6
Target: backend

## Idea

The auth middleware and product controller have three injected security vulnerabilities that need to be fixed. First, the Bearer token prefix check was removed, so any Authorization header value passes authentication. Second, the token validation function was rewritten using `eval()` with the token embedded in a template literal, enabling code injection and crashing on tokens with special characters. Third, the product controller logs search queries by piping `req.query.search` directly into a shell command via `child_process.exec()`, enabling OS command injection. The fix is to restore proper Bearer prefix enforcement, rewrite `isValidToken` using pure string operations (preserving the digit-sum logic), add a 200-character token length cap, and remove the `exec()` call and `child_process` import from the controller entirely.

## Spec pointers

- src/benchmark-backend/instructions/TASK6.md: Full task description covering all three vulnerabilities, requirements for each fix, the two files to modify, and success criteria

## Affected areas (initial read, not final)

- src/benchmark-backend/src/middleware/auth.ts: Contains the auth bypass (no Bearer prefix check) and the eval()-based isValidToken; needs Bearer enforcement, eval removal, pure digit-sum rewrite, and 200-char length limit
- src/benchmark-backend/src/controllers/productController.ts: Contains the child_process.exec() command injection logging; needs the exec call and import removed
- src/benchmark-backend/src/tests/visible/: Visible tests that must pass, including "rejects a request with no Bearer prefix"
