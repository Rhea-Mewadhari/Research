# Project

Task: task6
Target: backend

## Idea

Fix three security vulnerabilities introduced by a recent change to the auth middleware and product controller: (1) the Bearer prefix check was removed so any Authorization header value passes; (2) token validation was rewritten using `eval()` with raw token content interpolated into a template literal, causing crashes on special characters and enabling code injection; (3) the product controller logs search queries by passing `req.query.search` directly to a shell command via `child_process.exec()`, enabling command injection. The fix restores proper Bearer prefix enforcement, replaces `eval()` with pure string/array operations while preserving the digit-sum logic, adds a 200-character token length cap to prevent ReDoS, and removes the `child_process.exec()` call entirely.

## Spec pointers

- `src/benchmark-backend/instructions/TASK6.md`: Full task description — three bugs to fix, two files to modify, success criteria including test list

## Affected areas (initial read, not final)

- `src/benchmark-backend/src/middleware/auth.ts`: Contains `eval()`-based `isValidToken` and missing Bearer prefix check — primary fix target
- `src/benchmark-backend/src/controllers/productController.ts`: Contains `child_process.exec()` command injection — secondary fix target
- `src/benchmark-backend/src/tests/visible/`: Visible tests that must pass after fix
